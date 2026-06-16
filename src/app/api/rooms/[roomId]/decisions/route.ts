import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendRoomMessage, getRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { createDecision } from "@/lib/decision-service";

const createDecisionSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  sourceMessageId: z.string().min(1).optional()
});

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await context.params;
  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getRoomAccess(currentUser?.id, roomId);

  if (!currentUser || !canSendRoomMessage(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = createDecisionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid decision." }, { status: 400 });
  }

  const decision = await createDecision({
    roomId,
    creatorId: currentUser.id,
    title: parsed.data.title,
    body: parsed.data.body,
    sourceMessageId: parsed.data.sourceMessageId
  });

  return NextResponse.json({ decision });
}
