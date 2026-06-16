import { describe, expect, it } from "vitest";
import { workspaceRoleSchema } from "../domain";
import {
  getCurrentUserWorkspaceMembership,
  listWorkspaceMembers
} from "../member-service";

describe("member service", () => {
  it("lists workspace members sorted by name with role, function label, and team", async () => {
    const members = await listWorkspaceMembers();
    const seededMembers = members.filter((member) =>
      [
        "business@feidingwei.local",
        "engineer@feidingwei.local",
        "founder@feidingwei.local",
        "product@feidingwei.local",
        "qa@feidingwei.local"
      ].includes(member.email)
    );

    expect(seededMembers.map((member) => member.name)).toEqual([
      "Business",
      "Engineer",
      "Founder",
      "Product",
      "QA"
    ]);
    expect(seededMembers).toContainEqual(
      expect.objectContaining({
        name: "Product",
        email: "product@feidingwei.local",
        workspaceRole: "member",
        functionLabel: "product",
        team: { name: "Product" },
        activeRooms: expect.arrayContaining([
          expect.objectContaining({
            name: "Agent Project Room",
            roomRole: "room_lead"
          })
        ])
      })
    );
  });

  it("does not expose users outside the current workspace", async () => {
    const { prisma } = await import("../db");
    const outsider = await prisma.user.upsert({
      where: { email: "outsider@feidingwei.local" },
      update: { name: "Outsider" },
      create: { name: "Outsider", email: "outsider@feidingwei.local" }
    });
    const workspace = await prisma.workspace.create({
      data: { name: "Outside Workspace" }
    });

    try {
      await prisma.membership.create({
        data: {
          role: "member",
          functionLabel: "ops",
          userId: outsider.id,
          workspaceId: workspace.id
        }
      });

      const members = await listWorkspaceMembers();

      expect(members.map((member) => member.email)).not.toContain("outsider@feidingwei.local");
    } finally {
      await prisma.workspace.delete({ where: { id: workspace.id } });
      await prisma.user.delete({ where: { id: outsider.id } });
    }
  });

  it("returns the current user's workspace membership summary", async () => {
    const membership = await getCurrentUserWorkspaceMembership("founder@feidingwei.local");

    expect(membership).toEqual(
      expect.objectContaining({
        name: "Founder",
        email: "founder@feidingwei.local",
        workspaceRole: "owner",
        functionLabel: "product",
        team: { name: "Product" }
      })
    );
  });

  it("rejects invalid workspace roles", () => {
    expect(() => workspaceRoleSchema.parse("super_admin")).toThrow();
  });
});
