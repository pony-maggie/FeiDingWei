import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionForUser, getUserByEmail, sessionCookieName } from "@/lib/auth-service";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const user = body.email ? await getUserByEmail(body.email) : null;

  if (!user) {
    return NextResponse.json({ error: "Invalid login user." }, { status: 401 });
  }

  const sessionId = await createSessionForUser(user.id);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60
  });

  return NextResponse.json({ ok: true });
}
