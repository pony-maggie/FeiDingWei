import { prisma } from "./db";

export type RoomAccess = {
  canRead: boolean;
  workspaceRole: string | null;
  roomRole: string | null;
};

const workspaceAdminRoles = new Set(["owner", "admin"]);
const roomReadRoles = new Set(["room_lead", "contributor", "reviewer", "viewer"]);
const roomWriteRoles = new Set(["room_lead", "contributor", "reviewer"]);
const roomAgentRoles = new Set(["room_lead", "contributor", "reviewer"]);
const roomApproveRoles = new Set(["room_lead", "reviewer"]);

export async function getRoomAccess(
  userId: string | null | undefined,
  roomId: string
): Promise<RoomAccess> {
  if (!userId) {
    return { canRead: false, workspaceRole: null, roomRole: null };
  }

  const room = await prisma.projectRoom.findUnique({
    where: { id: roomId },
    select: { workspaceId: true }
  });

  if (!room) {
    return { canRead: false, workspaceRole: null, roomRole: null };
  }

  const [workspaceMembership, roomMembership] = await Promise.all([
    prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: room.workspaceId } },
      select: { role: true }
    }),
    prisma.roomMembership.findUnique({
      where: { userId_roomId: { userId, roomId } },
      select: { role: true }
    })
  ]);

  const workspaceRole = workspaceMembership?.role ?? null;
  const roomRole = roomMembership?.role ?? null;
  const canRead =
    (workspaceRole ? workspaceAdminRoles.has(workspaceRole) : false) ||
    (roomRole ? roomReadRoles.has(roomRole) : false);

  return { canRead, workspaceRole, roomRole };
}

export async function getTaskRoomAccess(
  userId: string | null | undefined,
  taskId: string
): Promise<RoomAccess> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { roomId: true }
  });

  if (!task) {
    return { canRead: false, workspaceRole: null, roomRole: null };
  }

  return getRoomAccess(userId, task.roomId);
}

export async function getDocumentRoomAccess(
  userId: string | null | undefined,
  documentId: string
): Promise<RoomAccess> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { roomId: true }
  });

  if (!document) {
    return { canRead: false, workspaceRole: null, roomRole: null };
  }

  return getRoomAccess(userId, document.roomId);
}

export function canReadRoom(access: RoomAccess) {
  return access.canRead;
}

export function canSendRoomMessage(access: RoomAccess) {
  return isWorkspaceAdmin(access) || hasRoomRole(access, roomWriteRoles);
}

export function canExecuteAgents(access: RoomAccess) {
  return isWorkspaceAdmin(access) || hasRoomRole(access, roomAgentRoles);
}

export function canApproveArtifacts(access: RoomAccess) {
  return isWorkspaceAdmin(access) || hasRoomRole(access, roomApproveRoles);
}

export function canOverrideArtifactReview(access: RoomAccess) {
  return isWorkspaceAdmin(access) || access.roomRole === "room_lead";
}

function isWorkspaceAdmin(access: RoomAccess) {
  return access.workspaceRole ? workspaceAdminRoles.has(access.workspaceRole) : false;
}

function hasRoomRole(access: RoomAccess, allowed: Set<string>) {
  return access.roomRole ? allowed.has(access.roomRole) : false;
}
