import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "../app-shell";

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
