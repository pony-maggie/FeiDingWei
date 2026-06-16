import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserFromSessionId, sessionCookieName } from "@/lib/auth-service";
import { getDefaultWorkspaceId } from "@/lib/member-service";
import { getDefaultRoomId, listAccessibleRooms } from "@/lib/room-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const currentUser = await getCurrentUserFromSessionId(cookieStore.get(sessionCookieName)?.value);

  if (!currentUser) {
    redirect("/login");
  }

  const workspaceId = await getDefaultWorkspaceId();
  const accessibleRooms = workspaceId ? await listAccessibleRooms(currentUser.id, workspaceId) : [];
  const roomId = accessibleRooms[0]?.id ?? (await getDefaultRoomId());

  if (!roomId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper p-8 text-ink">
        <div className="max-w-md rounded border border-line bg-white p-6">
          <h1 className="text-xl font-semibold">FeiDingWei</h1>
          <p className="mt-2 text-sm text-slate-600">
            请先运行数据库 seed 命令，创建第一个项目房间。
          </p>
        </div>
      </main>
    );
  }

  redirect(`/rooms/${roomId}`);
}
