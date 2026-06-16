import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { translations } from "@/lib/i18n";
import { RoomTabs } from "../room-tabs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() })
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

const room = {
  id: "room-1",
  messages: [
    {
      id: "message-1",
      body: "Discussing the MVP",
      author: { name: "Founder" },
      agent: null
    }
  ],
  members: [
    {
      id: "user-product",
      name: "Product",
      email: "product@feidingwei.local"
    },
    {
      id: "user-engineer",
      name: "Engineer",
      email: "engineer@feidingwei.local"
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Clarify MVP",
      description: "Define the first product loop.",
      status: "todo",
      priority: "high",
      artifactStatus: "draft",
      reviewStatus: "none",
      blockedReason: "Needs owner confirmation.",
      assignee: null,
      reviewer: null,
      comments: [],
      trace: {
        sourceMessage: {
          id: "source-message",
          body: "@PMAgent summarize",
          author: { name: "Founder" },
          agent: null
        },
        sourceRun: {
          id: "run-1",
          status: "completed",
          output: "PM Agent completed the run.",
          input: "@PMAgent summarize",
          agent: { name: "PM Agent", slug: "pm-agent" }
        }
      }
    }
  ],
  documents: [
    {
      id: "doc-1",
      title: "PRD Draft",
      body: "# PRD Draft",
      artifactStatus: "draft",
      reviewStatus: "requested",
      blockedReason: "Please clarify rollout risks.",
      owner: { id: "user-product", name: "Product", email: "product@feidingwei.local" },
      reviewer: { id: "user-engineer", name: "Engineer", email: "engineer@feidingwei.local" },
      comments: [
        {
          id: "doc-comment-1",
          body: "Please clarify rollout risks.",
          author: { name: "Engineer" }
        }
      ],
      trace: {
        sourceMessage: {
          id: "source-message",
          body: "@PMAgent summarize",
          author: { name: "Founder" },
          agent: null
        },
        sourceRun: {
          id: "run-1",
          status: "completed",
          output: "PM Agent completed the run.",
          input: "@PMAgent summarize",
          agent: { name: "PM Agent", slug: "pm-agent" }
        }
      }
    }
  ],
  decisions: [
    {
      id: "decision-1",
      title: "Private beta decision",
      body: "Keep the first release private-deployment-first.",
      status: "active",
      creator: { name: "Product" },
      trace: {
        sourceMessage: {
          id: "source-message",
          body: "@PMAgent summarize",
          author: { name: "Founder" },
          agent: null
        },
        sourceRun: {
          id: "run-1",
          status: "completed",
          output: "PM Agent completed the run.",
          input: "@PMAgent summarize",
          agent: { name: "PM Agent", slug: "pm-agent" }
        }
      }
    }
  ],
  agents: [
    {
      id: "agent-1",
      slug: "pm-agent",
      name: "PM Agent",
      description: "Creates draft tasks and PRDs."
    }
  ],
  agentRuns: [
    {
      id: "run-1",
      status: "completed",
      output: "PM Agent completed the run.",
      input: "@PMAgent summarize",
      agent: { name: "PM Agent", slug: "pm-agent" },
      sourceMessage: {
        id: "source-message",
        body: "@PMAgent summarize",
        author: { name: "Founder" },
        agent: null
      },
      generatedTasks: [
        {
          id: "task-1",
          title: "Clarify MVP",
          artifactStatus: "draft",
          reviewStatus: "requested",
          assignee: { name: "Product" },
          reviewer: { name: "Engineer" }
        }
      ],
      generatedDocuments: [
        {
          id: "doc-1",
          title: "PRD Draft",
          artifactStatus: "draft",
          reviewStatus: "requested",
          owner: { name: "Product" },
          reviewer: { name: "Engineer" }
        }
      ]
    }
  ]
};

const roomWithFailedRun = {
  ...room,
  agentRuns: [
    {
      id: "run-failed",
      status: "failed",
      output: "",
      input: "@PMAgent create tasks",
      error: "OpenAI request failed for key [REDACTED_API_KEY].",
      agent: { name: "PM Agent", slug: "pm-agent" },
      sourceMessage: {
        id: "source-message",
        body: "@PMAgent create tasks",
        author: { name: "Founder" },
        agent: null
      },
      generatedTasks: [],
      generatedDocuments: []
    }
  ]
};

