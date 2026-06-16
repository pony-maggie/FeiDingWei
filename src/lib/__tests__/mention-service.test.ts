import { describe, expect, it } from "vitest";
import { prisma } from "../db";
import { getDefaultRoomId } from "../room-service";
import {
  mentionTokenForUser,
  parseHumanMentionTokens,
  createMentionNotificationsForMessage
} from "../mention-service";

describe("mention service", () => {
  it("creates stable user mention tokens from seeded users", async () => {
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });

    expect(mentionTokenForUser(product)).toBe("@product");
  });

  it("parses human mentions without treating Agent mentions as humans", () => {
    expect(parseHumanMentionTokens("@product please review with @PMAgent")).toEqual([
      "@product"
    ]);
  });

  it("creates mention notifications for room members", async () => {
    const roomId = await getDefaultRoomId();
    const author = await prisma.user.findUniqueOrThrow({
      where: { email: "business@feidingwei.local" }
    });
    const message = await prisma.message.create({
      data: {
        body: "@product please review this customer request",
        roomId: roomId!,
        authorId: author.id
      }
    });

    await createMentionNotificationsForMessage({
      messageId: message.id,
      roomId: roomId!,
      actorId: author.id,
      body: message.body
    });

    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: product.id,
        actorId: author.id,
        roomId: roomId!,
        messageId: message.id,
        type: "mention"
      }
    });

    expect(notification).toEqual(
      expect.objectContaining({
        status: "unread",
        title: "Business mentioned you"
      })
    );
  });
});
