import { NextResponse } from "next/server";
import { approveDocument } from "@/lib/room-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ docId: string }> }
) {
  const { docId } = await context.params;
  const document = await approveDocument(docId);

  return NextResponse.json({ document });
}