describe("RoomTabs", () => {
  it("renders Chinese labels by default and switches work panels", async () => {
    render(
      <RoomTabs
        room={room}
        labels={translations.zh}
        llmConfig={{ mode: "openai", provider: "openai", model: "gpt-5.5" }}
      />
    );
    expect(screen.getByRole("heading", { name: "对话" })).toBeInTheDocument();
    expect(screen.getByText("Discussing the MVP")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "任务" }));
    expect(screen.getByRole("heading", { name: "任务" })).toBeInTheDocument();
    expect(screen.getByText("Clarify MVP")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Clarify MVP" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "批准" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "拒绝" })).toBeInTheDocument();
    expect(screen.getByText("阻塞原因: Needs owner confirmation.")).toBeInTheDocument();
    expect(screen.getByText("来源消息")).toBeInTheDocument();
    expect(screen.getByText("@PMAgent summarize")).toBeInTheDocument();
    expect(screen.getByText("Agent run")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "文档" }));
    expect(screen.getByRole("heading", { name: "文档" })).toBeInTheDocument();
    expect(screen.getByText("PRD Draft")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "PRD Draft" })).toBeInTheDocument();
    expect(screen.getByText("负责人: Product")).toBeInTheDocument();
    expect(screen.getByText("评审人: Engineer")).toBeInTheDocument();
    expect(
      screen.getByText((_, element) =>
        Boolean(
          typeof element?.className === "string" &&
            element.className.includes("text-slate-500") &&
            element.textContent?.includes("评审状态") &&
            element.textContent?.includes("待评审")
        )
      )
    ).toBeInTheDocument();
    expect(screen.getByText("阻塞原因: Please clarify rollout risks.")).toBeInTheDocument();
    expect(screen.getByText("Engineer: Please clarify rollout risks.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "指派" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "请求评审" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "退回修改" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "编辑" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "拒绝" })).toBeInTheDocument();
    expect(screen.getByText("来源消息")).toBeInTheDocument();
    expect(screen.getByText("Agent run")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "决策" }));
    expect(screen.getByRole("heading", { name: "决策" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Private beta decision" })).toBeInTheDocument();
    expect(screen.getByText("Keep the first release private-deployment-first.")).toBeInTheDocument();
    expect(screen.getByText("Product · 已生效")).toBeInTheDocument();
    expect(screen.getByText("来源消息")).toBeInTheDocument();
    expect(screen.getByText("@PMAgent summarize")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "智能体" }));
    expect(screen.getByRole("heading", { name: "智能体" })).toBeInTheDocument();
    expect(screen.getAllByText("@PMAgent")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "运行记录" })).toBeInTheDocument();
    expect(screen.getByText("PM Agent completed the run.")).toBeInTheDocument();
    expect(screen.getByText("触发消息")).toBeInTheDocument();
    expect(screen.getByText("生成的任务")).toBeInTheDocument();
    expect(screen.getByText("生成的文档")).toBeInTheDocument();
    expect(screen.getByText("Clarify MVP")).toBeInTheDocument();
    expect(screen.getByText("PRD Draft")).toBeInTheDocument();
    expect(screen.getAllByText("负责人: Product · 评审人: Engineer · 待评审")).toHaveLength(2);
    expect(screen.getByText("模型来源")).toBeInTheDocument();
    expect(screen.getByText("OpenAI · gpt-5.5")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "详情" }));
    expect(screen.getByText("Run ID")).toBeInTheDocument();
    expect(screen.getByText("run-1")).toBeInTheDocument();
    expect(screen.getByText("输入")).toBeInTheDocument();
    expect(screen.getByText("输出")).toBeInTheDocument();
    expect(screen.getAllByText("草稿")).toHaveLength(2);
  });

  it("suggests room agents when the user types @ in chat", async () => {
    render(<RoomTabs room={room} labels={translations.en} />);

    await userEvent.type(
      screen.getByPlaceholderText("@PMAgent summarize discussion and create draft tasks"),
      "@"
    );

    await userEvent.click(screen.getByRole("button", { name: "PM Agent @PMAgent" }));
    expect(screen.getByRole("textbox")).toHaveValue("@PMAgent ");
  });

  it("suggests room members without opening the agent generation plan", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    render(<RoomTabs room={room} labels={translations.en} />);

    await userEvent.type(
      screen.getByPlaceholderText("@PMAgent summarize discussion and create draft tasks"),
      "@pro"
    );
    await userEvent.click(screen.getByRole("button", { name: "Product @product" }));
    expect(screen.getByRole("textbox")).toHaveValue("@product ");

    await userEvent.type(screen.getByRole("textbox"), "please review the customer request");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.queryByRole("heading", { name: "Generation plan" })).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/rooms/room-1/messages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ body: "@product please review the customer request" })
      })
    );
  });

  it("posts document assignment, review request, and revision return", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    render(<RoomTabs room={room} labels={translations.en} />);

    await userEvent.click(screen.getByRole("button", { name: "Docs" }));
    await userEvent.selectOptions(screen.getByLabelText("Owner"), "user-engineer");
    await userEvent.click(screen.getByRole("button", { name: "Assign" }));
    await userEvent.selectOptions(screen.getByLabelText("Reviewer"), "user-product");
    await userEvent.click(screen.getByRole("button", { name: "Request review" }));
    await userEvent.type(screen.getByLabelText("Revision note"), "Add release risks.");
    await userEvent.click(screen.getByRole("button", { name: "Return for revision" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/docs/doc-1/assign",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ ownerId: "user-engineer" })
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/docs/doc-1/review",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reviewerId: "user-product" })
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/docs/doc-1/return",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ commentBody: "Add release risks." })
      })
    );
  });

  it("previews an agent generation plan before sending the mention", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    render(<RoomTabs room={room} labels={translations.zh} />);

    await userEvent.type(
      screen.getByPlaceholderText("@PMAgent 总结讨论并创建任务草稿"),
      "@PMAgent 总结讨论并创建任务草稿"
    );
    await userEvent.click(screen.getByRole("button", { name: "发送" }));

    expect(screen.getByRole("heading", { name: "生成计划" })).toBeInTheDocument();
    expect(screen.getByText("PM Agent将基于当前对话创建：")).toBeInTheDocument();
    expect(screen.getByText("任务草稿")).toBeInTheDocument();
    expect(screen.getByText("文档草稿")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "确认生成" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/rooms/room-1/messages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ body: "@PMAgent 总结讨论并创建任务草稿" })
      })
    );
  });

  it("renders English labels when provided", async () => {
    render(<RoomTabs room={room} labels={translations.en} />);
    expect(screen.getByRole("heading", { name: "Chat" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tasks" }));
    expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  it("shows failed run details without leaking provider secrets", async () => {
    render(
      <RoomTabs
        room={roomWithFailedRun}
        labels={translations.en}
        llmConfig={{ mode: "openai", provider: "openai", model: "gpt-5.5" }}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Agents" }));
    await userEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("OpenAI request failed for key [REDACTED_API_KEY].")).toBeInTheDocument();
    expect(screen.queryByText(/sk-/)).not.toBeInTheDocument();
  });

  it("edits and rejects draft tasks", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    render(<RoomTabs room={room} labels={translations.en} />);

    await userEvent.click(screen.getByRole("button", { name: "Tasks" }));
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.clear(screen.getByLabelText("Task title"));
    await userEvent.type(screen.getByLabelText("Task title"), "Edited MVP task");
    await userEvent.clear(screen.getByLabelText("Description"));
    await userEvent.type(screen.getByLabelText("Description"), "Edited task details");
    await userEvent.selectOptions(screen.getByLabelText("Priority"), "high");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/tasks/task-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          title: "Edited MVP task",
          description: "Edited task details",
          priority: "high"
        })
      })
    );
    expect(fetch).toHaveBeenCalledWith("/api/tasks/task-1/reject", { method: "POST" });
  });

  it("assigns tasks, requests review, and returns tasks for revision", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    render(<RoomTabs room={room} labels={translations.en} />);

    await userEvent.click(screen.getByRole("button", { name: "Tasks" }));
    await userEvent.selectOptions(screen.getByLabelText("Assignee"), "user-engineer");
    await userEvent.click(screen.getByRole("button", { name: "Assign" }));
    await userEvent.selectOptions(screen.getByLabelText("Reviewer"), "user-product");
    await userEvent.click(screen.getByRole("button", { name: "Request review" }));
    await userEvent.type(screen.getByLabelText("Revision note"), "Please add acceptance criteria.");
    await userEvent.click(screen.getByRole("button", { name: "Return for revision" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/tasks/task-1/assign",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ assigneeId: "user-engineer" })
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/tasks/task-1/review",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reviewerId: "user-product" })
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/tasks/task-1/return",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ commentBody: "Please add acceptance criteria." })
      })
    );
  });

  it("edits and rejects draft documents", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    render(<RoomTabs room={room} labels={translations.en} />);

    await userEvent.click(screen.getByRole("button", { name: "Docs" }));
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.clear(screen.getByLabelText("Document title"));
    await userEvent.type(screen.getByLabelText("Document title"), "Edited PRD");
    await userEvent.clear(screen.getByLabelText("Body"));
    await userEvent.type(screen.getByLabelText("Body"), "Edited document body");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/docs/doc-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          title: "Edited PRD",
          body: "Edited document body"
        })
      })
    );
    expect(fetch).toHaveBeenCalledWith("/api/docs/doc-1/reject", { method: "POST" });
  });
});
