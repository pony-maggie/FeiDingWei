import { describe, expect, it } from "vitest";
import { createSessionForUser, sessionCookieName } from "@/lib/auth-service";
import { prisma } from "@/lib/db";
import { getDefaultRoomId } from "@/lib/room-service";
import { POST as approveDoc } from "../docs/[docId]/approve/route";
import { POST as assignDocRoute } from "../docs/[docId]/assign/route";
import { PATCH as patchDoc } from "../docs/[docId]/route";
import { POST as requestDocReviewRoute } from "../docs/[docId]/review/route";
import { POST as rejectDoc } from "../docs/[docId]/reject/route";
import { POST as returnDocRoute } from "../docs/[docId]/return/route";
import { POST as readNotification } from "../notifications/[notificationId]/read/route";
import { POST as createRoomRoute } from "../rooms/route";
import { POST as createDecisionRoute } from "../rooms/[roomId]/decisions/route";
import { POST as postMessage } from "../rooms/[roomId]/messages/route";
import { POST as approveTask } from "../tasks/[taskId]/approve/route";
import { POST as assignTaskRoute } from "../tasks/[taskId]/assign/route";
import { PATCH as patchTask } from "../tasks/[taskId]/route";
import { POST as requestTaskReviewRoute } from "../tasks/[taskId]/review/route";
import { POST as returnTaskRoute } from "../tasks/[taskId]/return/route";
import { POST as rejectTask } from "../tasks/[taskId]/reject/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

