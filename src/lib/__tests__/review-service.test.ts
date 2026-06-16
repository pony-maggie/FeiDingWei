import { describe, expect, it } from "vitest";
import { prisma } from "../db";
import { getDefaultRoomId } from "../room-service";
import {
  ReviewPermissionError,
  approveDocumentReview,
  assignTask,
  assignDocumentOwner,
  approveTaskReview,
  requestDocumentReview,
  requestTaskReview,
  returnDocumentForRevision,
  returnTaskForRevision
} from "../review-service";

async function createDraftTask() {
  const roomId = await getDefaultRoomId();
  return prisma.task.create({
    data: {
      title: "Review service task",
      description: "Task under review.",
      status: "todo",
      priority: "medium",
      artifactStatus: "draft",
      reviewStatus: "none",
      roomId: roomId!
    }
  });
}

async function createDraftDocument() {
  const roomId = await getDefaultRoomId();
  return prisma.document.create({
    data: {
      title: "Review service document",
      body: "Document under review.",
      artifactStatus: "draft",
      reviewStatus: "none",
      roomId: roomId!
    }
  });
}

describe("review service", () => {
  it("assigns tasks and notifies the assignee", async () => {
    const task = await createDraftTask();
    const business = await prisma.user.findUniqueOrThrow({
      where: { email: "business@feidingwei.local" }
    });
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });

    const assigned = await assignTask({
      taskId: task.id,
      assigneeId: engineer.id,
      actorId: business.id
    });
    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: engineer.id,
        actorId: business.id,
        taskId: task.id,
        type: "assignment"
      }
    });

    expect(assigned.assigneeId).toBe(engineer.id);
    expect(notification).toEqual(
      expect.objectContaining({
        status: "unread",
        title: "Business assigned you a task"
      })
    );
  });

  it("requests task review and notifies the reviewer", async () => {
    const task = await createDraftTask();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });

    const reviewed = await requestTaskReview({
      taskId: task.id,
      reviewerId: qa.id,
      actorId: product.id
    });
    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: qa.id,
        actorId: product.id,
        taskId: task.id,
        type: "review_request"
      }
    });

    expect(reviewed.reviewerId).toBe(qa.id);
    expect(reviewed.reviewStatus).toBe("requested");
    expect(notification?.title).toBe("Product requested your review");
  });

  it("allows the reviewer to approve a draft task into active", async () => {
    const task = await createDraftTask();
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    await requestTaskReview({
      taskId: task.id,
      reviewerId: qa.id,
      actorId: qa.id
    });

    const approved = await approveTaskReview(task.id, qa.id);

    expect(approved.artifactStatus).toBe("active");
    expect(approved.reviewStatus).toBe("approved");
  });

  it("rejects task review approval from non-reviewers", async () => {
    const task = await createDraftTask();
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });
    await requestTaskReview({
      taskId: task.id,
      reviewerId: qa.id,
      actorId: engineer.id
    });

    await expect(approveTaskReview(task.id, engineer.id)).rejects.toBeInstanceOf(
      ReviewPermissionError
    );
  });

  it("returns tasks for revision and preserves reviewer comments", async () => {
    const task = await createDraftTask();
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    await assignTask({
      taskId: task.id,
      assigneeId: engineer.id,
      actorId: qa.id
    });
    await requestTaskReview({
      taskId: task.id,
      reviewerId: qa.id,
      actorId: engineer.id
    });

    const returned = await returnTaskForRevision({
      taskId: task.id,
      reviewerId: qa.id,
      commentBody: "Please add acceptance criteria."
    });
    const comment = await prisma.taskComment.findFirst({
      where: { taskId: task.id, authorId: qa.id }
    });
    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: engineer.id,
        actorId: qa.id,
        taskId: task.id,
        type: "returned_for_revision"
      }
    });

    expect(returned.reviewStatus).toBe("changes_requested");
    expect(returned.artifactStatus).toBe("draft");
    expect(returned.blockedReason).toBe("Please add acceptance criteria.");
    expect(comment).toEqual(
      expect.objectContaining({
        body: "Please add acceptance criteria.",
        authorId: qa.id
      })
    );
    expect(comment?.createdAt).toBeInstanceOf(Date);
    expect(notification?.title).toBe("QA returned your task for revision");
  });

  it("assigns document owners and notifies them", async () => {
    const document = await createDraftDocument();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const business = await prisma.user.findUniqueOrThrow({
      where: { email: "business@feidingwei.local" }
    });

    const assigned = await assignDocumentOwner({
      documentId: document.id,
      ownerId: product.id,
      actorId: business.id
    });
    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: product.id,
        actorId: business.id,
        documentId: document.id,
        type: "assignment"
      }
    });

    expect(assigned.ownerId).toBe(product.id);
    expect(notification?.title).toBe("Business assigned you a document");
  });

  it("requests document review and allows only the reviewer to approve", async () => {
    const document = await createDraftDocument();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });

    const reviewed = await requestDocumentReview({
      documentId: document.id,
      reviewerId: qa.id,
      actorId: product.id
    });
    await expect(approveDocumentReview(document.id, engineer.id)).rejects.toBeInstanceOf(
      ReviewPermissionError
    );
    const approved = await approveDocumentReview(document.id, qa.id);

    expect(reviewed.reviewerId).toBe(qa.id);
    expect(reviewed.reviewStatus).toBe("requested");
    expect(approved.artifactStatus).toBe("active");
    expect(approved.reviewStatus).toBe("approved");
  });

  it("returns documents for revision and preserves reviewer comments", async () => {
    const document = await createDraftDocument();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    await assignDocumentOwner({
      documentId: document.id,
      ownerId: product.id,
      actorId: qa.id
    });
    await requestDocumentReview({
      documentId: document.id,
      reviewerId: qa.id,
      actorId: product.id
    });

    const returned = await returnDocumentForRevision({
      documentId: document.id,
      reviewerId: qa.id,
      commentBody: "Please clarify launch risks."
    });
    const comment = await prisma.documentComment.findFirst({
      where: { documentId: document.id, authorId: qa.id }
    });
    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: product.id,
        actorId: qa.id,
        documentId: document.id,
        type: "returned_for_revision"
      }
    });

    expect(returned.reviewStatus).toBe("changes_requested");
    expect(returned.artifactStatus).toBe("draft");
    expect(returned.blockedReason).toBe("Please clarify launch risks.");
    expect(comment?.body).toBe("Please clarify launch risks.");
    expect(notification?.title).toBe("QA returned your document for revision");
  });
});
