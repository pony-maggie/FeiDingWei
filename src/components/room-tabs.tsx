"use client";

import { Bot, FileText, ListChecks, MessageSquare } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Translation } from "@/lib/i18n";
import { AgentsPanel } from "./agents-panel";
import { ChatPanel } from "./chat-panel";
import { DocsPanel } from "./docs-panel";
import { TasksPanel } from "./tasks-panel";

type Tab = "chat" | "tasks" | "docs" | "agents";

type RoomForTabs = {
  id: string;
  messages: React.ComponentProps<typeof ChatPanel>["room"]["messages"];
  tasks: React.ComponentProps<typeof TasksPanel>["tasks"];
  documents: React.ComponentProps<typeof DocsPanel>["documents"];
  agents: React.ComponentProps<typeof AgentsPanel>["agents"];
  agentRuns: React.ComponentProps<typeof AgentsPanel>["agentRuns"];
};

export function RoomTabs({ room, labels }: { room: RoomForTabs; labels: Translation }) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    {
      id: "chat",
      label: labels.tabs.chat,
      icon: <MessageSquare className="h-4 w-4" aria-hidden="true" />
    },
    {
      id: "tasks",
      label: labels.tabs.tasks,
      icon: <ListChecks className="h-4 w-4" aria-hidden="true" />
    },
    {
      id: "docs",
      label: labels.tabs.docs,
      icon: <FileText className="h-4 w-4" aria-hidden="true" />
    },
    {
      id: "agents",
      label: labels.tabs.agents,
      icon: <Bot className="h-4 w-4" aria-hidden="true" />
    }
  ];

  return (
    <div>
      <div className="flex gap-2 border-b border-line bg-white px-6 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium ${
              activeTab === tab.id ? "border-accent text-accent" : "border-transparent text-slate-600"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "chat" ? <ChatPanel room={room} labels={labels.chat} /> : null}
      {activeTab === "tasks" ? <TasksPanel tasks={room.tasks} labels={labels.tasks} /> : null}
      {activeTab === "docs" ? <DocsPanel documents={room.documents} labels={labels.docs} /> : null}
      {activeTab === "agents" ? (
        <AgentsPanel agents={room.agents} agentRuns={room.agentRuns} labels={labels.agents} />
      ) : null}
    </div>
  );
}
