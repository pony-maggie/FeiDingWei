import { describe, expect, it } from "vitest";
import { prisma } from "../db";
import { createMessageAndMaybeRunAgent, extractAssistantText } from "../agent-service";
import { createDefaultFauxResponses } from "../pi-runtime";
import { getDefaultRoomId } from "../room-service";

describe("pi-backed agent service helpers", () => {
  it("creates default faux responses with tool calls for PM Agent", () => {
    const responses = createDefaultFauxResponses("pm-agent");

    expect(responses).toHaveLength(2);
    const first = responses[0];
    expect(first.content.filter((block) => block.type === "toolCall")).toHaveLength(4);
  });

  it("creates default faux responses with a document tool for Doc Agent", () => {
    const responses = createDefaultFauxResponses("doc-agent");
    const first = responses[0];

    expect(first.content.filter((block) => block.type === "toolCall")).toHaveLength(1);
  });

  it("extracts assistant text from Pi agent messages", () => {
    const text = extractAssistantText([
      { role: "user", content: "hello" },
      {
        role: "assistant",
        content: [
          { type: "text", text: "Agent completed the run." },
          { type: "toolCall", id: "tool-1", name: "create_draft_task", arguments: {} }
        ]
      }
    ]);

    expect(text).toBe("Agent completed the run.");
  });
});

describe("pi-backed agent orchestration", () => {
  it("turns a PM Agent mention into draft tasks, a draft document, and a completed run", async () => {
    const roomId = await getDefaultRoomId();
    expect(roomId).toBeTypeOf("string");

    const beforeTasks = await prisma.task.count({
      where: { roomId: roomId!, artifactStatus: "draft" }
    });
    const beforeDocs = await prisma.document.count({
      where: { roomId: roomId!, artifactStatus: "draft" }
    });

    const result = await createMessageAndMaybeRunAgent({
      roomId: roomId!,
      body: "@PMAgent summarize this project room and create draft tasks"
    });

    const afterTasks = await prisma.task.count({
      where: { roomId: roomId!, artifactStatus: "draft" }
    });
    const afterDocs = await prisma.document.count({
      where: { roomId: roomId!, artifactStatus: "draft" }
    });
    const agentMessage = await prisma.message.findFirst({
      where: { roomId: roomId!, agentId: { not: null } },
      orderBy: { createdAt: "desc" }
    });

    expect(result.agentRun?.status).toBe("completed");
    expect(result.agentRun?.output).toContain("PM Agent created draft tasks");
    expect(afterTasks - beforeTasks).toBe(3);
    expect(afterDocs - beforeDocs).toBe(1);
    expect(agentMessage?.body).toContain("PM Agent created draft tasks");
  });
});
