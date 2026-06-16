import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { InboxPanel } from "@/components/inbox-panel";
import { getCurrentUserFromSessionId, sessionCookieName } from "@/lib/auth-service";
import { translations } from "@/lib/i18n";
import { localizeText } from "@/lib/localized-room";
import { getCurrentUserWorkspaceMembership } from "@/lib/member-service";
import { listInboxForUser } from "@/lib/notification-service";
import { getDefaultRoomId, getProjectRoom } from "@/lib/room-service";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
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
  const inbox = await listInboxForUser(currentUser.id);
  const labels = translations.zh;

  return (
    <AppShell
      workspaceName={localizeText(room?.workspace.name ?? "FeiDingWei Labs", "zh")}
      roomName={localizeText(room?.name ?? labels.inbox.heading, "zh")}
      roomDescription={localizeText(
        room?.description ?? "Personal collaboration notifications.",
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
      <InboxPanel inbox={inbox} labels={labels.inbox} />
    </AppShell>
  );
}
