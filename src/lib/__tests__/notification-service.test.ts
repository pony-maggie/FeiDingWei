import { describe, expect, it } from "vitest";
import { notificationTypeSchema } from "../domain";
import { prisma } from "../db";
import { getDefaultRoomId } from "../room-service";
import {
  createNotification,
  listInboxForUser,
  markNotificationRead
} from "../notification-service";

describe("notification service", () => {
  it("accepts V2 collaboration notification types", () => {
    expect(notificationTypeSchema.parse("mention")).toBe("mention");
    expect(notificationTypeSchema.parse("assignment")).toBe("assignment");
    expect(notificationTypeSchema.parse("review_request")).toBe("review_request");
    expect(notificationTypeSchema.parse("agent_completed")).toBe("agent_completed");
    expect(notificationTypeSchema.parse("agent_failed")).toBe("agent_failed");
    expect(notificationTypeSchema.parse("returned_for_revision")).toBe("returned_for_revision");
  });

  it("creates unread notifications and lists the current user's inbox", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const business = await prisma.user.findUniqueOrThrow({
      where: { email: "business@feidingwei.local" }
    });

    const notification = await createNotification({
      recipientId: product.id,
      actorId: business.id,
      roomId: roomId!,
      type: "assignment",
      title: "Business assigned you a task",
      body: "Please own the customer interview follow-up."
    });
    const inbox = await listInboxForUser(product.id);

    expect(notification.status).toBe("unread");
    expect(inbox.unread[0]).toEqual(
      expect.objectContaining({
        id: notification.id,
        type: "assignment",
        title: "Business assigned you a task",
        actor: { name: "Business" },
        room: { id: roomId, name: "Agent Project Room" }
      })
    );
    expect(inbox.read.some((item) => item.id === notification.id)).toBe(false);
  });

  it("marks only the recipient's notification as read", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });
    const notification = await createNotification({
      recipientId: product.id,
      actorId: engineer.id,
      roomId: roomId!,
      type: "review_request",
      title: "Engineer requested review",
      body: "Please review the API task."
    });

    await expect(markNotificationRead(notification.id, engineer.id)).resolves.toBeNull();
    await expect(markNotificationRead(notification.id, product.id)).resolves.toEqual(
      expect.objectContaining({
        id: notification.id,
        status: "read"
      })
    );
  });
});
