import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { translations } from "@/lib/i18n";
import { RoomTabs } from "../room-tabs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() })
}));

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
  tasks: [
    {
      id: "task-1",
      title: "Clarify MVP",
      description: "Define the first product loop.",
      status: "todo",
      priority: "high",
      artifactStatus: "draft"
    }
  ],
  documents: [
    {
      id: "doc-1",
      title: "PRD Draft",
      body: "# PRD Draft",
      artifactStatus: "draft"
    }
  ],
  agents: [
    {
      id: "agent-1",
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
      agent: { name: "PM Agent" }
    }
  ]
};

describe("RoomTabs", () => {
  it("renders Chinese labels by default and switches work panels", async () => {
    render(<RoomTabs room={room} labels={translations.zh} />);
    expect(screen.getByRole("heading", { name: "对话" })).toBeInTheDocument();
    expect(screen.getByText("Discussing the MVP")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "任务" }));
    expect(screen.getByRole("heading", { name: "任务" })).toBeInTheDocument();
    expect(screen.getByText("Clarify MVP")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "批准" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "文档" }));
    expect(screen.getByRole("heading", { name: "文档" })).toBeInTheDocument();
    expect(screen.getByText("PRD Draft")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "智能体" }));
    expect(screen.getByRole("heading", { name: "智能体" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "运行记录" })).toBeInTheDocument();
    expect(screen.getByText("PM Agent completed the run.")).toBeInTheDocument();
  });

  it("renders English labels when provided", async () => {
    render(<RoomTabs room={room} labels={translations.en} />);
    expect(screen.getByRole("heading", { name: "Chat" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tasks" }));
    expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });
});
