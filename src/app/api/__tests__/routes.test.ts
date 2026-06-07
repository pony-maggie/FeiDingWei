import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { getDefaultRoomId } from "@/lib/room-service";
import { POST as approveDoc } from "../docs/[docId]/approve/route";
import { POST as postMessage } from "../rooms/[roomId]/messages/route";
import { POST as approveTask } from "../tasks/[taskId]/approve/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("api routes", () => {
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
    const response = await postMessage(jsonRequest({ body: "plain project update" }), {
      params: Promise.resolve({ roomId: roomId! })
    });

    const persisted = await prisma.message.findFirst({
      where: { roomId: roomId!, body: "plain project update" }
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(persisted).toBeTruthy();
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

    const response = await approveTask(new Request("http://localhost/api-test", { method: "POST" }), {
      params: Promise.resolve({ taskId: task.id })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.task.artifactStatus).toBe("active");
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

    const response = await approveDoc(new Request("http://localhost/api-test", { method: "POST" }), {
      params: Promise.resolve({ docId: doc.id })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.document.artifactStatus).toBe("active");
  });
});
