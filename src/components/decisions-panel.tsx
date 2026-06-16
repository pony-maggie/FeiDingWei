"use client";

import { GitBranch, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Translation } from "@/lib/i18n";

type RoomDecision = {
  id: string;
  title: string;
  body: string;
  status: string;
  creator?: { name: string } | null;
  trace?: {
    sourceMessage: { body: string } | null;
    sourceRun: { id: string } | null;
  } | null;
};

export function DecisionsPanel({
  roomId,
  decisions,
  labels
}: {
  roomId: string;
  decisions: RoomDecision[];
  labels: Translation["decisions"];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createDecision() {
    if (isPending || !title.trim() || !body.trim()) {
      return;
    }

    setIsPending(true);
    setError(null);
    const response = await fetch(`/api/rooms/${roomId}/decisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), body: body.trim() })
    });
    setIsPending(false);
    if (!response.ok) {
      setError("Decision creation failed.");
      return;
    }
    setTitle("");
    setBody("");
    router.refresh();
  }

  return (
    <section className="space-y-3 p-4">
      <h2 className="text-lg font-semibold">{labels.heading}</h2>
      <div className="rounded border border-line bg-white p-4">
        <div className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
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
            <input
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="mt-1 w-full rounded border border-line px-3 py-2 text-sm text-ink"
            />
          </label>
          <button
            type="button"
            disabled={isPending || !title.trim() || !body.trim()}
            onClick={createDecision}
            className="inline-flex items-center justify-center gap-2 self-end rounded border border-line px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {labels.create}
          </button>
        </div>
        {error ? <div className="mt-2 text-xs text-red-700">{error}</div> : null}
      </div>
      {decisions.map((decision) => (
        <article key={decision.id} aria-label={decision.title} className="rounded border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GitBranch className="h-4 w-4 text-accent" aria-hidden="true" />
            {decision.title}
          </div>
          <p className="mt-2 text-sm text-slate-700">{decision.body}</p>
          <div className="mt-2 text-xs text-slate-500">
            {[decision.creator?.name, labels.status[decision.status as keyof typeof labels.status] ?? decision.status]
              .filter(Boolean)
              .join(" · ")}
          </div>
          {decision.trace ? (
            <div className="mt-3 space-y-2 rounded border border-line bg-paper p-2 text-xs text-slate-600">
              {decision.trace.sourceMessage ? (
                <div>
                  <div className="font-medium text-slate-700">{labels.sourceMessage}</div>
                  <div className="mt-1">{decision.trace.sourceMessage.body}</div>
                </div>
              ) : null}
              {decision.trace.sourceRun ? (
                <div>
                  <div className="font-medium text-slate-700">{labels.sourceRun}</div>
                  <div className="mt-1">{decision.trace.sourceRun.id}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}
