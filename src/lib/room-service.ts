import { prisma } from "./db";
import { defaultAgents, type RoomRole } from "./domain";

export class DraftArtifactMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DraftArtifactMutationError";
  }
}

export function isDraftArtifactMutationError(
  error: unknown
): error is DraftArtifactMutationError {
  return error instanceof DraftArtifactMutationError;
}

type SortableMessage = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string } | null;
  agent: { name: string } | null;
};

type TraceableTask = {
  id: string;
  title: string;
  description: string;
  artifactStatus: string;
  reviewStatus?: string;
  blockedReason?: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  reviewer?: { id: string; name: string; email: string } | null;
  comments?: Array<{
    id: string;
    body: string;
    createdAt: Date;
    author: { name: string } | null;
  }>;
  sourceMessageId?: string | null;
  sourceRunId?: string | null;
};

type TraceableDocument = {
  id: string;
  title: string;
  body: string;
  artifactStatus: string;
  reviewStatus?: string;
  blockedReason?: string | null;
  owner?: { id: string; name: string; email: string } | null;
  reviewer?: { id: string; name: string; email: string } | null;
  comments?: Array<{
    id: string;
    body: string;
    createdAt: Date;
    author: { name: string } | null;
  }>;
  sourceMessageId?: string | null;
  sourceRunId?: string | null;
};

type TraceableDecision = {
  id: string;
  title: string;
  body: string;
  status: string;
  creator?: { name: string } | null;
  sourceMessageId?: string | null;
  sourceRunId?: string | null;
};

type TraceableRun = {
  id: string;
  status: string;
  input: string;
  output: string;
  error?: string | null;
  sourceMessageId?: string | null;
  agent: { name: string; slug: string };
};

type RoomInput = {
  id: string;
  name: string;
  description: string;
  roomMemberships?: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  messages: SortableMessage[];
  tasks: TraceableTask[];
  documents: TraceableDocument[];
  decisions?: TraceableDecision[];
  agents: unknown[];
  agentRuns: TraceableRun[];
};

export function buildRoomViewModel<T extends RoomInput>(room: T) {
  const sortedRoom = {
    ...room,
    members:
      room.roomMemberships
        ?.map((membership) => membership.user)
        .sort((a, b) => a.name.localeCompare(b.name)) ?? [],
    messages: [...room.messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  };

  return attachTraceMetadata(sortedRoom);
}

function attachTraceMetadata<T extends RoomInput>(room: T) {
  const messagesById = new Map(room.messages.map((message) => [message.id, message]));
  const runsById = new Map(room.agentRuns.map((run) => [run.id, run]));

  const tasks = room.tasks.map((task) => ({
    ...task,
    trace:
      task.sourceMessageId || task.sourceRunId
        ? {
            sourceMessage: task.sourceMessageId ? messagesById.get(task.sourceMessageId) ?? null : null,
            sourceRun: task.sourceRunId ? runsById.get(task.sourceRunId) ?? null : null
          }
        : null
  }));

  const documents = room.documents.map((document) => ({
    ...document,
    trace:
      document.sourceMessageId || document.sourceRunId
        ? {
            sourceMessage: document.sourceMessageId
              ? messagesById.get(document.sourceMessageId) ?? null
              : null,
            sourceRun: document.sourceRunId ? runsById.get(document.sourceRunId) ?? null : null
          }
        : null
  }));

  const decisions = (room.decisions ?? []).map((decision) => ({
    ...decision,
    trace:
      decision.sourceMessageId || decision.sourceRunId
        ? {
            sourceMessage: decision.sourceMessageId
              ? messagesById.get(decision.sourceMessageId) ?? null
              : null,
            sourceRun: decision.sourceRunId ? runsById.get(decision.sourceRunId) ?? null : null
          }
        : null
  }));

  const agentRuns = room.agentRuns.map((run) => ({
    ...run,
    sourceMessage: run.sourceMessageId ? messagesById.get(run.sourceMessageId) ?? null : null,
    generatedTasks: tasks.filter((task) => task.sourceRunId === run.id),
    generatedDocuments: documents.filter((document) => document.sourceRunId === run.id),
    generatedDecisions: decisions.filter((decision) => decision.sourceRunId === run.id)
  }));

  return { ...room, tasks, documents, decisions, agentRuns };
}

export function summarizeDraftCounts(input: {
  tasks: { artifactStatus: string }[];
  documents: { artifactStatus: string }[];
}) {
  return {
    draftTasks: input.tasks.filter((task) => task.artifactStatus === "draft").length,
    draftDocs: input.documents.filter((doc) => doc.artifactStatus === "draft").length
  };
}

export async function getDefaultRoomId() {
  const room = await prisma.projectRoom.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true }
  });

  return room?.id ?? null;
}

export type AccessibleRoom = {
  id: string;
  name: string;
};

