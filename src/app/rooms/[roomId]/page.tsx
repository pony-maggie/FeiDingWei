import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RoomTabs } from "@/components/room-tabs";
import { getProjectRoom } from "@/lib/room-service";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const room = await getProjectRoom(roomId);

  if (!room) {
    notFound();
  }

  return (
    <AppShell
      workspaceName={room.workspace.name}
      roomName={room.name}
      roomDescription={room.description}
    >
      <RoomTabs room={room} />
    </AppShell>
  );
}
