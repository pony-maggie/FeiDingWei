import { notFound } from "next/navigation";
import { ProjectRoom } from "@/components/project-room";
import { getProjectRoom } from "@/lib/room-service";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const room = await getProjectRoom(roomId);

  if (!room) {
    notFound();
  }

  return <ProjectRoom room={room} />;
}
