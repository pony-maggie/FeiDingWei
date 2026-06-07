import { prisma } from "./db";

type SortableMessage = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string } | null;
  agent: { name: string } | null;
};

type RoomInput = {
  id: string;
  name: string;
  description: string;
  messages: SortableMessage[];
  tasks: { artifactStatus: string }[];
  documents: { artifactStatus: string }[];
  agents: unknown[];
  agentRuns: unknown[];
};

export function buildRoomViewModel<T extends RoomInput>(room: T): T {
  return {
    ...room,
    messages: [...room.messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  };
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

export async function getProjectRoom(roomId: string) {
  const room = await prisma.projectRoom.findUnique({
    where: { id: roomId },
    include: {
      workspace: true,
      messages: {
        include: {
          author: { select: { name: true } },
          agent: { select: { name: true } }
        }
      },
      tasks: {
        include: {
          assignee: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      documents: {
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
  return prisma.task.update({
    where: { id: taskId },
    data: { artifactStatus: "active" }
  });
}

export async function approveDocument(documentId: string) {
  return prisma.document.update({
    where: { id: documentId },
    data: { artifactStatus: "active" }
  });
}
