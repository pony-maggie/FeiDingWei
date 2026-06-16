import { Agent } from "@earendil-works/pi-agent-core";
import type { AgentTool } from "@earendil-works/pi-agent-core";
import {
  fauxAssistantMessage,
  fauxToolCall,
  getModel,
  registerFauxProvider
} from "@earendil-works/pi-ai";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import { type LlmRuntimeConfig, resolveLlmRuntimeConfig } from "./llm-config";

export function createDefaultFauxResponses(agentSlug: string): AssistantMessage[] {
  if (agentSlug === "pm-agent") {
    return [
      fauxAssistantMessage([
        fauxToolCall(
          "create_draft_task",
          {
            title: "Clarify MVP success criteria",
            description: "Confirm what a real team must accomplish in the project room.",
            priority: "high"
          },
          { id: "pm-task-1" }
        ),
        fauxToolCall(
          "create_draft_task",
          {
            title: "Review generated task drafts",
            description: "Approve, edit, or reject the tasks proposed by the agent.",
            priority: "medium"
          },
          { id: "pm-task-2" }
        ),
        fauxToolCall(
          "create_draft_task",
          {
            title: "Prepare demo project room",
            description: "Use the seeded room to show chat, tasks, docs, and agent runs together.",
            priority: "medium"
          },
          { id: "pm-task-3" }
        ),
        fauxToolCall(
          "create_draft_document",
          {
            title: "PRD Draft",
            body:
              "# PRD Draft\n\n## Product Direction\nTurn room discussion into structured project work."
          },
          { id: "pm-doc-1" }
        )
      ]),
      fauxAssistantMessage("PM Agent created draft tasks and a short PRD outline for human review.")
    ];
  }

  if (agentSlug === "doc-agent") {
    return [
      fauxAssistantMessage([
        fauxToolCall(
          "create_draft_document",
          {
            title: "Discussion Notes",
            body:
              "# Discussion Notes\n\nThe project room should turn discussion into durable work artifacts."
          },
          { id: "doc-doc-1" }
        )
      ]),
      fauxAssistantMessage("Doc Agent created draft discussion notes for human editing.")
    ];
  }

  return [
    fauxAssistantMessage([
      fauxToolCall(
        "create_draft_document",
        {
          title: "Project Review",
          body:
            "# Project Review\n\n- Check for unclear owners.\n- Check for stale or blocked tasks.\n- Confirm generated drafts have been reviewed."
        },
        { id: "review-doc-1" }
      )
    ]),
    fauxAssistantMessage("Review Agent created a project review with likely blockers and missing decisions.")
  ];
}

export function createRoomAgent(input: {
  agentSlug: string;
  agentName: string;
  roomName: string;
  tools: AgentTool[];
  llmConfig?: LlmRuntimeConfig;
  collaborationContext?: string;
}) {
  const llmConfig = input.llmConfig ?? resolveLlmRuntimeConfig();
  const model =
    llmConfig.mode === "openai"
      ? getModel(llmConfig.provider, llmConfig.model as never)
      : createFauxModel(input.agentSlug);

  if (!model) {
    throw new Error(`Configured LLM model is not available: ${llmConfig.mode}`);
  }

  return new Agent({
    initialState: {
      systemPrompt: [
        `You are ${input.agentName}, a visible AI collaborator in the ${input.roomName} project room.`,
        "Create draft tasks and documents only through tools.",
        "Do not mark generated artifacts active. Humans approve drafts.",
        input.collaborationContext
          ? ["", "Room collaboration context:", input.collaborationContext].join("\n")
          : ""
      ]
        .filter(Boolean)
        .join("\n"),
      model,
      thinkingLevel: "off",
      tools: input.tools
    },
    toolExecution: "sequential"
  });
}

function createFauxModel(agentSlug: string) {
  const faux = registerFauxProvider({
    provider: "feidingwei-faux",
    tokenSize: { min: 12, max: 24 }
  });
  faux.setResponses(createDefaultFauxResponses(agentSlug));

  return faux.getModel();
}
