import { NextResponse } from "next/server";
import { canApproveArtifacts, getDocumentRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { isDraftArtifactMutationError, rejectDocument } from "@/lib/room-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ docId: string }> }
) {
  const { docId } = await context.params;
  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getDocumentRoomAccess(currentUser?.id, docId);

  if (!canApproveArtifacts(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const document = await rejectDocument(docId);

    return NextResponse.json({ document });
  } catch (error) {
    if (isDraftArtifactMutationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }
}
