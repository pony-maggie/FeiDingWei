"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Translation } from "@/lib/i18n";

type ChatMessage = {
  id: string;
  body: string;
  author: { name: string } | null;
  agent: { name: string } | null;
};

export function ChatPanel({
  room,
  labels
}: {
  room: { id: string; messages: ChatMessage[] };
  labels: Translation["chat"];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;

    setIsSending(true);
    await fetch(`/api/rooms/${room.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });
    setBody("");
    setIsSending(false);
    router.refresh();
  }

  return (
    <section className="grid h-[calc(100vh-168px)] min-h-[520px] grid-rows-[1fr_auto]">
      <div className="space-y-3 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold">{labels.heading}</h2>
        {room.messages.map((message) => (
          <article key={message.id} className="rounded border border-line bg-white p-3">
            <div className="text-xs font-medium text-slate-500">
              {message.author?.name ?? message.agent?.name ?? labels.system}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{message.body}</p>
          </article>
        ))}
      </div>
      <form onSubmit={sendMessage} className="border-t border-line bg-white p-4">
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="min-w-0 flex-1 rounded border border-line px-3 py-2 text-sm"
            placeholder={labels.placeholder}
          />
          <button
            disabled={isSending}
            className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {labels.send}
          </button>
        </div>
      </form>
    </section>
  );
}
