import { NextResponse } from "next/server";
import {
  canApproveArtifacts,
  canOverrideArtifactReview,
  getDocumentRoomAccess
} from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { prisma } from "@/lib/db";
import { approveDocumentReview } from "@/lib/review-service";
import { approveDocument, isDraftArtifactMutationError } from "@/lib/room-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ docId: string }> }
) {
  const { docId } = await context.params;
  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getDocumentRoomAccess(currentUser?.id, docId);

  if (!currentUser || !canApproveArtifacts(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const reviewTarget = await prisma.document.findUnique({
      where: { id: docId },
      select: { reviewerId: true }
    });
    if (
      reviewTarget?.reviewerId &&
      reviewTarget.reviewerId !== currentUser?.id &&
      !canOverrideArtifactReview(access)
    ) {
      return NextResponse.json(
        { error: "Only the requested reviewer can approve this document." },
        { status: 403 }
      );
    }

    const document =
      reviewTarget?.reviewerId === currentUser?.id
        ? await approveDocumentReview(docId, currentUser.id)
        : await approveDocument(docId);

    return NextResponse.json({ document });
  } catch (error) {
    if (isDraftArtifactMutationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }
}
