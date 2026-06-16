"use client";

import { ClipboardList, FileText, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mentionTokenForAgentSlug, mentionTokenForUser } from "@/lib/domain";
import type { Translation } from "@/lib/i18n";

type ChatMessage = {
  id: string;
  body: string;
  author: { name: string } | null;
  agent: { name: string } | null;
};

type ChatAgent = {
  id: string;
  slug: string;
  name: string;
};

type ChatMember = {
  id: string;
  name: string;
  email: string;
};

type PendingPlan = {
  body: string;
  agent: ChatAgent;
};

export function ChatPanel({
  room,
  labels
}: {
  room: { id: string; messages: ChatMessage[]; members: ChatMember[]; agents: ChatAgent[] };
  labels: Translation["chat"];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PendingPlan | null>(null);
  const mentionMatch = body.match(/(?:^|\s)(@[A-Za-z0-9._-]*)$/);
  const mentionQuery = mentionMatch?.[1]?.slice(1).toLowerCase() ?? null;
  const suggestedMembers =
    mentionQuery === null
      ? []
      : room.members.filter((member) => {
          const token = mentionTokenForUser(member).slice(1).toLowerCase();
          return token.startsWith(mentionQuery) || member.name.toLowerCase().includes(mentionQuery);
        });
  const suggestedAgents =
    mentionQuery === null
      ? []
      : room.agents.filter((agent) => {
          const token = mentionTokenForAgentSlug(agent.slug).slice(1).toLowerCase();
          return token.startsWith(mentionQuery) || agent.name.toLowerCase().includes(mentionQuery);
        });
  const hasMentionSuggestions = suggestedMembers.length > 0 || suggestedAgents.length > 0;

  async function persistMessage(messageBody: string) {
    setIsSending(true);
    await fetch(`/api/rooms/${room.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: messageBody })
    });
    setBody("");
    setPendingPlan(null);
    setIsSending(false);
    router.refresh();
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedBody = body.trim();
    if (!trimmedBody) return;

    const mentionedAgent = findMentionedAgent(trimmedBody, room.agents);
    if (mentionedAgent && pendingPlan?.body !== trimmedBody) {
      setPendingPlan({ body: trimmedBody, agent: mentionedAgent });
      return;
    }

    await persistMessage(trimmedBody);
  }

  function insertMention(agent: ChatAgent) {
    insertMentionToken(mentionTokenForAgentSlug(agent.slug));
  }

  function insertMemberMention(member: ChatMember) {
    insertMentionToken(mentionTokenForUser(member));
  }

  function insertMentionToken(token: string) {
    const matchIndex = mentionMatch?.index ?? body.length;
    const prefix = body.slice(0, matchIndex);
    const spacer = prefix ? " " : "";
    setBody(`${prefix}${spacer}${token} `);
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
        {pendingPlan ? (
          <div className="mb-3 rounded border border-accent/30 bg-white p-3 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4 text-accent" aria-hidden="true" />
              {labels.planHeading}
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              {pendingPlan.agent.name}
              {labels.planIntroSuffix}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded border border-line bg-paper px-2 py-1 text-xs font-medium">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                {labels.planTaskDrafts}
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-line bg-paper px-2 py-1 text-xs font-medium">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {labels.planDocumentDrafts}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{labels.planConfirmation}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={isSending}
                onClick={() => persistMessage(pendingPlan.body)}
                className="rounded bg-accent px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
              >
                {labels.confirmGeneration}
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={() => setPendingPlan(null)}
                className="rounded border border-line px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-50"
              >
                {labels.cancelGeneration}
              </button>
            </div>
          </div>
        ) : null}
        <div className="relative flex gap-2">
          <div className="relative min-w-0 flex-1">
            {hasMentionSuggestions ? (
              <div className="absolute bottom-full left-0 mb-2 w-full max-w-md rounded border border-line bg-white p-1 shadow-lg">
                {suggestedMembers.map((member) => {
                  const token = mentionTokenForUser(member);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => insertMemberMention(member)}
                      className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-paper"
                    >
                      <span className="font-medium">{member.name}</span>
                      <span className="text-xs font-semibold text-slate-500">{token}</span>
                    </button>
                  );
                })}
                {suggestedAgents.map((agent) => {
                  const token = mentionTokenForAgentSlug(agent.slug);
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => insertMention(agent)}
                      className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-paper"
                    >
                      <span className="font-medium">{agent.name}</span>
                      <span className="text-xs font-semibold text-accent">{token}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            <input
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="w-full rounded border border-line px-3 py-2 text-sm"
              placeholder={labels.placeholder}
            />
          </div>
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

function findMentionedAgent(body: string, agents: ChatAgent[]) {
  return (
    agents.find((agent) => {
      const token = mentionTokenForAgentSlug(agent.slug);
      return new RegExp(`${escapeRegExp(token)}\\b`, "i").test(body);
    }) ?? null
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
