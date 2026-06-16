import { describe, expect, it } from "vitest";
import { prisma } from "../db";
import {
  buildRoomAgentCollaborationContext,
  createMessageAndMaybeRunAgent,
  extractAssistantText,
  sanitizeAgentRunError
} from "../agent-service";
import { createDefaultFauxResponses, createRoomAgent } from "../pi-runtime";
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

  it("creates a Pi agent with an OpenAI model when configured", () => {
    const agent = createRoomAgent({
      agentSlug: "pm-agent",
      agentName: "PM Agent",
      roomName: "Launch Room",
      tools: [],
      llmConfig: { mode: "openai", provider: "openai", model: "gpt-5.5" }
    });

    expect(agent.state.model.provider).toBe("openai");
    expect(agent.state.model.id).toBe("gpt-5.5");
  });

  it("adds member-aware collaboration context to the agent system prompt", () => {
    const agent = createRoomAgent({
      agentSlug: "pm-agent",
      agentName: "PM Agent",
      roomName: "Launch Room",
      tools: [],
      collaborationContext: "Current user: Product <product@feidingwei.local>"
    });

    expect(agent.state.systemPrompt).toContain("Current user: Product <product@feidingwei.local>");
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

  it("redacts API keys from persisted agent run errors", () => {
    const sanitized = sanitizeAgentRunError("OpenAI request failed for key sk-test-secret-value.");

    expect(sanitized).toBe("OpenAI request failed for key [REDACTED_API_KEY].");
    expect(sanitized).not.toContain("sk-test-secret-value");
  });
});

describe("pi-backed agent orchestration", () => {
  it("builds member-aware room context for agents", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    await prisma.task.create({
      data: {
        title: "Blocked API contract",
        description: "Needs product input.",
        status: "todo",
        priority: "high",
        artifactStatus: "draft",
        assigneeId: engineer.id,
        reviewerId: qa.id,
        reviewStatus: "requested",
        blockedReason: "Waiting for product decision.",
        roomId: roomId!
      }
    });

    const context = await buildRoomAgentCollaborationContext({
      roomId: roomId!,
      currentUserId: product.id
    });

    expect(context).toContain("Current user: Product <product@feidingwei.local>");
    expect(context).toContain("QA <qa@feidingwei.local> roomRole=reviewer function=qa");
    expect(context).toContain("Blocked API contract assignee=Engineer reviewer=QA review=requested");
    expect(context).toContain("blocked=Waiting for product decision.");
  });

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
      body: "@PMAgent summarize this project room and create draft tasks",
      llmConfig: { mode: "faux", reason: "Test uses deterministic faux provider." }
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
