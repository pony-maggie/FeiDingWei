import { Bot, History } from "lucide-react";

type RoomAgent = {
  id: string;
  name: string;
  description: string;
};

type RoomAgentRun = {
  id: string;
  status: string;
  output: string;
  input: string;
  agent: { name: string };
};

export function AgentsPanel({
  agents,
  agentRuns
}: {
  agents: RoomAgent[];
  agentRuns: RoomAgentRun[];
}) {
  return (
    <section className="grid gap-4 p-4 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Agents</h2>
        {agents.map((agent) => (
          <article key={agent.id} className="rounded border border-line bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-accent" aria-hidden="true" />
              {agent.name}
            </div>
            <p className="mt-1 text-sm text-slate-600">{agent.description}</p>
          </article>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <History className="h-4 w-4" aria-hidden="true" />
          Activity
        </h3>
        {agentRuns.map((run) => (
          <article key={run.id} className="rounded border border-line bg-white p-4">
            <div className="text-sm font-semibold">{run.agent.name}</div>
            <div className="mt-1 text-xs text-slate-500">{run.status}</div>
            <p className="mt-2 text-sm">{run.output || run.input}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
