import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendRoomMessage, getDocumentRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { ReviewPermissionError, returnDocumentForRevision } from "@/lib/review-service";

const returnDocumentSchema = z.object({
  commentBody: z.string().trim().min(1)
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

  const parsed = returnDocumentSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid document revision return." }, { status: 400 });
  }

  try {
    const document = await returnDocumentForRevision({
      documentId: docId,
      reviewerId: currentUser.id,
      commentBody: parsed.data.commentBody
    });

    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof ReviewPermissionError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    throw error;
  }
}
