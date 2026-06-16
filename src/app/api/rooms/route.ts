import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { prisma } from "@/lib/db";
import { roomRoleSchema } from "@/lib/domain";
import { createProjectRoomWithMembers } from "@/lib/room-service";

const roomCreateSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  members: z
    .array(
      z.object({
        userId: z.string().min(1),
        role: roomRoleSchema
      })
    )
    .default([])
});

export async function POST(request: Request) {
  const currentUser = await getCurrentUserFromRequest(request);

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = roomCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Room name and description are required." }, { status: 400 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: currentUser.id },
    orderBy: { id: "asc" },
    select: { workspaceId: true }
  });

  if (!membership) {
    return NextResponse.json({ error: "Workspace membership required." }, { status: 403 });
  }

  const room = await createProjectRoomWithMembers({
    workspaceId: membership.workspaceId,
    creatorId: currentUser.id,
    name: parsed.data.name,
    description: parsed.data.description,
    members: parsed.data.members
  });

  return NextResponse.json({ room: { id: room.id, name: room.name } });
}
