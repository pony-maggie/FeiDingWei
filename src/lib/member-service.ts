import { prisma } from "./db";

export type WorkspaceMemberSummary = {
  id: string;
  name: string;
  email: string;
  workspaceRole: string;
  functionLabel: string;
  team: { name: string } | null;
  activeRooms: Array<{
    id: string;
    name: string;
    roomRole: string;
  }>;
};

export async function getDefaultWorkspaceId() {
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true }
  });

  return workspace?.id ?? null;
}

export async function listWorkspaceMembers(workspaceId?: string): Promise<WorkspaceMemberSummary[]> {
  const resolvedWorkspaceId = workspaceId ?? (await getDefaultWorkspaceId());

  if (!resolvedWorkspaceId) {
    return [];
  }

  const memberships = await prisma.membership.findMany({
    where: { workspaceId: resolvedWorkspaceId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      team: { select: { name: true } }
    },
    orderBy: { user: { name: "asc" } }
  });

  const roomMemberships = await prisma.roomMembership.findMany({
    where: {
      userId: { in: memberships.map((membership) => membership.user.id) },
      room: { workspaceId: resolvedWorkspaceId }
    },
    include: {
      room: { select: { id: true, name: true } }
    },
    orderBy: { room: { name: "asc" } }
  });
  const roomsByUserId = new Map<string, typeof roomMemberships>();

  for (const roomMembership of roomMemberships) {
    const existing = roomsByUserId.get(roomMembership.userId) ?? [];
    existing.push(roomMembership);
    roomsByUserId.set(roomMembership.userId, existing);
  }

  return memberships.map((membership) => {
    const activeRooms = roomsByUserId.get(membership.user.id) ?? [];

    return {
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      workspaceRole: membership.role,
      functionLabel: membership.functionLabel,
      team: membership.team,
      activeRooms: activeRooms.map((roomMembership) => ({
        id: roomMembership.room.id,
        name: roomMembership.room.name,
        roomRole: roomMembership.role
      }))
    };
  });
}

export async function getCurrentUserWorkspaceMembership(
  email: string,
  workspaceId?: string
): Promise<WorkspaceMemberSummary | null> {
  const members = await listWorkspaceMembers(workspaceId);
  return members.find((member) => member.email === email) ?? null;
}
