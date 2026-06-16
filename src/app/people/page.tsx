import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PeopleDirectory } from "@/components/people-directory";
import { getCurrentUserFromSessionId, sessionCookieName } from "@/lib/auth-service";
import { translations } from "@/lib/i18n";
import { localizeText } from "@/lib/localized-room";
import {
  getCurrentUserWorkspaceMembership,
  listWorkspaceMembers
} from "@/lib/member-service";
import { getDefaultRoomId, getProjectRoom } from "@/lib/room-service";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromSessionId(cookieStore.get(sessionCookieName)?.value);

  if (!currentUser) {
    redirect("/login");
  }

  const roomId = await getDefaultRoomId();
  const room = roomId ? await getProjectRoom(roomId) : null;
  const currentMembership = room
    ? await getCurrentUserWorkspaceMembership(currentUser.email, room.workspace.id)
    : null;
  const members = await listWorkspaceMembers(room?.workspace.id);
  const labels = translations.zh;

  return (
    <AppShell
      workspaceName={localizeText(room?.workspace.name ?? "FeiDingWei Labs", "zh")}
      roomName={localizeText(room?.name ?? labels.people.heading, "zh")}
      roomDescription={localizeText(
        room?.description ?? "Workspace member directory.",
        "zh"
      )}
      labels={labels.shell}
      currentUser={{
        name: currentUser.name,
        email: currentUser.email,
        workspaceRole: currentMembership?.workspaceRole,
        functionLabel: currentMembership?.functionLabel,
        team: currentMembership?.team
      }}
    >
      <PeopleDirectory members={members} labels={labels.people} />
    </AppShell>
  );
}
