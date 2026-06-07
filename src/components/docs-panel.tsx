"use client";

import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type RoomDocument = {
  id: string;
  title: string;
  body: string;
  artifactStatus: string;
};

export function DocsPanel({ documents }: { documents: RoomDocument[] }) {
  const router = useRouter();

  async function approve(documentId: string) {
    await fetch(`/api/docs/${documentId}/approve`, { method: "POST" });
    router.refresh();
  }

  return (
    <section className="space-y-3 p-4">
      <h2 className="text-lg font-semibold">Docs</h2>
      {documents.map((document) => (
        <article key={document.id} className="rounded border border-line bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold">{document.title}</div>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-paper p-3 text-sm">
                {document.body}
              </pre>
              <div className="mt-2 text-xs text-slate-500">{document.artifactStatus}</div>
            </div>
            {document.artifactStatus === "draft" ? (
              <button
                onClick={() => approve(document.id)}
                className="inline-flex shrink-0 items-center gap-2 rounded border border-line px-3 py-2 text-sm"
              >
                <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                Approve
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
