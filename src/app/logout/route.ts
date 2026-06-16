import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { deleteSession, sessionCookieName } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookieName)?.value;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  cookieStore.delete(sessionCookieName);

  return NextResponse.redirect(new URL("/login", request.url));
}
