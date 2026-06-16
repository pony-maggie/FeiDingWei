"use client";

import { Bot, ChevronDown, ChevronUp, History, ServerCog } from "lucide-react";
import { useState } from "react";
import { mentionTokenForAgentSlug } from "@/lib/domain";
import type { Translation } from "@/lib/i18n";
import type { LlmRuntimeConfig } from "@/lib/llm-config";

type RoomAgent = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

type RoomAgentRun = {
  id: string;
  status: string;
  output: string;
  input: string;
  error?: string | null;
  agent: { name: string; slug: string };
  sourceMessage?: { body: string } | null;
  generatedTasks?: Array<{
    id: string;
    title: string;
    artifactStatus: string;
    reviewStatus?: string;
    assignee?: { name: string } | null;
    reviewer?: { name: string } | null;
  }>;
  generatedDocuments?: Array<{
    id: string;
    title: string;
    artifactStatus: string;
    reviewStatus?: string;
    owner?: { name: string } | null;
    reviewer?: { name: string } | null;
  }>;
  generatedDecisions?: Array<{ id: string; title: string; status: string }>;
};

function formatProvider(config: LlmRuntimeConfig, labels: Translation["agents"]) {
  if (config.mode === "openai") {
    return `OpenAI · ${config.model}`;
  }

  return labels.localProvider;
}

function formatArtifactStatus(status: string, labels: Translation["agents"]) {
  return labels.artifactStatus[status as keyof typeof labels.artifactStatus] ?? status;
}

function formatReviewStatus(status: string | undefined, labels: Translation["agents"]) {
  return status ? labels.reviewStatus[status as keyof typeof labels.reviewStatus] ?? status : null;
}

export function AgentsPanel({
  agents,
  agentRuns,
  labels,
  llmConfig
}: {
  agents: RoomAgent[];
  agentRuns: RoomAgentRun[];
  labels: Translation["agents"];
  llmConfig: LlmRuntimeConfig;
}) {
  return (
    <section className="grid gap-4 p-4 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{labels.heading}</h2>
        <div className="rounded border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
            <ServerCog className="h-4 w-4 text-accent" aria-hidden="true" />
            {labels.providerSource}
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {formatProvider(llmConfig, labels)}
          </div>
          {llmConfig.mode === "faux" ? (
            <p className="mt-1 text-xs text-slate-500">{llmConfig.reason}</p>
          ) : null}
        </div>
        {agents.map((agent) => (
          <article key={agent.id} className="rounded border border-line bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-accent" aria-hidden="true" />
              {agent.name}
              <span className="rounded bg-paper px-2 py-0.5 text-xs font-semibold text-accent">
                {mentionTokenForAgentSlug(agent.slug)}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{agent.description}</p>
          </article>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <History className="h-4 w-4" aria-hidden="true" />
          {labels.activity}
        </h3>
        {agentRuns.map((run) => (
          <AgentRunCard key={run.id} run={run} labels={labels} />
        ))}
      </div>
    </section>
  );
}

function AgentRunCard({ run, labels }: { run: RoomAgentRun; labels: Translation["agents"] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {run.agent.name}
            <span className="rounded bg-paper px-2 py-0.5 text-xs font-semibold text-accent">
              {mentionTokenForAgentSlug(run.agent.slug)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {labels.status[run.status as keyof typeof labels.status] ?? run.status}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs font-medium text-slate-700 hover:bg-paper"
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {expanded ? labels.hideDetails : labels.details}
        </button>
      </div>
      <p className="mt-2 text-sm">{run.output || run.input}</p>
      {run.sourceMessage ? (
        <div className="mt-3 rounded border border-line bg-paper p-2 text-xs text-slate-600">
          <div className="font-medium text-slate-700">{labels.triggerMessage}</div>
          <div className="mt-1">{run.sourceMessage.body}</div>
        </div>
      ) : null}
      <GeneratedArtifacts run={run} labels={labels} />
      {expanded ? (
        <div className="mt-4 space-y-3 rounded border border-line bg-paper p-3 text-sm">
          <DetailRow label={labels.runId} value={run.id} />
          <DetailRow label={labels.runInput} value={run.input} />
          <DetailRow label={labels.runOutput} value={run.output} />
          {run.error ? <DetailRow label={labels.runError} value={run.error} /> : null}
        </div>
      ) : null}
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 break-words text-slate-800">{value || "-"}</div>
    </div>
  );
}

function GeneratedArtifacts({ run, labels }: { run: RoomAgentRun; labels: Translation["agents"] }) {
  return (
    <>
      {run.generatedTasks?.length ? (
        <div className="mt-3">
          <div className="text-xs font-medium text-slate-500">{labels.generatedTasks}</div>
          <ul className="mt-1 space-y-1 text-sm">
            {run.generatedTasks.map((task) => (
              <li key={task.id} className="rounded bg-paper px-2 py-1">
                <div className="flex items-center justify-between gap-2">
                  <span>{task.title}</span>
                  <span className="shrink-0 rounded border border-line bg-white px-2 py-0.5 text-xs text-slate-600">
                    {formatArtifactStatus(task.artifactStatus, labels)}
                  </span>
                </div>
                <CollaborationSummary
                  labels={labels}
                  ownerLabel={labels.assigneeLabel}
                  ownerName={task.assignee?.name}
                  reviewerName={task.reviewer?.name}
                  reviewStatus={task.reviewStatus}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {run.generatedDocuments?.length ? (
        <div className="mt-3">
          <div className="text-xs font-medium text-slate-500">{labels.generatedDocuments}</div>
          <ul className="mt-1 space-y-1 text-sm">
            {run.generatedDocuments.map((document) => (
              <li
                key={document.id}
                className="rounded bg-paper px-2 py-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{document.title}</span>
                  <span className="shrink-0 rounded border border-line bg-white px-2 py-0.5 text-xs text-slate-600">
                    {formatArtifactStatus(document.artifactStatus, labels)}
                  </span>
                </div>
                <CollaborationSummary
                  labels={labels}
                  ownerLabel={labels.ownerLabel}
                  ownerName={document.owner?.name}
                  reviewerName={document.reviewer?.name}
                  reviewStatus={document.reviewStatus}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {run.generatedDecisions?.length ? (
        <div className="mt-3">
          <div className="text-xs font-medium text-slate-500">{labels.generatedDecisions}</div>
          <ul className="mt-1 space-y-1 text-sm">
            {run.generatedDecisions.map((decision) => (
              <li
                key={decision.id}
                className="flex items-center justify-between gap-2 rounded bg-paper px-2 py-1"
              >
                <span>{decision.title}</span>
                <span className="shrink-0 rounded border border-line bg-white px-2 py-0.5 text-xs text-slate-600">
                  {formatArtifactStatus(decision.status, labels)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function CollaborationSummary({
  labels,
  ownerLabel,
  ownerName,
  reviewerName,
  reviewStatus
}: {
  labels: Translation["agents"];
  ownerLabel: string;
  ownerName?: string;
  reviewerName?: string;
  reviewStatus?: string;
}) {
  const formattedReviewStatus = formatReviewStatus(reviewStatus, labels);

  if (!ownerName && !reviewerName && !formattedReviewStatus) {
    return null;
  }

  return (
    <div className="mt-1 text-xs text-slate-500">
      {[
        ownerName ? `${ownerLabel}: ${ownerName}` : null,
        reviewerName ? `${labels.reviewerLabel}: ${reviewerName}` : null,
        formattedReviewStatus
      ]
        .filter(Boolean)
        .join(" · ")}
    </div>
  );
}
