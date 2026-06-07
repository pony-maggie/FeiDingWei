import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getProjectRoom } from "@/lib/room-service";

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
      <div className="p-6">
        <div className="rounded border border-line bg-white p-6">
          <h2 className="text-lg font-semibold">Project room loaded</h2>
          <p className="mt-2 text-sm text-slate-600">
            Chat, tasks, docs, agents, and activity tabs will appear here.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
