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

const CreateDraftDecisionParameters = Type.Object({
  title: Type.String({ minLength: 1 }),
  body: Type.String({ minLength: 1 })
});

const SuggestAssigneeParameters = Type.Object({
  artifactTitle: Type.String({ minLength: 1 }),
  memberEmail: Type.String({ minLength: 1 }),
  reason: Type.String({ minLength: 1 }),
  confidence: Type.Union([Type.Literal("low"), Type.Literal("medium"), Type.Literal("high")])
});

const RequestReviewParameters = Type.Object({
  artifactTitle: Type.String({ minLength: 1 }),
  reviewerEmail: Type.String({ minLength: 1 }),
  reason: Type.String({ minLength: 1 })
});

const SummarizeBlockersParameters = Type.Object({});

type CreateDraftTaskInput = Static<typeof CreateDraftTaskParameters>;
type CreateDraftDocumentInput = Static<typeof CreateDraftDocumentParameters>;
type CreateDraftDecisionInput = Static<typeof CreateDraftDecisionParameters>;
type SuggestAssigneeInput = Static<typeof SuggestAssigneeParameters>;
type RequestReviewInput = Static<typeof RequestReviewParameters>;
type SummarizeBlockersInput = Static<typeof SummarizeBlockersParameters>;

export type RoomArtifactToolHandlers = {
  createDraftTask(input: CreateDraftTaskInput): Promise<{ id: string; title: string }>;
  createDraftDocument(input: CreateDraftDocumentInput): Promise<{ id: string; title: string }>;
  createDraftDecision?(input: CreateDraftDecisionInput): Promise<{ id: string; title: string }>;
  suggestAssignee?(input: SuggestAssigneeInput): Promise<{
    artifactTitle: string;
    memberEmail: string;
    confidence: string;
  }>;
  requestReview?(input: RequestReviewInput): Promise<{
    artifactTitle: string;
    reviewerEmail: string;
    reviewStatus: string;
  }>;
  summarizeBlockers?(input: SummarizeBlockersInput): Promise<{ blockers: string[] }>;
};

export function buildRoomArtifactTools(handlers: RoomArtifactToolHandlers): AgentTool[] {
  const tools: AgentTool[] = [
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

  if (handlers.suggestAssignee) {
    tools.push({
      name: "suggest_assignee",
      label: "Suggest assignee",
      description:
        "Suggest a human assignee for a draft artifact using room member context. This does not assign or approve the artifact.",
      parameters: SuggestAssigneeParameters,
      executionMode: "sequential",
      execute: async (_toolCallId, params) => {
        const suggestionParams = params as SuggestAssigneeInput;
        const suggestion = await handlers.suggestAssignee!(suggestionParams);

        return {
          content: [
            {
              type: "text",
              text: `Assignee suggested: ${suggestion.memberEmail} for ${suggestion.artifactTitle}`
            }
          ],
          details: suggestion
        };
      }
    });
  }

  if (handlers.createDraftDecision) {
    tools.push({
      name: "create_draft_decision",
      label: "Create draft decision",
      description:
        "Create a draft decision record in the current project room for human review and traceability.",
      parameters: CreateDraftDecisionParameters,
      executionMode: "sequential",
      execute: async (_toolCallId, params) => {
        const decisionParams = params as CreateDraftDecisionInput;
        const decision = await handlers.createDraftDecision!(decisionParams);

        return {
          content: [{ type: "text", text: `Draft decision created: ${decision.title}` }],
          details: decision
        };
      }
    });
  }

  if (handlers.requestReview) {
    tools.push({
      name: "request_review",
      label: "Request review",
      description:
        "Suggest a human reviewer for a draft artifact. This records review intent without approving the artifact.",
      parameters: RequestReviewParameters,
      executionMode: "sequential",
      execute: async (_toolCallId, params) => {
        const reviewParams = params as RequestReviewInput;
        const review = await handlers.requestReview!(reviewParams);

        return {
          content: [
            {
              type: "text",
              text: `Review request suggested: ${review.reviewerEmail} for ${review.artifactTitle}`
            }
          ],
          details: review
        };
      }
    });
  }

  if (handlers.summarizeBlockers) {
    tools.push({
      name: "summarize_blockers",
      label: "Summarize blockers",
      description: "Summarize visible blocked or returned artifacts for human follow-up.",
      parameters: SummarizeBlockersParameters,
      executionMode: "sequential",
      execute: async (_toolCallId, params) => {
        const blockerParams = params as SummarizeBlockersInput;
        const summary = await handlers.summarizeBlockers!(blockerParams);

        return {
          content: [
            {
              type: "text",
              text: `Blockers summarized: ${summary.blockers.length} item(s)`
            }
          ],
          details: summary
        };
      }
    });
  }

  return tools;
}
