import { redirect } from "next/navigation";
import { getDefaultRoomId } from "@/lib/room-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const roomId = await getDefaultRoomId();

  if (!roomId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper p-8 text-ink">
        <div className="max-w-md rounded border border-line bg-white p-6">
          <h1 className="text-xl font-semibold">FeiDingWei</h1>
          <p className="mt-2 text-sm text-slate-600">
            Run the database seed command to create the first project room.
          </p>
        </div>
      </main>
    );
  }

  redirect(`/rooms/${roomId}`);
}
