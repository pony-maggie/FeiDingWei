import { NextResponse } from "next/server";
import { createMessageAndMaybeRunAgent } from "@/lib/agent-service";
import { messageInputSchema } from "@/lib/domain";

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

  await createMessageAndMaybeRunAgent({
    roomId,
    body: parsed.data.body
  });

  return NextResponse.json({ ok: true });
}
