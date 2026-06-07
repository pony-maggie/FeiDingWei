import type { AgentTool } from "@earendil-works/pi-agent-core";
import { Type, type Static } from "@earendil-works/pi-ai";

const CreateDraftTaskParameters = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.String({ minLength: 1 }),
  priority: Type.Union([Type.Literal("low"), Type.Literal("medium"), Type.Literal("high")])
});

const CreateDraftDocumentParameters = Type.Object({
  title: Type.String({ minLength: 1 }),
  body: Type.String({ minLength: 1 })
});

type CreateDraftTaskInput = Static<typeof CreateDraftTaskParameters>;
type CreateDraftDocumentInput = Static<typeof CreateDraftDocumentParameters>;

export type RoomArtifactToolHandlers = {
  createDraftTask(input: CreateDraftTaskInput): Promise<{ id: string; title: string }>;
  createDraftDocument(input: CreateDraftDocumentInput): Promise<{ id: string; title: string }>;
};

export function buildRoomArtifactTools(handlers: RoomArtifactToolHandlers): AgentTool[] {
  return [
    {
      name: "create_draft_task",
      label: "Create draft task",
      description: "Create a draft task in the current project room for human approval.",
      parameters: CreateDraftTaskParameters,
      executionMode: "sequential",
      execute: async (_toolCallId, params) => {
        const taskParams = params as CreateDraftTaskInput;
        const task = await handlers.createDraftTask(taskParams);

        return {
          content: [{ type: "text", text: `Draft task created: ${task.title}` }],
          details: task
        };
      }
    },
    {
      name: "create_draft_document",
      label: "Create draft document",
      description: "Create a draft project document in the current project room for human editing.",
      parameters: CreateDraftDocumentParameters,
      executionMode: "sequential",
      execute: async (_toolCallId, params) => {
        const documentParams = params as CreateDraftDocumentInput;
        const document = await handlers.createDraftDocument(documentParams);

        return {
          content: [{ type: "text", text: `Draft document created: ${document.title}` }],
          details: document
        };
      }
    }
  ];
}
