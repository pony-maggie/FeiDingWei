import { describe, expect, it } from "vitest";
import type { LlmRuntimeConfig } from "../llm-config";
import { buildRoomExport, roomExportFileName } from "../room-export";

const room = {
  id: "room-1",
  workspace: { name: "FeiDingWei Labs" },
  name: "Agent Project Room",
  description: "Humans and AI agents turn discussion into project artifacts.",
  messages: [
    {
      id: "message-1",
      body: "@PMAgent summarize",
      author: { name: "Founder" },
      agent: null
    }
  ],
  members: [
    {
      id: "user-product",
      name: "Product",
      email: "product@feidingwei.local"
    }
  ],
  tasks: [],
  documents: [],
  decisions: [
    {
      id: "decision-1",
      title: "Private beta",
      body: "Keep the first launch private.",
      status: "active",
      creator: { name: "Product" },
      trace: null
    }
  ],
  agents: [
    {
      id: "agent-1",
      slug: "pm-agent",
      name: "PM Agent",
      description: "Summarizes discussions."
    }
  ],
  agentRuns: [
    {
      id: "run-1",
      status: "completed",
      input: "@PMAgent summarize",
      output: "Created draft work.",
      agent: { name: "PM Agent", slug: "pm-agent" }
    }
  ]
};

describe("room export", () => {
  it("builds a versioned room export without provider secrets", () => {
    const llmConfig: LlmRuntimeConfig = {
      mode: "openai",
      provider: "openai",
      model: "gpt-5.5"
    };

    const exported = buildRoomExport({
      room,
      locale: "zh",
      llmConfig,
      exportedAt: "2026-06-07T12:30:00.000Z"
    });

    expect(exported).toMatchObject({
      exportVersion: 1,
      product: "FeiDingWei",
      exportedAt: "2026-06-07T12:30:00.000Z",
      locale: "zh",
      llm: {
        mode: "openai",
        provider: "openai",
        model: "gpt-5.5"
      },
      room: {
        id: "room-1",
        name: "Agent Project Room",
        decisions: [
          expect.objectContaining({
            title: "Private beta",
            status: "active"
          })
        ]
      }
    });
    expect(JSON.stringify(exported)).not.toContain("sk-");
  });

  it("creates a stable json filename from the room name and timestamp", () => {
    expect(roomExportFileName("Agent Project Room", "2026-06-07T12:30:00.000Z")).toBe(
      "feidingwei-agent-project-room-2026-06-07T12-30-00-000Z.json"
    );
  });
});
