import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth-service";
import { markNotificationRead } from "@/lib/notification-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ notificationId: string }> }
) {
  const currentUser = await getCurrentUserFromRequest(request);

  if (!currentUser) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { notificationId } = await context.params;
  const notification = await markNotificationRead(notificationId, currentUser.id);

  if (!notification) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  return NextResponse.json({ notification });
}
