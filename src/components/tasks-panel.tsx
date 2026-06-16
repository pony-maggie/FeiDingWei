"use client";

import { CheckCircle, Pencil, Save, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Translation } from "@/lib/i18n";

type RoomTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  artifactStatus: string;
  reviewStatus?: string;
  blockedReason?: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  reviewer?: { id: string; name: string; email: string } | null;
  comments?: Array<{
    id: string;
    body: string;
    author: { name: string } | null;
  }>;
  trace?: {
    sourceMessage: { body: string } | null;
    sourceRun: { id: string } | null;
  } | null;
};

type TaskMember = {
  id: string;
  name: string;
  email: string;
};

export function TasksPanel({
  tasks,
  members,
  labels
}: {
  tasks: RoomTask[];
  members: TaskMember[];
  labels: Translation["tasks"];
}) {
  return (
    <section className="space-y-3 p-4">
      <h2 className="text-lg font-semibold">{labels.heading}</h2>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} members={members} labels={labels} />
      ))}
    </section>
  );
}

function TaskCard({
  task,
  members,
  labels
}: {
  task: RoomTask;
  members: TaskMember[];
  labels: Translation["tasks"];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id ?? members[0]?.id ?? "");
  const [reviewerId, setReviewerId] = useState(task.reviewer?.id ?? members[0]?.id ?? "");
  const [returnComment, setReturnComment] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "approve" | "save" | "reject" | "assign" | "review" | "return" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    if (pendingAction) {
      return;
    }

    setPendingAction("approve");
    setError(null);
    const response = await fetch(`/api/tasks/${task.id}/approve`, { method: "POST" });
    if (!response.ok) {
      setError("Task draft approval failed.");
      setPendingAction(null);
      return;
    }

    router.refresh();
  }

  async function saveDraft() {
    if (pendingAction) {
      return;
    }

    setPendingAction("save");
    setError(null);
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority })
    });
    if (!response.ok) {
      setError("Task draft update failed.");
      setPendingAction(null);
      return;
    }

    setIsEditing(false);
    setPendingAction(null);
    router.refresh();
  }

  async function rejectDraft() {
    if (pendingAction) {
      return;
    }

    setPendingAction("reject");
    setError(null);
    const response = await fetch(`/api/tasks/${task.id}/reject`, { method: "POST" });
    if (!response.ok) {
      setError("Task draft rejection failed.");
      setPendingAction(null);
      return;
    }

    router.refresh();
  }

  async function assign() {
    if (pendingAction || !assigneeId) {
      return;
    }

    setPendingAction("assign");
    setError(null);
    const response = await fetch(`/api/tasks/${task.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId })
    });
    setPendingAction(null);
    if (!response.ok) {
      setError("Task assignment failed.");
      return;
    }
    router.refresh();
  }

  async function requestReview() {
    if (pendingAction || !reviewerId) {
      return;
    }

    setPendingAction("review");
    setError(null);
    const response = await fetch(`/api/tasks/${task.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerId })
    });
    setPendingAction(null);
    if (!response.ok) {
      setError("Task review request failed.");
      return;
    }
    router.refresh();
  }

  async function returnForRevision() {
    if (pendingAction || !returnComment.trim()) {
      return;
    }

    setPendingAction("return");
    setError(null);
    const commentBody = returnComment.trim();
    const response = await fetch(`/api/tasks/${task.id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentBody })
    });
    setPendingAction(null);
    if (!response.ok) {
      setError("Task return failed.");
      return;
    }
    setReturnComment("");
    router.refresh();
  }

  function cancelEdit() {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setIsEditing(false);
  }

  return (
    <article aria-label={task.title} className="rounded border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-600">
                {labels.titleLabel}
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-sm text-ink"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                {labels.descriptionLabel}
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-1 min-h-24 w-full rounded border border-line px-3 py-2 text-sm text-ink"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                {labels.priorityLabel}
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-sm text-ink"
                >
                  <option value="low">{labels.priority.low}</option>
                  <option value="medium">{labels.priority.medium}</option>
                  <option value="high">{labels.priority.high}</option>
                </select>
              </label>
            </div>
          ) : (
            <>
              <div className="text-sm font-semibold">{task.title}</div>
              <p className="mt-1 text-sm text-slate-600">{task.description}</p>
            </>
          )}
          <div className="mt-2 text-xs text-slate-500">
            {labels.status[task.status as keyof typeof labels.status] ?? task.status} ·{" "}
            {labels.priority[task.priority as keyof typeof labels.priority] ?? task.priority} ·{" "}
            {labels.artifactStatus[
              task.artifactStatus as keyof typeof labels.artifactStatus
            ] ?? task.artifactStatus}{" "}
            · {labels.reviewStatusLabel}:{" "}
            {labels.reviewStatus[task.reviewStatus as keyof typeof labels.reviewStatus] ??
              task.reviewStatus ??
              labels.reviewStatus.none}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
            <span>
              {labels.assigneeLabel}: {task.assignee?.name ?? "-"}
            </span>
            <span>
              {labels.reviewerLabel}: {task.reviewer?.name ?? "-"}
            </span>
          </div>
          {task.blockedReason ? (
            <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              {labels.blockedReasonLabel}: {task.blockedReason}
            </div>
          ) : null}
          {task.comments && task.comments.length > 0 ? (
            <div className="mt-3 rounded border border-line bg-paper p-2 text-xs text-slate-600">
              <div className="font-medium text-slate-700">{labels.comments}</div>
              {task.comments.map((comment) => (
                <div key={comment.id} className="mt-1">
                  {comment.author?.name ?? labels.comments}: {comment.body}
                </div>
              ))}
            </div>
          ) : null}
          {task.trace ? (
            <div className="mt-3 space-y-2 rounded border border-line bg-paper p-2 text-xs text-slate-600">
              {task.trace.sourceMessage ? (
                <div>
                  <div className="font-medium text-slate-700">{labels.sourceMessage}</div>
                  <div className="mt-1">{task.trace.sourceMessage.body}</div>
                </div>
              ) : null}
              {task.trace.sourceRun ? (
                <div>
                  <div className="font-medium text-slate-700">{labels.sourceRun}</div>
                  <div className="mt-1">{task.trace.sourceRun.id}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {task.artifactStatus === "draft" ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {isEditing ? (
              <>
                <button
                  disabled={pendingAction !== null}
                  onClick={saveDraft}
                  className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  <Save className="h-4 w-4 text-success" aria-hidden="true" />
                  {labels.save}
                </button>
                <button
                  disabled={pendingAction !== null}
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  {labels.cancel}
                </button>
              </>
            ) : (
              <>
                <button
                  disabled={pendingAction !== null}
                  onClick={approve}
                  className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                  {labels.approve}
                </button>
                <button
                  disabled={pendingAction !== null}
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {labels.edit}
                </button>
                <button
                  disabled={pendingAction !== null}
                  onClick={rejectDraft}
                  className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 text-danger" aria-hidden="true" />
                  {labels.reject}
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
      {task.artifactStatus === "draft" ? (
        <div className="mt-3 grid gap-2 border-t border-line pt-3 md:grid-cols-[1fr_auto_1fr_auto]">
          <label className="block text-xs font-medium text-slate-600">
            {labels.assigneeLabel}
            <select
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              className="mt-1 w-full rounded border border-line px-3 py-2 text-sm text-ink"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={pendingAction !== null || !assigneeId}
            onClick={assign}
            className="self-end rounded border border-line px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {labels.assign}
          </button>
          <label className="block text-xs font-medium text-slate-600">
            {labels.reviewerLabel}
            <select
              value={reviewerId}
              onChange={(event) => setReviewerId(event.target.value)}
              className="mt-1 w-full rounded border border-line px-3 py-2 text-sm text-ink"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={pendingAction !== null || !reviewerId}
            onClick={requestReview}
            className="self-end rounded border border-line px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {labels.requestReview}
          </button>
          <label className="block text-xs font-medium text-slate-600 md:col-span-3">
            {labels.returnCommentLabel}
            <input
              value={returnComment}
              onChange={(event) => setReturnComment(event.target.value)}
              className="mt-1 w-full rounded border border-line px-3 py-2 text-sm text-ink"
            />
          </label>
          <button
            type="button"
            disabled={pendingAction !== null || !returnComment.trim()}
            onClick={returnForRevision}
            className="self-end rounded border border-line px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {labels.returnRevision}
          </button>
        </div>
      ) : null}
      {error ? <div className="mt-3 text-xs text-red-700" role="alert">{error}</div> : null}
    </article>
  );
}
