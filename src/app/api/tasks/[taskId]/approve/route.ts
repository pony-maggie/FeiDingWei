import { NextResponse } from "next/server";
import { approveTask } from "@/lib/room-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;
  const task = await approveTask(taskId);

  return NextResponse.json({ task });
}
