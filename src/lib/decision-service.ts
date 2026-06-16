import { prisma } from "./db";

type TraceSourceMessage = {
  id: string;
  body: string;
  author: { name: string } | null;
  agent: { name: string } | null;
};

type TraceSourceRun = {
  id: string;
  status: string;
  input: string;
  output: string;
  error?: string | null;
  agent: { name: string; slug: string };
};

type DecisionWithTraceInput = {
  sourceMessage: TraceSourceMessage | null;
  sourceRun: TraceSourceRun | null;
};

export function attachDecisionTrace<T extends DecisionWithTraceInput>(decision: T) {
  return {
    ...decision,
    trace:
      decision.sourceMessage || decision.sourceRun
        ? {
            sourceMessage: decision.sourceMessage,
            sourceRun: decision.sourceRun
          }
        : null
  };
}

export async function createDecision(input: {
  roomId: string;
  creatorId: string;
  title: string;
  body: string;
  sourceMessageId?: string | null;
  sourceRunId?: string | null;
}) {
  return prisma.decision.create({
    data: {
      roomId: input.roomId,
      creatorId: input.creatorId,
      title: input.title,
      body: input.body,
      status: "active",
      sourceMessageId: input.sourceMessageId ?? null,
      sourceRunId: input.sourceRunId ?? null
    }
  });
}

export async function createDraftDecision(input: {
  roomId: string;
  title: string;
  body: string;
  sourceMessageId?: string | null;
  sourceRunId?: string | null;
}) {
  return prisma.decision.create({
    data: {
      roomId: input.roomId,
      title: input.title,
      body: input.body,
      status: "draft",
      sourceMessageId: input.sourceMessageId ?? null,
      sourceRunId: input.sourceRunId ?? null
    }
  });
}

export async function listRoomDecisions(roomId: string) {
  const decisions = await prisma.decision.findMany({
    where: { roomId },
    include: {
      creator: { select: { name: true } },
      sourceMessage: {
        include: {
          author: { select: { name: true } },
          agent: { select: { name: true } }
        }
      },
      sourceRun: {
        include: {
          agent: { select: { name: true, slug: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return decisions.map(attachDecisionTrace);
}
