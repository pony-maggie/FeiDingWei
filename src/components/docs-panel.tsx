"use client";

import { CheckCircle, Pencil, Save, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Translation } from "@/lib/i18n";

type RoomDocument = {
  id: string;
  title: string;
  body: string;
  artifactStatus: string;
  reviewStatus?: string;
  blockedReason?: string | null;
  owner?: { id: string; name: string; email: string } | null;
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

type DocumentMember = {
  id: string;
  name: string;
  email: string;
};

export function DocsPanel({
  documents,
  members,
  labels
}: {
  documents: RoomDocument[];
  members: DocumentMember[];
  labels: Translation["docs"];
}) {
  return (
    <section className="space-y-3 p-4">
      <h2 className="text-lg font-semibold">{labels.heading}</h2>
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} members={members} labels={labels} />
      ))}
    </section>
  );
}

function DocumentCard({
  document,
  members,
  labels
}: {
  document: RoomDocument;
  members: DocumentMember[];
  labels: Translation["docs"];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(document.title);
  const [body, setBody] = useState(document.body);
  const [ownerId, setOwnerId] = useState(document.owner?.id ?? members[0]?.id ?? "");
  const [reviewerId, setReviewerId] = useState(document.reviewer?.id ?? members[0]?.id ?? "");
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
    const response = await fetch(`/api/docs/${document.id}/approve`, { method: "POST" });
    if (!response.ok) {
      setError("Document draft approval failed.");
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
    const response = await fetch(`/api/docs/${document.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body })
    });
    if (!response.ok) {
      setError("Document draft update failed.");
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
    const response = await fetch(`/api/docs/${document.id}/reject`, { method: "POST" });
    if (!response.ok) {
      setError("Document draft rejection failed.");
      setPendingAction(null);
      return;
    }

    router.refresh();
  }

  async function assign() {
    if (pendingAction || !ownerId) {
      return;
    }

    setPendingAction("assign");
    setError(null);
    const response = await fetch(`/api/docs/${document.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId })
    });
    setPendingAction(null);
    if (!response.ok) {
      setError("Document assignment failed.");
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
    const response = await fetch(`/api/docs/${document.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerId })
    });
    setPendingAction(null);
    if (!response.ok) {
      setError("Document review request failed.");
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
    const response = await fetch(`/api/docs/${document.id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentBody })
    });
    setPendingAction(null);
    if (!response.ok) {
      setError("Document return failed.");
      return;
    }
    setReturnComment("");
    router.refresh();
  }

  function cancelEdit() {
    setTitle(document.title);
    setBody(document.body);
    setIsEditing(false);
  }

  return (
    <article aria-label={document.title} className="rounded border border-line bg-white p-4">
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
                {labels.bodyLabel}
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="mt-1 min-h-40 w-full rounded border border-line px-3 py-2 text-sm text-ink"
                />
              </label>
            </div>
          ) : (
            <>
              <div className="text-sm font-semibold">{document.title}</div>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-paper p-3 text-sm">
                {document.body}
              </pre>
            </>
          )}
          <div className="mt-2 text-xs text-slate-500">
            {labels.artifactStatus[
              document.artifactStatus as keyof typeof labels.artifactStatus
            ] ?? document.artifactStatus}{" "}
            · {labels.reviewStatusLabel}:{" "}
            {labels.reviewStatus[document.reviewStatus as keyof typeof labels.reviewStatus] ??
              document.reviewStatus ??
              labels.reviewStatus.none}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
            <span>
              {labels.ownerLabel}: {document.owner?.name ?? "-"}
            </span>
            <span>
              {labels.reviewerLabel}: {document.reviewer?.name ?? "-"}
            </span>
          </div>
          {document.blockedReason ? (
            <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              {labels.blockedReasonLabel}: {document.blockedReason}
            </div>
          ) : null}
          {document.comments && document.comments.length > 0 ? (
            <div className="mt-3 rounded border border-line bg-paper p-2 text-xs text-slate-600">
              <div className="font-medium text-slate-700">{labels.comments}</div>
              {document.comments.map((comment) => (
                <div key={comment.id} className="mt-1">
                  {comment.author?.name ?? labels.comments}: {comment.body}
                </div>
              ))}
            </div>
          ) : null}
          {document.trace ? (
            <div className="mt-3 space-y-2 rounded border border-line bg-paper p-2 text-xs text-slate-600">
              {document.trace.sourceMessage ? (
                <div>
                  <div className="font-medium text-slate-700">{labels.sourceMessage}</div>
                  <div className="mt-1">{document.trace.sourceMessage.body}</div>
                </div>
              ) : null}
              {document.trace.sourceRun ? (
                <div>
                  <div className="font-medium text-slate-700">{labels.sourceRun}</div>
                  <div className="mt-1">{document.trace.sourceRun.id}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {document.artifactStatus === "draft" ? (
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
      {document.artifactStatus === "draft" ? (
        <div className="mt-3 grid gap-2 border-t border-line pt-3 md:grid-cols-[1fr_auto_1fr_auto]">
          <label className="block text-xs font-medium text-slate-600">
            {labels.ownerLabel}
            <select
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
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
            disabled={pendingAction !== null || !ownerId}
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
