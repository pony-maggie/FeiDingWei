import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendRoomMessage, getDocumentRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { requestDocumentReview } from "@/lib/review-service";

const requestDocumentReviewSchema = z.object({
  reviewerId: z.string().min(1)
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

  const parsed = requestDocumentReviewSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid document review request." }, { status: 400 });
  }

  const document = await requestDocumentReview({
    documentId: docId,
    reviewerId: parsed.data.reviewerId,
    actorId: currentUser.id
  });

  return NextResponse.json({ document });
}
