import { describe, expect, it } from "vitest";
import { prisma } from "../db";
import {
  approveTask,
  approveDocument,
  buildRoomViewModel,
  createProjectRoomWithMembers,
  rejectDocument,
  rejectTask,
  listAccessibleRooms,
  updateDraftDocument,
  updateDraftTask,
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

  it("attaches source messages and generated artifacts to room traces", () => {
    const view = buildRoomViewModel({
      id: "room-1",
      name: "Launch Room",
      description: "A room",
      messages: [
        {
          id: "source-message",
          body: "@PMAgent summarize",
          createdAt: new Date("2026-01-01"),
          author: { name: "Founder" },
          agent: null
        }
      ],
      tasks: [
        {
          id: "task-1",
          title: "Clarify MVP success criteria",
          description: "Confirm the room workflow.",
          status: "todo",
          priority: "high",
          artifactStatus: "draft",
          sourceMessageId: "source-message",
          sourceRunId: "run-1"
        }
      ],
      documents: [
        {
          id: "doc-1",
          title: "PRD Draft",
          body: "# PRD Draft",
          artifactStatus: "draft",
          sourceMessageId: "source-message",
          sourceRunId: "run-1"
        }
      ],
      agents: [],
      agentRuns: [
        {
          id: "run-1",
          status: "completed",
          input: "@PMAgent summarize",
          output: "PM Agent completed the run.",
          error: null,
          sourceMessageId: "source-message",
          agent: { name: "PM Agent", slug: "pm-agent" }
        }
      ]
    });

    expect(view.tasks[0].trace?.sourceMessage?.body).toBe("@PMAgent summarize");
    expect(view.tasks[0].trace?.sourceRun?.id).toBe("run-1");
    expect(view.documents[0].trace?.sourceRun?.id).toBe("run-1");
    expect(view.agentRuns[0].sourceMessage?.body).toBe("@PMAgent summarize");
    expect(view.agentRuns[0].generatedTasks.map((task) => task.title)).toEqual([
      "Clarify MVP success criteria"
    ]);
    expect(view.agentRuns[0].generatedDocuments.map((document) => document.title)).toEqual([
      "PRD Draft"
    ]);
  });

  it("loads the default seeded room with workspace and agents", async () => {
    const roomId = await getDefaultRoomId();
    expect(roomId).toBeTypeOf("string");

    const room = await getProjectRoom(roomId!);

    expect(room?.workspace.name).toBe("FeiDingWei Labs");
    expect(room?.agents).toHaveLength(3);
  });

  it("creates a project room with selected members, creator lead role, and default agents", async () => {
    const workspace = await prisma.workspace.findFirstOrThrow();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const business = await prisma.user.findUniqueOrThrow({
      where: { email: "business@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });

    const room = await createProjectRoomWithMembers({
      workspaceId: workspace.id,
      creatorId: product.id,
      name: "Customer Discovery",
      description: "Turn customer interviews into project artifacts.",
      members: [
        { userId: business.id, role: "contributor" },
        { userId: qa.id, role: "reviewer" }
      ]
    });

    const persisted = await prisma.projectRoom.findUniqueOrThrow({
      where: { id: room.id },
      include: {
        roomMemberships: true,
        agents: true
      }
    });

    expect(persisted.name).toBe("Customer Discovery");
    expect(persisted.description).toBe("Turn customer interviews into project artifacts.");
    expect(persisted.agents.map((agent) => agent.slug).sort()).toEqual([
      "doc-agent",
      "pm-agent",
      "review-agent"
    ]);
    expect(persisted.roomMemberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: product.id, role: "room_lead" }),
        expect.objectContaining({ userId: business.id, role: "contributor" }),
        expect.objectContaining({ userId: qa.id, role: "reviewer" })
      ])
    );
    expect(persisted.roomMemberships.some((membership) => membership.userId === engineer.id)).toBe(
      false
    );
  });

  it("rejects room creation when the creator is not a workspace member", async () => {
    const workspace = await prisma.workspace.findFirstOrThrow();
    const roomName = `Invalid Room ${Date.now()}`;
    const outsider = await prisma.user.upsert({
      where: { email: "outsider@feidingwei.local" },
      update: {},
      create: {
        name: "Outsider",
        email: "outsider@feidingwei.local"
      }
    });

    await expect(
      createProjectRoomWithMembers({
        workspaceId: workspace.id,
        creatorId: outsider.id,
        name: roomName,
        description: "Should not be created.",
        members: []
      })
    ).rejects.toThrow("Room creator must be a workspace member.");

    await expect(
      prisma.projectRoom.findFirst({ where: { name: roomName } })
    ).resolves.toBeNull();
  });

  it("lists rooms accessible to a member through room memberships", async () => {
    const workspace = await prisma.workspace.findFirstOrThrow();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const business = await prisma.user.findUniqueOrThrow({
      where: { email: "business@feidingwei.local" }
    });
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });

    const room = await createProjectRoomWithMembers({
      workspaceId: workspace.id,
      creatorId: product.id,
      name: "Business Only Room",
      description: "A room for business and product.",
      members: [{ userId: business.id, role: "contributor" }]
    });

    const businessRooms = await listAccessibleRooms(business.id, workspace.id);
    const engineerRooms = await listAccessibleRooms(engineer.id, workspace.id);

    expect(businessRooms.map((item) => item.id)).toContain(room.id);
    expect(engineerRooms.map((item) => item.id)).not.toContain(room.id);
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

  it("does not mutate non-draft tasks through draft artifact actions", async () => {
    const roomId = await getDefaultRoomId();
    const task = await prisma.task.create({
      data: {
        title: "Already active",
        description: "This task has already been approved.",
        status: "todo",
        priority: "medium",
        artifactStatus: "active",
        roomId: roomId!
      }
    });

    await expect(rejectTask(task.id)).rejects.toThrow("Only draft task artifacts can be rejected.");

    const persisted = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(persisted.artifactStatus).toBe("active");
  });

  it("updates draft tasks before approval", async () => {
    const roomId = await getDefaultRoomId();
    const task = await prisma.task.create({
      data: {
        title: "Original task",
        description: "Original description",
        status: "todo",
        priority: "medium",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const updated = await updateDraftTask(task.id, {
      title: "Edited task",
      description: "Edited description",
      priority: "high"
    });

    expect(updated.title).toBe("Edited task");
    expect(updated.description).toBe("Edited description");
    expect(updated.priority).toBe("high");
    expect(updated.artifactStatus).toBe("draft");
  });

  it("rejects draft tasks", async () => {
    const roomId = await getDefaultRoomId();
    const task = await prisma.task.create({
      data: {
        title: "Reject me",
        description: "A generated task draft",
        status: "todo",
        priority: "medium",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const rejected = await rejectTask(task.id);

    expect(rejected.artifactStatus).toBe("rejected");
  });

  it("updates and rejects draft documents before approval", async () => {
    const roomId = await getDefaultRoomId();
    const doc = await prisma.document.create({
      data: {
        title: "Original doc",
        body: "Original body",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const updated = await updateDraftDocument(doc.id, {
      title: "Edited doc",
      body: "Edited body"
    });
    const rejected = await rejectDocument(updated.id);

    expect(updated.title).toBe("Edited doc");
    expect(updated.body).toBe("Edited body");
    expect(updated.artifactStatus).toBe("draft");
    expect(rejected.artifactStatus).toBe("rejected");
  });

  it("approves draft documents", async () => {
    const roomId = await getDefaultRoomId();
    const doc = await prisma.document.create({
      data: {
        title: "Approve doc",
        body: "Approve through service",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const approved = await approveDocument(doc.id);

    expect(approved.artifactStatus).toBe("active");
  });

  it("does not mutate non-draft documents through draft artifact actions", async () => {
    const roomId = await getDefaultRoomId();
    const doc = await prisma.document.create({
      data: {
        title: "Already active doc",
        body: "This document has already been approved.",
        artifactStatus: "active",
        roomId: roomId!
      }
    });

    await expect(rejectDocument(doc.id)).rejects.toThrow(
      "Only draft document artifacts can be rejected."
    );

    const persisted = await prisma.document.findUniqueOrThrow({ where: { id: doc.id } });
    expect(persisted.artifactStatus).toBe("active");
  });
});
