import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendRoomMessage, getTaskRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { ReviewPermissionError, returnTaskForRevision } from "@/lib/review-service";

const returnTaskSchema = z.object({
  commentBody: z.string().trim().min(1)
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

  const parsed = returnTaskSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task revision return." }, { status: 400 });
  }

  try {
    const task = await returnTaskForRevision({
      taskId,
      reviewerId: currentUser.id,
      commentBody: parsed.data.commentBody
    });

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof ReviewPermissionError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    throw error;
  }
}
