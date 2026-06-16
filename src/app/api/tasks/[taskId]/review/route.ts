import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendRoomMessage, getTaskRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { requestTaskReview } from "@/lib/review-service";

const requestReviewSchema = z.object({
  reviewerId: z.string().min(1)
});

export async function POST(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;
  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getTaskRoomAccess(currentUser?.id, taskId);

  if (!currentUser || !canSendRoomMessage(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = requestReviewSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task review request." }, { status: 400 });
  }

  const task = await requestTaskReview({
    taskId,
    reviewerId: parsed.data.reviewerId,
    actorId: currentUser.id
  });

  return NextResponse.json({ task });
}
