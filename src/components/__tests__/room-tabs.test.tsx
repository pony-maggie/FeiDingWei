import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
  it("switches between work panels", async () => {
    render(<RoomTabs room={room} />);
    expect(screen.getByRole("heading", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByText("Discussing the MVP")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tasks" }));
    expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByText("Clarify MVP")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Docs" }));
    expect(screen.getByRole("heading", { name: "Docs" })).toBeInTheDocument();
    expect(screen.getByText("PRD Draft")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Agents" }));
    expect(screen.getByRole("heading", { name: "Agents" })).toBeInTheDocument();
    expect(screen.getByText("PM Agent completed the run.")).toBeInTheDocument();
  });
});
