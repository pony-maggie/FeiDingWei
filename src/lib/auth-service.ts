import type { User } from "@prisma/client";
import { prisma } from "./db";

export const sessionCookieName = "feidingwei_session";

const sessionDurationMs = 30 * 24 * 60 * 60 * 1000;

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createSessionForUser(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt
    }
  });

  return session.id;
}

export async function getCurrentUserFromSessionId(sessionId?: string | null): Promise<User | null> {
  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return session.user;
}

export async function getCurrentUserFromRequest(request: Request): Promise<User | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const sessionId = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${sessionCookieName}=`))
    ?.slice(sessionCookieName.length + 1);

  return getCurrentUserFromSessionId(sessionId ? decodeURIComponent(sessionId) : null);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}
