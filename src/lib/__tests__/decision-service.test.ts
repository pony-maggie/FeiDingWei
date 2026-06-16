import { describe, expect, it } from "vitest";
import { prisma } from "../db";
import {
  createDecision,
  createDraftDecision,
  listRoomDecisions
} from "../decision-service";
import { getDefaultRoomId } from "../room-service";

describe("decision service", () => {
  it("creates a human active decision from a source message", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const message = await prisma.message.create({
      data: {
        body: "We decided to keep the first release private.",
        roomId: roomId!,
        authorId: product.id
      }
    });

    const decision = await createDecision({
      roomId: roomId!,
      creatorId: product.id,
      sourceMessageId: message.id,
      title: "Private first release",
      body: "The first release stays private-deployment-first."
    });

    expect(decision.status).toBe("active");
    expect(decision.creatorId).toBe(product.id);
    expect(decision.sourceMessageId).toBe(message.id);
  });

  it("creates an agent draft decision linked to source message and run", async () => {
    const roomId = await getDefaultRoomId();
    const agent = await prisma.agent.findFirstOrThrow({ where: { roomId: roomId! } });
    const sourceMessage = await prisma.message.create({
      data: { body: "@PMAgent record the decision", roomId: roomId! }
    });
    const sourceRun = await prisma.agentRun.create({
      data: {
        status: "completed",
        input: sourceMessage.body,
        output: "Decision drafted.",
        agentId: agent.id,
        roomId: roomId!,
        sourceMessageId: sourceMessage.id
      }
    });

    const decision = await createDraftDecision({
      roomId: roomId!,
      sourceMessageId: sourceMessage.id,
      sourceRunId: sourceRun.id,
      title: "Draft launch decision",
      body: "Draft decision body."
    });

    expect(decision.status).toBe("draft");
    expect(decision.sourceMessageId).toBe(sourceMessage.id);
    expect(decision.sourceRunId).toBe(sourceRun.id);
  });

  it("lists room decisions newest first with trace metadata", async () => {
    const roomId = await getDefaultRoomId();
    const founder = await prisma.user.findUniqueOrThrow({
      where: { email: "founder@feidingwei.local" }
    });
    const message = await prisma.message.create({
      data: { body: "Decision source", roomId: roomId!, authorId: founder.id }
    });
    const older = await createDecision({
      roomId: roomId!,
      creatorId: founder.id,
      title: "Older decision",
      body: "Older body."
    });
    await prisma.decision.update({
      where: { id: older.id },
      data: { createdAt: new Date("2026-01-01T00:00:00.000Z") }
    });
    const newer = await createDecision({
      roomId: roomId!,
      creatorId: founder.id,
      sourceMessageId: message.id,
      title: "Newer decision",
      body: "Newer body."
    });

    const decisions = await listRoomDecisions(roomId!);

    expect(decisions[0].id).toBe(newer.id);
    expect(decisions[0].creator?.name).toBe("Founder");
    expect(decisions[0].trace?.sourceMessage?.body).toBe("Decision source");
  });
});
