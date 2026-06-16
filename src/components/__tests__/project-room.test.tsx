import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectRoom } from "../project-room";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() })
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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
      slug: "pm-agent",
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
      agent: { name: "PM Agent", slug: "pm-agent" }
    }
  ]
};

function readBlob(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe("ProjectRoom", () => {
  it("shows accessible room links in the sidebar", () => {
    render(
      <ProjectRoom
        room={room}
        accessibleRooms={[
          { id: "room-1", name: "Agent Project Room" },
          { id: "room-2", name: "Customer Discovery" }
        ]}
      />
    );

    expect(screen.getByRole("link", { name: "智能体项目房间" })).toHaveAttribute(
      "href",
      "/rooms/room-1"
    );
    expect(screen.getByRole("link", { name: "Customer Discovery" })).toHaveAttribute(
      "href",
      "/rooms/room-2"
    );
  });

  it("opens a room creation form with workspace members and selected roles", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ room: { id: "room-new" } })
    });
    vi.stubGlobal("fetch", fetch);

    render(
      <ProjectRoom
        room={room}
        accessibleRooms={[{ id: "room-1", name: "Agent Project Room" }]}
        currentUser={{
          name: "Product",
          email: "product@feidingwei.local",
          workspaceRole: "member",
          functionLabel: "product",
          team: null
        }}
        workspaceMembers={[
          {
            id: "user-product",
            name: "Product",
            email: "product@feidingwei.local",
            workspaceRole: "member",
            functionLabel: "product",
            team: null,
            activeRooms: []
          },
          {
            id: "user-business",
            name: "Business",
            email: "business@feidingwei.local",
            workspaceRole: "member",
            functionLabel: "business",
            team: null,
            activeRooms: []
          },
          {
            id: "user-qa",
            name: "QA",
            email: "qa@feidingwei.local",
            workspaceRole: "member",
            functionLabel: "qa",
            team: null,
            activeRooms: []
          }
        ]}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "新建项目房间" }));
    expect(screen.queryByRole("checkbox", { name: "Product" })).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("房间名称"), "客户访谈");
    await userEvent.type(screen.getByLabelText("房间描述"), "沉淀客户访谈结论");
    await userEvent.click(screen.getByLabelText("Business"));
    await userEvent.selectOptions(screen.getByLabelText("Business 角色"), "contributor");
    await userEvent.click(screen.getByLabelText("QA"));
    await userEvent.selectOptions(screen.getByLabelText("QA 角色"), "reviewer");
    await userEvent.click(screen.getByRole("button", { name: "创建房间" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/rooms",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "客户访谈",
          description: "沉淀客户访谈结论",
          members: [
            { userId: "user-business", role: "contributor" },
            { userId: "user-qa", role: "reviewer" }
          ]
        })
      })
    );
  });

  it("defaults the whole room to Chinese and moves language switching into settings", async () => {
    render(<ProjectRoom room={room} />);

    expect(screen.getByText("飞钉微实验室")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "智能体项目房间" })).toBeInTheDocument();
    expect(screen.getByText("人和 AI 智能体把讨论转成项目成果。")).toBeInTheDocument();
    expect(screen.getByText("创始人")).toBeInTheDocument();
    expect(screen.getByText("第一版需要证明对话可以转成任务和文档。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "收件箱" })).toHaveAttribute("href", "/inbox");
    expect(screen.getByRole("link", { name: "成员" })).toHaveAttribute("href", "/people");
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

  it("exports the current room data from settings without provider secrets", async () => {
    const createObjectURL = vi.fn((blob: Blob) => {
      void blob;
      return "blob:room-export";
    });
    const revokeObjectURL = vi.fn((url: string) => {
      void url;
    });
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL
    });
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        Object.defineProperty(element, "click", { value: click });
      }
      return element;
    });

    render(
      <ProjectRoom
        room={room}
        llmConfig={{ mode: "openai", provider: "openai", model: "gpt-5.5" }}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "设置" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "导出房间数据" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const exportedJson = await readBlob(blob);
    expect(exportedJson).toContain('"product": "FeiDingWei"');
    expect(exportedJson).toContain('"model": "gpt-5.5"');
    expect(exportedJson).not.toContain("sk-proj");
    expect(exportedJson).not.toContain("OPENAI_API_KEY");
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:room-export");
  });

  it("shows the current user's workspace role and function context", () => {
    render(
      <ProjectRoom
        room={room}
        currentUser={{
          name: "Founder",
          email: "founder@feidingwei.local",
          workspaceRole: "owner",
          functionLabel: "product",
          team: { name: "Product" }
        }}
      />
    );

    expect(screen.getByText("Founder")).toBeInTheDocument();
    expect(screen.getByText("owner · product · Product")).toBeInTheDocument();
  });
});
