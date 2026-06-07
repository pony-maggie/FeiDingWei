import { describe, expect, it } from "vitest";
import { defaultAgents } from "../domain";
import { prisma } from "../db";

describe("seeded database", () => {
  it("contains one workspace, one project room, and the default room agents", async () => {
    const workspaceCount = await prisma.workspace.count();
    const room = await prisma.projectRoom.findFirst({
      include: { agents: { orderBy: { slug: "asc" } } }
    });

    expect(workspaceCount).toBe(1);
    expect(room?.name).toBe("Agent Project Room");
    expect(room?.agents.map((agent) => agent.slug).sort()).toEqual(
      defaultAgents.map((agent) => agent.slug).sort()
    );
  });
});
