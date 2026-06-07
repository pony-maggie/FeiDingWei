import { describe, expect, it } from "vitest";
import { prisma } from "../db";
import {
  approveTask,
  buildRoomViewModel,
  getDefaultRoomId,
  getProjectRoom,
  summarizeDraftCounts
} from "../room-service";

describe("room service", () => {
  it("sorts room messages oldest first for chat display", () => {
    const view = buildRoomViewModel({
      id: "room-1",
      name: "Launch Room",
      description: "A room",
      messages: [
        { id: "m2", body: "second", createdAt: new Date("2026-01-02"), author: null, agent: null },
        { id: "m1", body: "first", createdAt: new Date("2026-01-01"), author: null, agent: null }
      ],
      tasks: [],
      documents: [],
      agents: [],
      agentRuns: []
    });

    expect(view.messages.map((message) => message.id)).toEqual(["m1", "m2"]);
  });

  it("counts draft tasks and documents", () => {
    expect(
      summarizeDraftCounts({
        tasks: [{ artifactStatus: "draft" }, { artifactStatus: "active" }],
        documents: [{ artifactStatus: "draft" }, { artifactStatus: "draft" }]
      })
    ).toEqual({ draftTasks: 1, draftDocs: 2 });
  });

  it("loads the default seeded room with workspace and agents", async () => {
    const roomId = await getDefaultRoomId();
    expect(roomId).toBeTypeOf("string");

    const room = await getProjectRoom(roomId!);

    expect(room?.workspace.name).toBe("FeiDingWei Labs");
    expect(room?.agents).toHaveLength(3);
  });

  it("approves draft tasks", async () => {
    const roomId = await getDefaultRoomId();
    const task = await prisma.task.create({
      data: {
        title: "Approve me",
        description: "A generated task draft",
        status: "todo",
        priority: "medium",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const approved = await approveTask(task.id);

    expect(approved.artifactStatus).toBe("active");
  });
});
