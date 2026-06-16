import { buildRoomArtifactTools } from "./agent-tools";
import { prisma } from "./db";
import { createDraftDecision } from "./decision-service";
import { extractAgentSlug } from "./domain";
import type { LlmRuntimeConfig } from "./llm-config";
import { listWorkspaceMembers } from "./member-service";
import { createMentionNotificationsForMessage } from "./mention-service";
import { createRoomAgent } from "./pi-runtime";

export function extractAssistantText(messages: Array<{ role: string; content?: unknown }>) {
  const assistant = [...messages].reverse().find((message) => message.role === "assistant");

  if (!assistant || !Array.isArray(assistant.content)) {
    return "";
  }

  return assistant.content
    .filter((block): block is { type: "text"; text: string } => {
      return (
        typeof block === "object" &&
        block !== null &&
        "type" in block &&
        (block as { type: unknown }).type === "text" &&
        "text" in block &&
        typeof (block as { text: unknown }).text === "string"
      );
    })
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export function sanitizeAgentRunError(message: string) {
  return message.replace(/\bsk-[A-Za-z0-9_-]+\b/g, "[REDACTED_API_KEY]");
}

export async function buildRoomAgentCollaborationContext(input: {
  roomId: string;
  currentUserId: string;
}) {
  const room = await prisma.projectRoom.findUniqueOrThrow({
    where: { id: input.roomId },
    select: { workspaceId: true }
  });
  const [members, tasks, documents] = await Promise.all([
    listWorkspaceMembers(room.workspaceId),
    prisma.task.findMany({
      where: {
        roomId: input.roomId,
        artifactStatus: "draft",
        OR: [
          { assigneeId: { not: null } },
          { reviewerId: { not: null } },
          { blockedReason: { not: null } },
          { reviewStatus: { not: "none" } }
        ]
      },
      include: {
        assignee: { select: { name: true, email: true } },
        reviewer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.document.findMany({
      where: {
        roomId: input.roomId,
        artifactStatus: "draft",
        OR: [
          { ownerId: { not: null } },
          { reviewerId: { not: null } },
          { blockedReason: { not: null } },
          { reviewStatus: { not: "none" } }
        ]
      },
      include: {
        owner: { select: { name: true, email: true } },
        reviewer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);
  const roomMembers = members.filter((member) =>
    member.activeRooms.some((activeRoom) => activeRoom.id === input.roomId)
  );
  const currentUser = roomMembers.find((member) => member.id === input.currentUserId);
  const lines = [
    currentUser
      ? `Current user: ${currentUser.name} <${currentUser.email}> workspaceRole=${currentUser.workspaceRole} function=${currentUser.functionLabel}`
      : "Current user: unknown",
    "Room members:",
    ...roomMembers.map((member) => {
      const roomRole =
        member.activeRooms.find((activeRoom) => activeRoom.id === input.roomId)?.roomRole ??
        "unknown";
      return `- ${member.name} <${member.email}> roomRole=${roomRole} function=${member.functionLabel} team=${member.team?.name ?? "-"}`;
    }),
    "Pending task review and blockers:",
    ...(tasks.length
      ? tasks.map((task) =>
          [
            `- ${task.title}`,
            `assignee=${task.assignee?.name ?? "-"}`,
            `reviewer=${task.reviewer?.name ?? "-"}`,
            `review=${task.reviewStatus}`,
            task.blockedReason ? `blocked=${task.blockedReason}` : null
          ]
            .filter(Boolean)
            .join(" ")
        )
      : ["- none"]),
    "Pending document review and blockers:",
    ...(documents.length
      ? documents.map((document) =>
          [
            `- ${document.title}`,
            `owner=${document.owner?.name ?? "-"}`,
            `reviewer=${document.reviewer?.name ?? "-"}`,
            `review=${document.reviewStatus}`,
            document.blockedReason ? `blocked=${document.blockedReason}` : null
          ]
            .filter(Boolean)
            .join(" ")
        )
      : ["- none"])
  ];

  return lines.join("\n");
}

async function summarizeRoomBlockers(roomId: string) {
  const [tasks, documents] = await Promise.all([
    prisma.task.findMany({
      where: { roomId, artifactStatus: "draft", blockedReason: { not: null } },
      select: { title: true, blockedReason: true },
      orderBy: { updatedAt: "desc" },
      take: 10
    }),
    prisma.document.findMany({
      where: { roomId, artifactStatus: "draft", blockedReason: { not: null } },
      select: { title: true, blockedReason: true },
      orderBy: { updatedAt: "desc" },
      take: 10
    })
  ]);

  return [
    ...tasks.map((task) => `Task ${task.title}: ${task.blockedReason}`),
    ...documents.map((document) => `Document ${document.title}: ${document.blockedReason}`)
  ];
}

export async function createMessageAndMaybeRunAgent(input: {
  roomId: string;
  body: string;
  authorId?: string;
  llmConfig?: LlmRuntimeConfig;
}) {
  const user = input.authorId
    ? await prisma.user.findUnique({ where: { id: input.authorId } })
    : await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

  if (!user) {
    throw new Error("Seed user is required before creating messages.");
  }

  const message = await prisma.message.create({
    data: {
      body: input.body,
      roomId: input.roomId,
      authorId: user.id
    }
  });

  await createMentionNotificationsForMessage({
    messageId: message.id,
    roomId: input.roomId,
    actorId: user.id,
    body: input.body
  });

  const agentSlug = extractAgentSlug(input.body);

  if (!agentSlug) {
    return { message, agentRun: null };
  }

  const roomAgentConfig = await prisma.agent.findUnique({
    where: {
      slug_roomId: {
        slug: agentSlug,
        roomId: input.roomId
      }
    },
    include: {
      room: { select: { name: true } }
    }
  });

  if (!roomAgentConfig) {
    throw new Error(`Agent ${agentSlug} is not configured for this room.`);
  }

  const startedRun = await prisma.agentRun.create({
    data: {
      status: "running",
      input: input.body,
      output: "",
      agentId: roomAgentConfig.id,
      roomId: input.roomId,
      sourceMessageId: message.id
    }
  });

  const tools = buildRoomArtifactTools({
    createDraftTask: async (task) => {
      return prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: "todo",
          artifactStatus: "draft",
          roomId: input.roomId,
          sourceMessageId: message.id,
          sourceRunId: startedRun.id
        },
        select: { id: true, title: true }
      });
    },
    createDraftDocument: async (document) => {
      return prisma.document.create({
        data: {
          title: document.title,
          body: document.body,
          artifactStatus: "draft",
          roomId: input.roomId,
          sourceMessageId: message.id,
          sourceRunId: startedRun.id
        },
        select: { id: true, title: true }
      });
    },
    createDraftDecision: async (decision) => {
      return createDraftDecision({
        title: decision.title,
        body: decision.body,
        roomId: input.roomId,
        sourceMessageId: message.id,
        sourceRunId: startedRun.id
      });
    },
    suggestAssignee: async (suggestion) => ({
      artifactTitle: suggestion.artifactTitle,
      memberEmail: suggestion.memberEmail,
      confidence: suggestion.confidence
    }),
    requestReview: async (review) => ({
      artifactTitle: review.artifactTitle,
      reviewerEmail: review.reviewerEmail,
      reviewStatus: "requested"
    }),
    summarizeBlockers: async () => ({
      blockers: await summarizeRoomBlockers(input.roomId)
    })
  });
  const collaborationContext = await buildRoomAgentCollaborationContext({
    roomId: input.roomId,
    currentUserId: user.id
  });

  const roomAgent = createRoomAgent({
    agentSlug,
    agentName: roomAgentConfig.name,
    roomName: roomAgentConfig.room.name,
    tools,
    llmConfig: input.llmConfig,
    collaborationContext
  });

  try {
    await roomAgent.prompt(input.body);
    const output =
      extractAssistantText(roomAgent.state.messages) ||
      `${roomAgentConfig.name} completed the run.`;

    await prisma.message.create({
      data: {
        body: output,
        roomId: input.roomId,
        agentId: roomAgentConfig.id
      }
    });

    const agentRun = await prisma.agentRun.update({
      where: { id: startedRun.id },
      data: {
        status: "completed",
        output
      }
    });

    return { message, agentRun };
  } catch (error) {
    const errorMessage = sanitizeAgentRunError(
      error instanceof Error ? error.message : "Agent run failed."
    );
    const agentRun = await prisma.agentRun.update({
      where: { id: startedRun.id },
      data: {
        status: "failed",
        error: errorMessage,
        output: ""
      }
    });

    return { message, agentRun };
  }
}
