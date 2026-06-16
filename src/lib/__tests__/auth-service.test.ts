import { describe, expect, it } from "vitest";
import { prisma } from "../db";
import {
  createSessionForUser,
  deleteSession,
  getCurrentUserFromSessionId,
  getUserByEmail,
  sessionCookieName
} from "../auth-service";

describe("auth service", () => {
  it("uses a stable session cookie name", () => {
    expect(sessionCookieName).toBe("feidingwei_session");
  });

  it("finds seeded users by email", async () => {
    const user = await getUserByEmail("founder@feidingwei.local");

    expect(user?.name).toBe("Founder");
  });

  it("creates and resolves a session for an existing user", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "founder@feidingwei.local" }
    });

    const sessionId = await createSessionForUser(user.id);
    const currentUser = await getCurrentUserFromSessionId(sessionId);

    expect(currentUser?.id).toBe(user.id);
    expect(currentUser?.email).toBe("founder@feidingwei.local");
  });

  it("returns null when no session id is provided", async () => {
    await expect(getCurrentUserFromSessionId(null)).resolves.toBeNull();
    await expect(getCurrentUserFromSessionId(undefined)).resolves.toBeNull();
  });

  it("deletes sessions so they no longer authenticate", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "founder@feidingwei.local" }
    });

    const sessionId = await createSessionForUser(user.id);
    await deleteSession(sessionId);

    await expect(getCurrentUserFromSessionId(sessionId)).resolves.toBeNull();
  });
});
