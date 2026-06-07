"use client";

import { Bot, Globe2, Plus, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { translations, type Translation } from "@/lib/i18n";

export function AppShell(props: {
  workspaceName: string;
  roomName: string;
  roomDescription: string;
  children: ReactNode;
  labels?: Translation["shell"];
  languageToggleLabel?: string;
  onLanguageToggle?: () => void;
}) {
  const labels = props.labels ?? translations.zh.shell;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="grid min-h-screen grid-cols-1 bg-paper text-ink lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col border-r border-line bg-white">
        <div className="border-b border-line p-4">
          <div className="text-xs font-medium uppercase text-slate-500">{labels.workspace}</div>
          <div className="mt-1 text-lg font-semibold">{props.workspaceName}</div>
        </div>
        <nav className="flex-1 p-3">
          <button className="flex w-full items-center gap-2 rounded border border-line bg-paper px-3 py-2 text-left text-sm font-medium">
            <Users className="h-4 w-4" aria-hidden="true" />
            {props.roomName}
          </button>
          <button className="mt-3 flex w-full items-center gap-2 rounded border border-dashed border-line px-3 py-2 text-sm text-slate-600">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {labels.newRoom}
          </button>
        </nav>
        <div className="border-t border-line p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-accent" aria-hidden="true" />
            {labels.visibleAgents}
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line bg-white px-6 py-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{props.roomName}</h1>
            <p className="mt-1 text-sm text-slate-600">{props.roomDescription}</p>
          </div>
          {props.onLanguageToggle ? (
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isSettingsOpen}
                onClick={() => setIsSettingsOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm font-medium text-slate-700"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                {labels.settings}
              </button>
              {isSettingsOpen ? (
                <div
                  role="menu"
                  aria-label={labels.settings}
                  className="absolute right-0 z-10 mt-2 w-56 rounded border border-line bg-white p-2 shadow-lg"
                >
                  <div className="px-2 py-1 text-xs font-medium text-slate-500">
                    {labels.language}
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    aria-label={props.languageToggleLabel}
                    onClick={() => {
                      props.onLanguageToggle?.();
                      setIsSettingsOpen(false);
                    }}
                    className="mt-1 flex w-full items-center justify-between rounded px-2 py-2 text-sm hover:bg-paper"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Globe2 className="h-4 w-4" aria-hidden="true" />
                      {labels.currentLanguage}
                    </span>
                    <span className="font-medium text-accent">{props.languageToggleLabel}</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </header>
        {props.children}
      </main>
    </div>
  );
}
