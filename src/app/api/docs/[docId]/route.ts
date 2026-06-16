import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendRoomMessage, getDocumentRoomAccess } from "@/lib/access-control";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { isDraftArtifactMutationError, updateDraftDocument } from "@/lib/room-service";

const documentUpdateSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1)
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ docId: string }> }
) {
  const { docId } = await context.params;
  const currentUser = await getCurrentUserFromRequest(request);
  const access = await getDocumentRoomAccess(currentUser?.id, docId);

  if (!canSendRoomMessage(access)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = documentUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid document draft update." }, { status: 400 });
  }

  try {
    const document = await updateDraftDocument(docId, parsed.data);

    return NextResponse.json({ document });
  } catch (error) {
    if (isDraftArtifactMutationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }
}
