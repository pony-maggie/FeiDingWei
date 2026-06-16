import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendRoomMessage, getTaskRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { assignTask } from "@/lib/review-service";

const assignTaskSchema = z.object({
  assigneeId: z.string().min(1)
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

  const parsed = assignTaskSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task assignment." }, { status: 400 });
  }

  const task = await assignTask({
    taskId,
    assigneeId: parsed.data.assigneeId,
    actorId: currentUser.id
  });

  return NextResponse.json({ task });
}
