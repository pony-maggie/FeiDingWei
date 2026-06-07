import { buildRoomArtifactTools } from "./agent-tools";
import { prisma } from "./db";
import { extractAgentSlug } from "./domain";
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

export async function createMessageAndMaybeRunAgent(input: { roomId: string; body: string }) {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

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
    }
  });

  const roomAgent = createRoomAgent({
    agentSlug,
    agentName: roomAgentConfig.name,
    roomName: roomAgentConfig.room.name,
    tools
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
    const errorMessage = error instanceof Error ? error.message : "Agent run failed.";
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
