import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectRoom } from "../project-room";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() })
}));

const room = {
  id: "room-1",
  workspace: { name: "FeiDingWei Labs" },
  name: "Agent Project Room",
  description: "Humans and AI agents turn discussion into project artifacts.",
  messages: [
    {
      id: "message-1",
      body: "We need the first version to prove that chat can become tasks and docs.",
      author: { name: "Founder" },
      agent: null
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Define the Agent Project Room MVP",
      description: "Capture the first product scope and non-goals.",
      status: "done",
      priority: "high",
      artifactStatus: "active"
    }
  ],
  documents: [
    {
      id: "doc-1",
      title: "MVP Positioning",
      body: "FeiDingWei is an open source agent-native workspace for teams.",
      artifactStatus: "active"
    }
  ],
  agents: [
    {
      id: "agent-1",
      name: "PM Agent",
      description: "Summarizes discussions, drafts PRDs, and creates draft task lists."
    }
  ],
  agentRuns: [
    {
      id: "run-1",
      status: "completed",
      output: "PM Agent completed the run.",
      input: "@PMAgent summarize",
      agent: { name: "PM Agent" }
    }
  ]
};

describe("ProjectRoom", () => {
  it("defaults the whole room to Chinese and moves language switching into settings", async () => {
    render(<ProjectRoom room={room} />);

    expect(screen.getByText("飞钉微实验室")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "智能体项目房间" })).toBeInTheDocument();
    expect(screen.getByText("人和 AI 智能体把讨论转成项目成果。")).toBeInTheDocument();
    expect(screen.getByText("创始人")).toBeInTheDocument();
    expect(screen.getByText("第一版需要证明对话可以转成任务和文档。")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "English" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "设置" }));
    const menu = screen.getByRole("menu", { name: "设置" });
    expect(within(menu).getByText("语言")).toBeInTheDocument();
    await userEvent.click(within(menu).getByRole("menuitem", { name: "English" }));

    expect(screen.getByText("FeiDingWei Labs")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent Project Room" })).toBeInTheDocument();
    expect(screen.getByText("Humans and AI agents turn discussion into project artifacts.")).toBeInTheDocument();
    expect(screen.getByText("Founder")).toBeInTheDocument();
    expect(
      screen.getByText("We need the first version to prove that chat can become tasks and docs.")
    ).toBeInTheDocument();
  });
});
