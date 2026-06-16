import { prisma } from "./db";
import {
  defaultAgents,
  mentionTokenForUser,
  notificationStatusSchema,
  notificationTypeSchema
} from "./domain";

const agentMentionTokens = new Set(
  defaultAgents.map((agent) => agent.slug.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase()))
);

export { mentionTokenForUser };

export function parseHumanMentionTokens(body: string) {
  const tokens = body.match(/@[A-Za-z0-9._-]+\b/g) ?? [];
  const uniqueTokens = new Set<string>();

  for (const token of tokens) {
    const normalizedName = token.slice(1).toLowerCase();
    const isAgentToken = [...agentMentionTokens].some(
      (agentToken) => agentToken.toLowerCase() === normalizedName
    );

    if (!isAgentToken) {
      uniqueTokens.add(`@${normalizedName}`);
    }
  }

  return [...uniqueTokens];
}

export async function createMentionNotificationsForMessage(input: {
  messageId: string;
  roomId: string;
  actorId: string;
  body: string;
}) {
  const mentionedTokens = new Set(parseHumanMentionTokens(input.body));

  if (mentionedTokens.size === 0) {
    return [];
  }

  const [actor, roomMembers] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.actorId }, select: { name: true } }),
    prisma.roomMembership.findMany({
      where: { roomId: input.roomId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })
  ]);

  const actorName = actor?.name ?? "Someone";
  const type = notificationTypeSchema.parse("mention");
  const status = notificationStatusSchema.parse("unread");
  const notifications = [];

  for (const membership of roomMembers) {
    const user = membership.user;

    if (user.id === input.actorId || !mentionedTokens.has(mentionTokenForUser(user))) {
      continue;
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        status,
        title: `${actorName} mentioned you`,
        body: input.body,
        recipientId: user.id,
        actorId: input.actorId,
        roomId: input.roomId,
        messageId: input.messageId
      }
    });
    notifications.push(notification);
  }

  return notifications;
}
