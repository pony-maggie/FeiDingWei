import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendRoomMessage, getTaskRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { isDraftArtifactMutationError, updateDraftTask } from "@/lib/room-service";

const taskUpdateSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  priority: z.enum(["low", "medium", "high"])
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;
  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getTaskRoomAccess(currentUser?.id, taskId);

  if (!canSendRoomMessage(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = taskUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task draft update." }, { status: 400 });
  }

  try {
    const task = await updateDraftTask(taskId, parsed.data);

    return NextResponse.json({ task });
  } catch (error) {
    if (isDraftArtifactMutationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }
}