export async function listAccessibleRooms(
  userId: string,
  workspaceId: string
): Promise<AccessibleRoom[]> {
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    select: { role: true }
  });

  const canSeeAllWorkspaceRooms = membership ? ["owner", "admin"].includes(membership.role) : false;

  const rooms = await prisma.projectRoom.findMany({
    where: canSeeAllWorkspaceRooms
      ? { workspaceId }
      : {
          workspaceId,
          roomMemberships: { some: { userId } }
        },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" }
  });

  return rooms;
}

export async function createProjectRoomWithMembers(input: {
  workspaceId: string;
  creatorId: string;
  name: string;
  description: string;
  members: Array<{ userId: string; role: RoomRole }>;
}) {
  const workspaceMembers = await prisma.membership.findMany({
    where: { workspaceId: input.workspaceId },
    select: { userId: true }
  });
  const workspaceUserIds = new Set(workspaceMembers.map((membership) => membership.userId));

  if (!workspaceUserIds.has(input.creatorId)) {
    throw new Error("Room creator must be a workspace member.");
  }

  const roleByUserId = new Map<string, RoomRole>();

  for (const member of input.members) {
    if (workspaceUserIds.has(member.userId)) {
      roleByUserId.set(member.userId, member.role);
    }
  }
  roleByUserId.set(input.creatorId, "room_lead");

  return prisma.$transaction(async (transaction) => {
    const room = await transaction.projectRoom.create({
      data: {
        name: input.name.trim(),
        description: input.description.trim(),
        workspaceId: input.workspaceId
      }
    });

    await transaction.roomMembership.createMany({
      data: Array.from(roleByUserId.entries()).map(([userId, role]) => ({
        userId,
        role,
        roomId: room.id
      }))
    });

    await transaction.agent.createMany({
      data: defaultAgents.map((agent) => ({
        slug: agent.slug,
        name: agent.name,
        role: agent.role,
        description: agent.description,
        capabilities: JSON.stringify(agent.capabilities),
        roomId: room.id
      }))
    });

    return room;
  });
}

export async function getProjectRoom(roomId: string) {
  const room = await prisma.projectRoom.findUnique({
    where: { id: roomId },
    include: {
      workspace: true,
      roomMemberships: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      },
      messages: {
        include: {
          author: { select: { name: true } },
          agent: { select: { name: true } }
        }
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          reviewer: { select: { id: true, name: true, email: true } },
          comments: {
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      documents: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          reviewer: { select: { id: true, name: true, email: true } },
          comments: {
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      decisions: {
        include: {
          creator: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      agents: {
        orderBy: { name: "asc" }
      },
      agentRuns: {
        include: {
          agent: { select: { name: true, slug: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return room ? buildRoomViewModel(room) : null;
}

export async function approveTask(taskId: string) {
  const result = await prisma.task.updateMany({
    where: { id: taskId, artifactStatus: "draft" },
    data: { artifactStatus: "active", reviewStatus: "approved", blockedReason: null }
  });

  if (result.count === 0) {
    throw new DraftArtifactMutationError("Only draft task artifacts can be approved.");
  }

  return prisma.task.findUniqueOrThrow({ where: { id: taskId } });
}

export async function updateDraftTask(
  taskId: string,
  input: { title: string; description: string; priority: string }
) {
  const result = await prisma.task.updateMany({
    where: { id: taskId, artifactStatus: "draft" },
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority
    }
  });

  if (result.count === 0) {
    throw new DraftArtifactMutationError("Only draft task artifacts can be edited.");
  }

  return prisma.task.findUniqueOrThrow({ where: { id: taskId } });
}

export async function rejectTask(taskId: string) {
  const result = await prisma.task.updateMany({
    where: { id: taskId, artifactStatus: "draft" },
    data: { artifactStatus: "rejected" }
  });

  if (result.count === 0) {
    throw new DraftArtifactMutationError("Only draft task artifacts can be rejected.");
  }

  return prisma.task.findUniqueOrThrow({ where: { id: taskId } });
}

export async function approveDocument(documentId: string) {
  const result = await prisma.document.updateMany({
    where: { id: documentId, artifactStatus: "draft" },
    data: { artifactStatus: "active", reviewStatus: "approved", blockedReason: null }
  });

  if (result.count === 0) {
    throw new DraftArtifactMutationError("Only draft document artifacts can be approved.");
  }

  return prisma.document.findUniqueOrThrow({ where: { id: documentId } });
}

export async function updateDraftDocument(
  documentId: string,
  input: { title: string; body: string }
) {
  const result = await prisma.document.updateMany({
    where: { id: documentId, artifactStatus: "draft" },
    data: {
      title: input.title,
      body: input.body
    }
  });

  if (result.count === 0) {
    throw new DraftArtifactMutationError("Only draft document artifacts can be edited.");
  }

  return prisma.document.findUniqueOrThrow({ where: { id: documentId } });
}

export async function rejectDocument(documentId: string) {
  const result = await prisma.document.updateMany({
    where: { id: documentId, artifactStatus: "draft" },
    data: { artifactStatus: "rejected" }
  });

  if (result.count === 0) {
    throw new DraftArtifactMutationError("Only draft document artifacts can be rejected.");
  }

  return prisma.document.findUniqueOrThrow({ where: { id: documentId } });
}
