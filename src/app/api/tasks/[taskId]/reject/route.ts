import { NextResponse } from "next/server";
import { canApproveArtifacts, getTaskRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { isDraftArtifactMutationError, rejectTask } from "@/lib/room-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;
  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getTaskRoomAccess(currentUser?.id, taskId);

  if (!canApproveArtifacts(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const task = await rejectTask(taskId);

    return NextResponse.json({ task });
  } catch (error) {
    if (isDraftArtifactMutationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }
}
