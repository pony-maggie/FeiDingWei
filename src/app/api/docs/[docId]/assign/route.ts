import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendRoomMessage, getDocumentRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { assignDocumentOwner } from "@/lib/review-service";

const assignDocumentSchema = z.object({
  ownerId: z.string().min(1)
});

export async function POST(
  request: Request,
  context: { params: Promise<{ docId: string }> }
) {
  const { docId } = await context.params;
  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getDocumentRoomAccess(currentUser?.id, docId);

  if (!currentUser || !canSendRoomMessage(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = assignDocumentSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid document assignment." }, { status: 400 });
  }

  const document = await assignDocumentOwner({
    documentId: docId,
    ownerId: parsed.data.ownerId,
    actorId: currentUser.id
  });

  return NextResponse.json({ document });
}
