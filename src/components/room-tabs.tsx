"use client";

import { Bot, FileText, ListChecks, MessageSquare } from "lucide-react";
import { useState, type ReactNode } from "react";
import { defaultLocale, translations, type Locale } from "@/lib/i18n";
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

export function RoomTabs({ room }: { room: RoomForTabs }) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const t = translations[locale];
  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    {
      id: "chat",
      label: t.tabs.chat,
      icon: <MessageSquare className="h-4 w-4" aria-hidden="true" />
    },
    {
      id: "tasks",
      label: t.tabs.tasks,
      icon: <ListChecks className="h-4 w-4" aria-hidden="true" />
    },
    { id: "docs", label: t.tabs.docs, icon: <FileText className="h-4 w-4" aria-hidden="true" /> },
    { id: "agents", label: t.tabs.agents, icon: <Bot className="h-4 w-4" aria-hidden="true" /> }
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-6 pt-3">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-slate-600"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          className="mb-3 rounded border border-line px-3 py-2 text-sm font-medium text-slate-700"
        >
          {t.languageToggle}
        </button>
      </div>
      {activeTab === "chat" ? <ChatPanel room={room} labels={t.chat} /> : null}
      {activeTab === "tasks" ? <TasksPanel tasks={room.tasks} labels={t.tasks} /> : null}
      {activeTab === "docs" ? <DocsPanel documents={room.documents} labels={t.docs} /> : null}
      {activeTab === "agents" ? (
        <AgentsPanel agents={room.agents} agentRuns={room.agentRuns} labels={t.agents} />
      ) : null}
    </div>
  );
}
