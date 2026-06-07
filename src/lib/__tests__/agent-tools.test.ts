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
});
