import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "../app-shell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}));

describe("AppShell", () => {
  it("renders workspace, current room, and child content", () => {
    render(
      <AppShell
        workspaceName="FeiDingWei Labs"
        roomName="Agent Project Room"
        roomDescription="Humans and AI agents turn discussion into project artifacts."
      >
        <div>Room content loaded</div>
      </AppShell>
    );

    expect(screen.getByText("FeiDingWei Labs")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent Project Room" })).toBeInTheDocument();
    expect(screen.getByText("Room content loaded")).toBeInTheDocument();
  });
});