async function authedRequest({
  body,
  email = "product@feidingwei.local",
  method = "POST"
}: {
  body?: unknown;
  email?: string;
  method?: string;
} = {}) {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const sessionId = await createSessionForUser(user.id);
  return new Request("http://localhost/api-test", {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: `${sessionCookieName}=${encodeURIComponent(sessionId)}`
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

describe("api routes", () => {
  it("creates rooms with selected members through API routes", async () => {
    const business = await prisma.user.findUniqueOrThrow({
      where: { email: "business@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    const response = await createRoomRoute(
      await authedRequest({
        body: {
          name: "API Created Room",
          description: "Created from the sidebar.",
          members: [
            { userId: business.id, role: "contributor" },
            { userId: qa.id, role: "reviewer" }
          ]
        },
        email: "product@feidingwei.local"
      })
    );
    const body = await response.json();
    const room = await prisma.projectRoom.findUniqueOrThrow({
      where: { id: body.room.id },
      include: { roomMemberships: true, agents: true }
    });

    expect(response.status).toBe(200);
    expect(room.name).toBe("API Created Room");
    expect(room.agents).toHaveLength(3);
    expect(room.roomMemberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: business.id, role: "contributor" }),
        expect.objectContaining({ userId: qa.id, role: "reviewer" })
      ])
    );
  });

  it("rejects invalid room creation input", async () => {
    const response = await createRoomRoute(
      await authedRequest({
        body: {
          name: "",
          description: "",
          members: []
        }
      })
    );

    expect(response.status).toBe(400);
  });

  it("rejects anonymous room creation", async () => {
    const response = await createRoomRoute(jsonRequest({ name: "No session", description: "No" }));

    expect(response.status).toBe(401);
  });

  it("rejects empty room messages", async () => {
    const roomId = await getDefaultRoomId();
    const response = await postMessage(jsonRequest({ body: "" }), {
      params: Promise.resolve({ roomId: roomId! })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Message body is required." });
  });

  it("persists plain room messages", async () => {
    const roomId = await getDefaultRoomId();
    const response = await postMessage(
      await authedRequest({
        body: { body: "plain project update" },
        email: "engineer@feidingwei.local"
      }),
      {
        params: Promise.resolve({ roomId: roomId! })
      }
    );

    const persisted = await prisma.message.findFirst({
      where: { roomId: roomId!, body: "plain project update" }
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(persisted).toBeTruthy();
  });

  it("creates mention notifications from room messages", async () => {
    const roomId = await getDefaultRoomId();
    const response = await postMessage(
      await authedRequest({
        body: { body: "@product please review this customer request" },
        email: "business@feidingwei.local"
      }),
      {
        params: Promise.resolve({ roomId: roomId! })
      }
    );
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const business = await prisma.user.findUniqueOrThrow({
      where: { email: "business@feidingwei.local" }
    });
    const message = await prisma.message.findFirstOrThrow({
      where: {
        roomId: roomId!,
        authorId: business.id,
        body: "@product please review this customer request"
      },
      orderBy: { createdAt: "desc" }
    });
    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: product.id,
        actorId: business.id,
        roomId: roomId!,
        messageId: message.id,
        type: "mention"
      },
      orderBy: { createdAt: "desc" }
    });

    expect(response.status).toBe(200);
    expect(notification).toEqual(
      expect.objectContaining({
        status: "unread",
        title: "Business mentioned you"
      })
    );
  });

  it("marks notifications read for the recipient only", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const business = await prisma.user.findUniqueOrThrow({
      where: { email: "business@feidingwei.local" }
    });
    const notification = await prisma.notification.create({
      data: {
        recipientId: product.id,
        actorId: business.id,
        roomId: roomId!,
        type: "mention",
        status: "unread",
        title: "Business mentioned you",
        body: "@product please review this"
      }
    });

    const forbidden = await readNotification(
      await authedRequest({ email: "engineer@feidingwei.local" }),
      {
        params: Promise.resolve({ notificationId: notification.id })
      }
    );
    const response = await readNotification(
      await authedRequest({ email: "product@feidingwei.local" }),
      {
        params: Promise.resolve({ notificationId: notification.id })
      }
    );
    const body = await response.json();

    expect(forbidden.status).toBe(404);
    expect(response.status).toBe(200);
    expect(body.notification.status).toBe("read");
  });

  it("creates human decisions through API routes", async () => {
    const roomId = await getDefaultRoomId();
    const response = await createDecisionRoute(
      await authedRequest({
        body: {
          title: "API decision",
          body: "Keep the first release private."
        },
        email: "product@feidingwei.local"
      }),
      {
        params: Promise.resolve({ roomId: roomId! })
      }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.decision.status).toBe("active");
    expect(body.decision.title).toBe("API decision");
  });

  it("approves draft tasks", async () => {
    const roomId = await getDefaultRoomId();
    const task = await prisma.task.create({
      data: {
        title: "API draft task",
        description: "Approve through route",
        status: "todo",
        priority: "medium",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const response = await approveTask(await authedRequest(), {
      params: Promise.resolve({ taskId: task.id })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.task.artifactStatus).toBe("active");
  });

  it("updates draft tasks", async () => {
    const roomId = await getDefaultRoomId();
    const task = await prisma.task.create({
      data: {
        title: "API original task",
        description: "Original description",
        status: "todo",
        priority: "medium",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const response = await patchTask(
      await authedRequest({
        method: "PATCH",
        email: "engineer@feidingwei.local",
        body: {
        title: "API edited task",
        description: "Edited description",
        priority: "high"
        }
      }),
      {
        params: Promise.resolve({ taskId: task.id })
      }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.task.title).toBe("API edited task");
    expect(body.task.description).toBe("Edited description");
    expect(body.task.priority).toBe("high");
    expect(body.task.artifactStatus).toBe("draft");
  });

  it("assigns tasks and requests review through API routes", async () => {
    const roomId = await getDefaultRoomId();
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    const task = await prisma.task.create({
      data: {
        title: "API assignable task",
        description: "Assign and review through route",
        status: "todo",
        priority: "medium",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const assignResponse = await assignTaskRoute(
      await authedRequest({
        body: { assigneeId: engineer.id },
        email: "product@feidingwei.local"
      }),
      { params: Promise.resolve({ taskId: task.id }) }
    );
    const reviewResponse = await requestTaskReviewRoute(
      await authedRequest({
        body: { reviewerId: qa.id },
        email: "engineer@feidingwei.local"
      }),
      { params: Promise.resolve({ taskId: task.id }) }
    );
    const reviewed = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });

    expect(assignResponse.status).toBe(200);
    expect(reviewResponse.status).toBe(200);
    expect(reviewed.assigneeId).toBe(engineer.id);
    expect(reviewed.reviewerId).toBe(qa.id);
    expect(reviewed.reviewStatus).toBe("requested");
  });

  it("returns tasks for revision through API routes", async () => {
    const roomId = await getDefaultRoomId();
    const engineer = await prisma.user.findUniqueOrThrow({
      where: { email: "engineer@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    const task = await prisma.task.create({
      data: {
        title: "API return task",
        description: "Return through route",
        status: "todo",
        priority: "medium",
        artifactStatus: "draft",
        assigneeId: engineer.id,
        reviewerId: qa.id,
        reviewStatus: "requested",
        roomId: roomId!
      }
    });

    const response = await returnTaskRoute(
      await authedRequest({
        body: { commentBody: "Please add acceptance criteria." },
        email: "qa@feidingwei.local"
      }),
      { params: Promise.resolve({ taskId: task.id }) }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.task.reviewStatus).toBe("changes_requested");
  });

  it("blocks task review approval from non-requested reviewers", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const task = await prisma.task.create({
      data: {
        title: "API reviewer gated task",
        description: "Only the requested reviewer can approve.",
        status: "todo",
        priority: "medium",
        artifactStatus: "draft",
        reviewerId: product.id,
        reviewStatus: "requested",
        roomId: roomId!
      }
    });

    const forbidden = await approveTask(
      await authedRequest({ email: "qa@feidingwei.local" }),
      {
        params: Promise.resolve({ taskId: task.id })
      }
    );
    const allowed = await approveTask(await authedRequest({ email: "product@feidingwei.local" }), {
      params: Promise.resolve({ taskId: task.id })
    });
    const body = await allowed.json();

    expect(forbidden.status).toBe(403);
    expect(allowed.status).toBe(200);
    expect(body.task.artifactStatus).toBe("active");
    expect(body.task.reviewStatus).toBe("approved");
  });

  it("rejects draft tasks", async () => {
    const roomId = await getDefaultRoomId();
    const task = await prisma.task.create({
      data: {
        title: "API rejected task",
        description: "Reject through route",
        status: "todo",
        priority: "medium",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const response = await rejectTask(await authedRequest(), {
      params: Promise.resolve({ taskId: task.id })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.task.artifactStatus).toBe("rejected");
  });

  it("returns conflict when rejecting a non-draft task", async () => {
    const roomId = await getDefaultRoomId();
    const task = await prisma.task.create({
      data: {
        title: "API active task",
        description: "Reject should not be a no-op success.",
        status: "todo",
        priority: "medium",
        artifactStatus: "active",
        roomId: roomId!
      }
    });

    const response = await rejectTask(await authedRequest(), {
      params: Promise.resolve({ taskId: task.id })
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ error: "Only draft task artifacts can be rejected." });
  });

  it("approves draft documents", async () => {
    const roomId = await getDefaultRoomId();
    const doc = await prisma.document.create({
      data: {
        title: "API draft doc",
        body: "Approve through route",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const response = await approveDoc(await authedRequest(), {
      params: Promise.resolve({ docId: doc.id })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.document.artifactStatus).toBe("active");
  });

  it("updates draft documents", async () => {
    const roomId = await getDefaultRoomId();
    const doc = await prisma.document.create({
      data: {
        title: "API original doc",
        body: "Original body",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const response = await patchDoc(
      await authedRequest({
        method: "PATCH",
        email: "engineer@feidingwei.local",
        body: {
        title: "API edited doc",
        body: "Edited body"
        }
      }),
      {
        params: Promise.resolve({ docId: doc.id })
      }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.document.title).toBe("API edited doc");
    expect(body.document.body).toBe("Edited body");
    expect(body.document.artifactStatus).toBe("draft");
  });

  it("assigns documents and requests review through API routes", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    const doc = await prisma.document.create({
      data: {
        title: "API assignable doc",
        body: "Assign and review through route",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const assignResponse = await assignDocRoute(
      await authedRequest({
        body: { ownerId: product.id },
        email: "business@feidingwei.local"
      }),
      { params: Promise.resolve({ docId: doc.id }) }
    );
    const reviewResponse = await requestDocReviewRoute(
      await authedRequest({
        body: { reviewerId: qa.id },
        email: "product@feidingwei.local"
      }),
      { params: Promise.resolve({ docId: doc.id }) }
    );
    const reviewed = await prisma.document.findUniqueOrThrow({ where: { id: doc.id } });

    expect(assignResponse.status).toBe(200);
    expect(reviewResponse.status).toBe(200);
    expect(reviewed.ownerId).toBe(product.id);
    expect(reviewed.reviewerId).toBe(qa.id);
    expect(reviewed.reviewStatus).toBe("requested");
  });

  it("blocks document review approval from non-requested reviewers", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const doc = await prisma.document.create({
      data: {
        title: "API reviewer gated doc",
        body: "Only the requested reviewer can approve.",
        artifactStatus: "draft",
        reviewerId: product.id,
        reviewStatus: "requested",
        roomId: roomId!
      }
    });

    const forbidden = await approveDoc(
      await authedRequest({ email: "qa@feidingwei.local" }),
      {
        params: Promise.resolve({ docId: doc.id })
      }
    );
    const allowed = await approveDoc(await authedRequest({ email: "product@feidingwei.local" }), {
      params: Promise.resolve({ docId: doc.id })
    });
    const body = await allowed.json();

    expect(forbidden.status).toBe(403);
    expect(allowed.status).toBe(200);
    expect(body.document.artifactStatus).toBe("active");
    expect(body.document.reviewStatus).toBe("approved");
  });

  it("returns documents for revision through API routes", async () => {
    const roomId = await getDefaultRoomId();
    const product = await prisma.user.findUniqueOrThrow({
      where: { email: "product@feidingwei.local" }
    });
    const qa = await prisma.user.findUniqueOrThrow({
      where: { email: "qa@feidingwei.local" }
    });
    const doc = await prisma.document.create({
      data: {
        title: "API return doc",
        body: "Return through route",
        artifactStatus: "draft",
        ownerId: product.id,
        reviewerId: qa.id,
        reviewStatus: "requested",
        roomId: roomId!
      }
    });

    const response = await returnDocRoute(
      await authedRequest({
        body: { commentBody: "Please add decision context." },
        email: "qa@feidingwei.local"
      }),
      { params: Promise.resolve({ docId: doc.id }) }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.document.reviewStatus).toBe("changes_requested");
  });

  it("rejects draft documents", async () => {
    const roomId = await getDefaultRoomId();
    const doc = await prisma.document.create({
      data: {
        title: "API rejected doc",
        body: "Reject through route",
        artifactStatus: "draft",
        roomId: roomId!
      }
    });

    const response = await rejectDoc(await authedRequest(), {
      params: Promise.resolve({ docId: doc.id })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.document.artifactStatus).toBe("rejected");
  });

  it("returns conflict when rejecting a non-draft document", async () => {
    const roomId = await getDefaultRoomId();
    const doc = await prisma.document.create({
      data: {
        title: "API active doc",
        body: "Reject should not be a no-op success.",
        artifactStatus: "active",
        roomId: roomId!
      }
    });

    const response = await rejectDoc(await authedRequest(), {
      params: Promise.resolve({ docId: doc.id })
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ error: "Only draft document artifacts can be rejected." });
  });
});
