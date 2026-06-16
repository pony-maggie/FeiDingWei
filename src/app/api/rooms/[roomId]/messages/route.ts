import { NextResponse } from "next/server";
import { getRoomAccess, canExecuteAgents, canSendRoomMessage } from "@/lib/access-control";
import { createMessageAndMaybeRunAgent } from "@/lib/agent-service";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { messageInputSchema } from "@/lib/domain";
import { extractAgentSlug } from "@/lib/domain";

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await context.params;
  const body = await request.json();
  const parsed = messageInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Message body is required." }, { status: 400 });
  }

  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getRoomAccess(currentUser?.id, roomId);

  if (!canSendRoomMessage(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (extractAgentSlug(parsed.data.body) && !canExecuteAgents(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await createMessageAndMaybeRunAgent({
    roomId,
    body: parsed.data.body,
    authorId: currentUser?.id
  });

  return NextResponse.json({ ok: true });
}
