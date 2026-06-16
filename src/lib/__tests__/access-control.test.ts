import { describe, expect, it } from "vitest";
import { prisma } from "../db";
import { getDefaultRoomId } from "../room-service";
import {
  canApproveArtifacts,
  canExecuteAgents,
  canReadRoom,
  canSendRoomMessage,
  getRoomAccess
} from "../access-control";

describe("access control", () => {
  it("denies anonymous room access", async () => {
    const roomId = await getDefaultRoomId();

    await expect(getRoomAccess(null, roomId!)).resolves.toEqual({
      canRead: false,
      workspaceRole: null,
      roomRole: null
    });
  });

  it("allows room members to read and contributors to send messages and execute agents", async () => {
    const roomId = await getDefaultRoomId();
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });
    const access = await getRoomAccess(engineer.id, roomId!);

    expect(canReadRoom(access)).toBe(true);
    expect(canSendRoomMessage(access)).toBe(true);
    expect(canExecuteAgents(access)).toBe(true);
    expect(access.roomRole).toBe("contributor");
  });

  it("prevents viewers from sending messages or executing agents", async () => {
    const roomId = await getDefaultRoomId();
    const viewer = await prisma.user.upsert({
      where: { email: "viewer@feidingwei.local" },
      update: { name: "Viewer" },
      create: { name: "Viewer", email: "viewer@feidingwei.local" }
    });
    const room = await prisma.projectRoom.findUniqueOrThrow({ where: { id: roomId! } });
    await prisma.membership.upsert({
      where: { userId_workspaceId: { userId: viewer.id, workspaceId: room.workspaceId } },
      update: {
        role: "guest",
        functionLabel: "ops"
      },
      create: {
        role: "guest",
        functionLabel: "ops",
        userId: viewer.id,
        workspaceId: room.workspaceId
      }
    });
    await prisma.roomMembership.upsert({
      where: { userId_roomId: { userId: viewer.id, roomId: roomId! } },
      update: { role: "viewer" },
      create: { userId: viewer.id, roomId: roomId!, role: "viewer" }
    });

    const access = await getRoomAccess(viewer.id, roomId!);

    expect(canReadRoom(access)).toBe(true);
    expect(canSendRoomMessage(access)).toBe(false);
    expect(canExecuteAgents(access)).toBe(false);
  });

  it("allows room leads to approve artifacts", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });

    const access = await getRoomAccess(product.id, roomId!);

    expect(access.roomRole).toBe("room_lead");
    expect(canApproveArtifacts(access)).toBe(true);
  });

  it("allows reviewers to execute review agents", async () => {
    const roomId = await getDefaultRoomId();
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });

    const access = await getRoomAccess(qa.id, roomId!);

    expect(access.roomRole).toBe("reviewer");
    expect(canSendRoomMessage(access)).toBe(true);
    expect(canExecuteAgents(access)).toBe(true);
  });

  it("allows workspace owners to access rooms even without a room membership", async () => {
    const roomId = await getDefaultRoomId();
    const founder = await prisma.user.findUniqueOrThrow({
      where: { email: "founder@feidingwei.local" }
    });
    await prisma.roomMembership.deleteMany({ where: { userId: founder.id, roomId: roomId! } });

    const access = await getRoomAccess(founder.id, roomId!);

    expect(access.workspaceRole).toBe("owner");
    expect(canReadRoom(access)).toBe(true);
    expect(canApproveArtifacts(access)).toBe(true);

    await prisma.roomMembership.upsert({
      where: { userId_roomId: { userId: founder.id, roomId: roomId! } },
      update: { role: "room_lead" },
      create: { userId: founder.id, roomId: roomId!, role: "room_lead" }
    });
  });
});
