import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { ProjectRoom } from "@/components/project-room";
import { canReadRoom, getRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromSessionId, sessionCookieName } from "@/lib/auth-service";
import { resolveLlmRuntimeConfig } from "@/lib/llm-config";
import { getCurrentUserWorkspaceMembership, listWorkspaceMembers } from "@/lib/member-service";
import { getProjectRoom, listAccessibleRooms } from "@/lib/room-service";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromSessionId(cookieStore.get(sessionCookieName)?.value);

  if (!currentUser) {
    redirect("/login");
  }

  const { roomId } = await params;
  const access = await getRoomAccess(currentUser.id, roomId);

  if (!canReadRoom(access)) {
    notFound();
  }

  const room = await getProjectRoom(roomId);

  if (!room) {
    notFound();
  }

  const currentMembership = await getCurrentUserWorkspaceMembership(
    currentUser.email,
    room.workspace.id
  );
  const [accessibleRooms, workspaceMembers] = await Promise.all([
    listAccessibleRooms(currentUser.id, room.workspace.id),
    listWorkspaceMembers(room.workspace.id)
  ]);

  return (
    <ProjectRoom
      room={room}
      llmConfig={resolveLlmRuntimeConfig()}
      accessibleRooms={accessibleRooms}
      workspaceMembers={workspaceMembers}
      currentUser={{
        name: currentUser.name,
        email: currentUser.email,
        workspaceRole: currentMembership?.workspaceRole,
        functionLabel: currentMembership?.functionLabel,
        team: currentMembership?.team
      }}
    />
  );
}
