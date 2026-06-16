import { describe, expect, it } from "vitest";
import { buildRoomArtifactTools } from "../agent-tools";

describe("room artifact tools", () => {
  it("creates draft tasks through an injected handler", async () => {
    const tools = buildRoomArtifactTools({
      createDraftTask: async (input) => ({ id: "task-1", title: input.title }),
      createDraftDocument: async () => ({ id: "doc-1", title: "Unused" })
    });

    const createTask = tools.find((tool) => tool.name === "create_draft_task");
    expect(createTask).toBeDefined();

    const result = await createTask!.execute("tool-1", {
      title: "Clarify MVP",
      description: "Define what the first room must prove.",
      priority: "high"
    });

    expect(result.content[0]).toEqual({
      type: "text",
      text: "Draft task created: Clarify MVP"
    });
    expect(result.details).toEqual({ id: "task-1", title: "Clarify MVP" });
  });

  it("creates draft documents through an injected handler", async () => {
    const tools = buildRoomArtifactTools({
      createDraftTask: async () => ({ id: "task-1", title: "Unused" }),
      createDraftDocument: async (input) => ({ id: "doc-1", title: input.title })
    });

    const createDocument = tools.find((tool) => tool.name === "create_draft_document");
    expect(createDocument).toBeDefined();

    const result = await createDocument!.execute("tool-2", {
      title: "PRD Draft",
      body: "# PRD Draft\n\nTurn discussion into project work."
    });

    expect(result.content[0]).toEqual({
      type: "text",
      text: "Draft document created: PRD Draft"
    });
    expect(result.details).toEqual({ id: "doc-1", title: "PRD Draft" });
  });

  it("suggests assignees without mutating artifacts", async () => {
    const tools = buildRoomArtifactTools({
      createDraftTask: async () => ({ id: "task-1", title: "Unused" }),
      createDraftDocument: async () => ({ id: "doc-1", title: "Unused" }),
      suggestAssignee: async (input) => ({
        artifactTitle: input.artifactTitle,
        memberEmail: input.memberEmail,
        confidence: input.confidence
      })
    });
    const suggestAssignee = tools.find((tool) => tool.name === "suggest_assignee");

    const result = await suggestAssignee!.execute("tool-3", {
      artifactTitle: "Clarify API contract",
      memberEmail: "engineer@feidingwei.local",
      reason: "Engineering ownership",
      confidence: "medium"
    });

    expect(result.content[0]).toEqual({
      type: "text",
      text: "Assignee suggested: engineer@feidingwei.local for Clarify API contract"
    });
    expect(result.details).toEqual({
      artifactTitle: "Clarify API contract",
      memberEmail: "engineer@feidingwei.local",
      confidence: "medium"
    });
  });

  it("suggests review requests without approving artifacts", async () => {
    const tools = buildRoomArtifactTools({
      createDraftTask: async () => ({ id: "task-1", title: "Unused" }),
      createDraftDocument: async () => ({ id: "doc-1", title: "Unused" }),
      requestReview: async (input) => ({
        artifactTitle: input.artifactTitle,
        reviewerEmail: input.reviewerEmail,
        reviewStatus: "requested"
      })
    });
    const requestReview = tools.find((tool) => tool.name === "request_review");

    const result = await requestReview!.execute("tool-4", {
      artifactTitle: "PRD Draft",
      reviewerEmail: "qa@feidingwei.local",
      reason: "QA should check acceptance criteria."
    });

    expect(result.content[0]).toEqual({
      type: "text",
      text: "Review request suggested: qa@feidingwei.local for PRD Draft"
    });
    expect(result.details).toEqual({
      artifactTitle: "PRD Draft",
      reviewerEmail: "qa@feidingwei.local",
      reviewStatus: "requested"
    });
  });

  it("summarizes blockers for humans", async () => {
    const tools = buildRoomArtifactTools({
      createDraftTask: async () => ({ id: "task-1", title: "Unused" }),
      createDraftDocument: async () => ({ id: "doc-1", title: "Unused" }),
      summarizeBlockers: async () => ({
        blockers: ["Task Clarify API contract: waiting on product."]
      })
    });
    const summarizeBlockers = tools.find((tool) => tool.name === "summarize_blockers");

    const result = await summarizeBlockers!.execute("tool-5", {});

    expect(result.content[0]).toEqual({
      type: "text",
      text: "Blockers summarized: 1 item(s)"
    });
    expect(result.details).toEqual({
      blockers: ["Task Clarify API contract: waiting on product."]
    });
  });

  it("creates draft decisions through an injected handler", async () => {
    const tools = buildRoomArtifactTools({
      createDraftTask: async () => ({ id: "task-1", title: "Unused" }),
      createDraftDocument: async () => ({ id: "doc-1", title: "Unused" }),
      createDraftDecision: async (input) => ({ id: "decision-1", title: input.title })
    });
    const createDecision = tools.find((tool) => tool.name === "create_draft_decision");

    const result = await createDecision!.execute("tool-6", {
      title: "Private beta decision",
      body: "Keep the first launch private."
    });

    expect(result.content[0]).toEqual({
      type: "text",
      text: "Draft decision created: Private beta decision"
    });
    expect(result.details).toEqual({ id: "decision-1", title: "Private beta decision" });
  });
});
