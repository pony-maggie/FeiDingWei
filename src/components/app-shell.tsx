import { Bot, Plus, Users } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell(props: {
  workspaceName: string;
  roomName: string;
  roomDescription: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-paper text-ink lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col border-r border-line bg-white">
        <div className="border-b border-line p-4">
          <div className="text-xs font-medium uppercase text-slate-500">Workspace</div>
          <div className="mt-1 text-lg font-semibold">{props.workspaceName}</div>
        </div>
        <nav className="flex-1 p-3">
          <button className="flex w-full items-center gap-2 rounded border border-line bg-paper px-3 py-2 text-left text-sm font-medium">
            <Users className="h-4 w-4" aria-hidden="true" />
            {props.roomName}
          </button>
          <button className="mt-3 flex w-full items-center gap-2 rounded border border-dashed border-line px-3 py-2 text-sm text-slate-600">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New room
          </button>
        </nav>
        <div className="border-t border-line p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-accent" aria-hidden="true" />
            Agents are visible collaborators.
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <header className="border-b border-line bg-white px-6 py-4">
          <h1 className="text-2xl font-semibold">{props.roomName}</h1>
          <p className="mt-1 text-sm text-slate-600">{props.roomDescription}</p>
        </header>
        {props.children}
      </main>
    </div>
  );
}
