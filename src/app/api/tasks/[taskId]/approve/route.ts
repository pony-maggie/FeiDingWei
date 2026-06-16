import { NextResponse } from "next/server";
import {
  canApproveArtifacts,
  canOverrideArtifactReview,
  getTaskRoomAccess
} from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { prisma } from "@/lib/db";
import { approveTaskReview } from "@/lib/review-service";
import { approveTask, isDraftArtifactMutationError } from "@/lib/room-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;
  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getTaskRoomAccess(currentUser?.id, taskId);

  if (!currentUser || !canApproveArtifacts(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const reviewTarget = await prisma.task.findUnique({
      where: { id: taskId },
      select: { reviewerId: true }
    });
    if (
      reviewTarget?.reviewerId &&
      reviewTarget.reviewerId !== currentUser?.id &&
      !canOverrideArtifactReview(access)
    ) {
      return NextResponse.json(
        { error: "Only the requested reviewer can approve this task." },
        { status: 403 }
      );
    }

    const task =
      reviewTarget?.reviewerId === currentUser?.id
        ? await approveTaskReview(taskId, currentUser.id)
        : await approveTask(taskId);

    return NextResponse.json({ task });
  } catch (error) {
    if (isDraftArtifactMutationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }
}
