import { prisma } from "./db";
import {
  notificationStatusSchema,
  notificationTypeSchema,
  type NotificationType
} from "./domain";

type NotificationInput = {
  recipientId: string;
  actorId?: string | null;
  roomId: string;
  messageId?: string | null;
  taskId?: string | null;
  documentId?: string | null;
  agentRunId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({
    data: {
      recipientId: input.recipientId,
      actorId: input.actorId ?? null,
      roomId: input.roomId,
      messageId: input.messageId ?? null,
      taskId: input.taskId ?? null,
      documentId: input.documentId ?? null,
      agentRunId: input.agentRunId ?? null,
      type: notificationTypeSchema.parse(input.type),
      status: notificationStatusSchema.parse("unread"),
      title: input.title,
      body: input.body
    }
  });
}

export async function listInboxForUser(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    include: {
      actor: { select: { name: true } },
      room: { select: { id: true, name: true } },
      message: { select: { id: true, body: true } },
      task: { select: { id: true, title: true } },
      document: { select: { id: true, title: true } },
      agentRun: { select: { id: true, status: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return {
    unread: notifications.filter((notification) => notification.status === "unread"),
    read: notifications.filter((notification) => notification.status === "read")
  };
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientId: userId
    },
    data: { status: notificationStatusSchema.parse("read") }
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.notification.findUniqueOrThrow({
    where: { id: notificationId }
  });
}
