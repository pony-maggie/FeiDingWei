import { describe, expect, it } from "vitest";
import { localizeRoom } from "../localized-room";

describe("localized room", () => {
  it("localizes trace metadata for generated artifacts and agent runs", () => {
    const sourceMessage = {
      id: "message-source",
      body: "@PMAgent summarize the launch discussion and create draft tasks.",
      author: { name: "Founder" },
      agent: null
    };
    const sourceRun = {
      id: "run-1",
      status: "completed",
      output: "PM Agent completed the run.",
      input: "@PMAgent summarize",
      agent: { name: "PM Agent", slug: "pm-agent" }
    };
    const room = {
      id: "room-1",
      workspace: { name: "FeiDingWei Labs" },
      name: "Agent Project Room",
      description: "Humans and AI agents turn discussion into project artifacts.",
      messages: [sourceMessage],
      members: [
        {
          id: "user-product",
          name: "Product",
          email: "product@feidingwei.local"
        }
      ],
      tasks: [
        {
          id: "task-1",
          title: "Clarify MVP success criteria",
          description: "Confirm what a real team must accomplish in the project room.",
          status: "todo",
          priority: "high",
          artifactStatus: "draft",
          trace: {
            sourceMessage,
            sourceRun
          }
        }
      ],
      documents: [
        {
          id: "doc-1",
          title: "PRD Draft",
          body: "# PRD Draft\n\n## Product Direction\nTurn room discussion into structured project work.",
          artifactStatus: "draft",
          trace: {
            sourceMessage,
            sourceRun
          }
        }
      ],
      agents: [
        {
          id: "agent-1",
          slug: "pm-agent",
          name: "PM Agent",
          description: "Summarizes discussions, drafts PRDs, and creates draft task lists."
        }
      ],
      agentRuns: [
        {
          ...sourceRun,
          sourceMessage,
          generatedTasks: [
            {
              id: "task-1",
              title: "Clarify MVP success criteria",
              description: "Confirm what a real team must accomplish in the project room.",
              status: "todo",
              priority: "high",
              artifactStatus: "draft"
            }
          ],
          generatedDocuments: [
            {
              id: "doc-1",
              title: "PRD Draft",
              body: "# PRD Draft\n\n## Product Direction\nTurn room discussion into structured project work.",
              artifactStatus: "draft"
            }
          ]
        }
      ]
    };

    const localized = localizeRoom(room, "zh");

    expect(localized.tasks[0].trace?.sourceMessage?.body).toBe(
      "@PMAgent 总结发布讨论并创建任务草稿。"
    );
    expect(localized.tasks[0].trace?.sourceRun?.output).toBe("产品智能体已完成运行。");
    expect(localized.agentRuns[0].sourceMessage?.body).toBe(
      "@PMAgent 总结发布讨论并创建任务草稿。"
    );
    expect(localized.agentRuns[0]?.generatedTasks?.[0]?.title).toBe("明确 MVP 成功标准");
    expect(localized.agentRuns[0]?.generatedDocuments?.[0]?.title).toBe("PRD 草稿");
  });
});
