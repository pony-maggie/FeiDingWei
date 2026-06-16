import { prisma } from "./db";
import { reviewStatusSchema } from "./domain";
import { createNotification } from "./notification-service";

export class ReviewPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewPermissionError";
  }
}

export async function assignTask(input: {
  taskId: string;
  assigneeId: string;
  actorId: string;
}) {
  const task = await prisma.task.update({
    where: { id: input.taskId },
    data: { assigneeId: input.assigneeId },
    include: {
      assignee: { select: { id: true } },
      room: { select: { id: true } }
    }
  });
  const actor = await prisma.user.findUnique({
    where: { id: input.actorId },
    select: { name: true }
  });

  await createNotification({
    recipientId: input.assigneeId,
    actorId: input.actorId,
    roomId: task.room.id,
    taskId: task.id,
    type: "assignment",
    title: `${actor?.name ?? "Someone"} assigned you a task`,
    body: task.title
  });

  return task;
}

export async function assignDocumentOwner(input: {
  documentId: string;
  ownerId: string;
  actorId: string;
}) {
  const document = await prisma.document.update({
    where: { id: input.documentId },
    data: { ownerId: input.ownerId },
    include: {
      room: { select: { id: true } }
    }
  });
  const actor = await prisma.user.findUnique({
    where: { id: input.actorId },
    select: { name: true }
  });

  await createNotification({
    recipientId: input.ownerId,
    actorId: input.actorId,
    roomId: document.room.id,
    documentId: document.id,
    type: "assignment",
    title: `${actor?.name ?? "Someone"} assigned you a document`,
    body: document.title
  });

  return document;
}

export async function requestTaskReview(input: {
  taskId: string;
  reviewerId: string;
  actorId: string;
}) {
  const task = await prisma.task.update({
    where: { id: input.taskId },
    data: {
      reviewerId: input.reviewerId,
      reviewStatus: reviewStatusSchema.parse("requested")
    },
    include: {
      room: { select: { id: true } }
    }
  });
  const actor = await prisma.user.findUnique({
    where: { id: input.actorId },
    select: { name: true }
  });

  await createNotification({
    recipientId: input.reviewerId,
    actorId: input.actorId,
    roomId: task.room.id,
    taskId: task.id,
    type: "review_request",
    title: `${actor?.name ?? "Someone"} requested your review`,
    body: task.title
  });

  return task;
}

export async function requestDocumentReview(input: {
  documentId: string;
  reviewerId: string;
  actorId: string;
}) {
  const document = await prisma.document.update({
    where: { id: input.documentId },
    data: {
      reviewerId: input.reviewerId,
      reviewStatus: reviewStatusSchema.parse("requested")
    },
    include: {
      room: { select: { id: true } }
    }
  });
  const actor = await prisma.user.findUnique({
    where: { id: input.actorId },
    select: { name: true }
  });

  await createNotification({
    recipientId: input.reviewerId,
    actorId: input.actorId,
    roomId: document.room.id,
    documentId: document.id,
    type: "review_request",
    title: `${actor?.name ?? "Someone"} requested your review`,
    body: document.title
  });

  return document;
}

export async function approveTaskReview(taskId: string, reviewerId: string) {
  const task = await prisma.task.findUniqueOrThrow({
    where: { id: taskId },
    select: { reviewerId: true }
  });

  if (task.reviewerId !== reviewerId) {
    throw new ReviewPermissionError("Only the requested reviewer can approve this task.");
  }

  return prisma.task.update({
    where: { id: taskId },
      data: {
        artifactStatus: "active",
        reviewStatus: reviewStatusSchema.parse("approved"),
        blockedReason: null
      }
  });
}

export async function approveDocumentReview(documentId: string, reviewerId: string) {
  const document = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
    select: { reviewerId: true }
  });

  if (document.reviewerId !== reviewerId) {
    throw new ReviewPermissionError("Only the requested reviewer can approve this document.");
  }

  return prisma.document.update({
    where: { id: documentId },
      data: {
        artifactStatus: "active",
        reviewStatus: reviewStatusSchema.parse("approved"),
        blockedReason: null
      }
  });
}

export async function returnTaskForRevision(input: {
  taskId: string;
  reviewerId: string;
  commentBody: string;
}) {
  const task = await prisma.task.findUniqueOrThrow({
    where: { id: input.taskId },
    include: {
      room: { select: { id: true } },
      assignee: { select: { id: true } }
    }
  });

  if (task.reviewerId !== input.reviewerId) {
    throw new ReviewPermissionError("Only the requested reviewer can return this task.");
  }

  const [reviewer, updated] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.reviewerId }, select: { name: true } }),
    prisma.task.update({
      where: { id: input.taskId },
      data: {
        artifactStatus: "draft",
        reviewStatus: reviewStatusSchema.parse("changes_requested"),
        blockedReason: input.commentBody,
        comments: {
          create: {
            body: input.commentBody,
            authorId: input.reviewerId
          }
        }
      }
    })
  ]);

  if (task.assignee?.id) {
    await createNotification({
      recipientId: task.assignee.id,
      actorId: input.reviewerId,
      roomId: task.room.id,
      taskId: task.id,
      type: "returned_for_revision",
      title: `${reviewer?.name ?? "Reviewer"} returned your task for revision`,
      body: input.commentBody
    });
  }

  return updated;
}

export async function returnDocumentForRevision(input: {
  documentId: string;
  reviewerId: string;
  commentBody: string;
}) {
  const document = await prisma.document.findUniqueOrThrow({
    where: { id: input.documentId },
    include: {
      room: { select: { id: true } },
      owner: { select: { id: true } }
    }
  });

  if (document.reviewerId !== input.reviewerId) {
    throw new ReviewPermissionError("Only the requested reviewer can return this document.");
  }

  const [reviewer, updated] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.reviewerId }, select: { name: true } }),
    prisma.document.update({
      where: { id: input.documentId },
      data: {
        artifactStatus: "draft",
        reviewStatus: reviewStatusSchema.parse("changes_requested"),
        blockedReason: input.commentBody,
        comments: {
          create: {
            body: input.commentBody,
            authorId: input.reviewerId
          }
        }
      }
    })
  ]);

  if (document.owner?.id) {
    await createNotification({
      recipientId: document.owner.id,
      actorId: input.reviewerId,
      roomId: document.room.id,
      documentId: document.id,
      type: "returned_for_revision",
      title: `${reviewer?.name ?? "Reviewer"} returned your document for revision`,
      body: input.commentBody
    });
  }

  return updated;
}
