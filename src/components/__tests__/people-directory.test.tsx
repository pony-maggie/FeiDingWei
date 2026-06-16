import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { translations } from "@/lib/i18n";
import { PeopleDirectory } from "../people-directory";

const members = [
  {
    id: "user-product",
    name: "Product",
    email: "product@feidingwei.local",
    workspaceRole: "member",
    functionLabel: "product",
    team: { name: "Product" },
    activeRooms: [
      {
        id: "room-1",
        name: "Agent Project Room",
        roomRole: "room_lead"
      }
    ]
  },
  {
    id: "user-ops",
    name: "Ops",
    email: "ops@feidingwei.local",
    workspaceRole: "guest",
    functionLabel: "ops",
    team: null,
    activeRooms: []
  }
];

describe("PeopleDirectory", () => {
  it("shows member profile, role, team, and active room context", () => {
    render(<PeopleDirectory members={members} labels={translations.en.people} />);

    expect(screen.getByRole("heading", { name: "People" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Product" })).toBeInTheDocument();
    expect(screen.getByText("product@feidingwei.local")).toBeInTheDocument();
    expect(screen.getByText("Workspace role: member")).toBeInTheDocument();
    expect(screen.getByText("Function: product")).toBeInTheDocument();
    expect(screen.getByText("Team: Product")).toBeInTheDocument();
    expect(screen.getByText("Agent Project Room · room_lead")).toBeInTheDocument();
  });

  it("shows an empty room state for members without active rooms", () => {
    render(<PeopleDirectory members={members} labels={translations.en.people} />);

    expect(screen.getByRole("article", { name: "Ops" })).toBeInTheDocument();
    expect(screen.getByText("No active rooms")).toBeInTheDocument();
  });
});
