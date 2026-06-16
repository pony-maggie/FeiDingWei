"use client";

import { Bot, Download, Globe2, Inbox, Plus, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { translations, type Translation } from "@/lib/i18n";

type RoomLink = {
  id: string;
  name: string;
};

type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
};

export function AppShell(props: {
  workspaceName: string;
  roomName: string;
  roomDescription: string;
  children: ReactNode;
  labels?: Translation["shell"];
  languageToggleLabel?: string;
  currentUser?: {
    name: string;
    email: string;
    workspaceRole?: string;
    functionLabel?: string;
    team?: { name: string } | null;
  };
  currentRoomId?: string;
  rooms?: RoomLink[];
  workspaceMembers?: WorkspaceMember[];
  onLanguageToggle?: () => void;
  onRoomExport?: () => void;
}) {
  const router = useRouter();
  const labels = props.labels ?? translations.zh.shell;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomCreateError, setRoomCreateError] = useState<string | null>(null);
  const rooms = props.rooms?.length
    ? props.rooms
    : props.currentRoomId
      ? [{ id: props.currentRoomId, name: props.roomName }]
      : [];
  const inviteableMembers = (props.workspaceMembers ?? []).filter(
    (member) => member.email !== props.currentUser?.email
  );

  async function createRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreatingRoom) {
      return;
    }

    setIsCreatingRoom(true);
    setRoomCreateError(null);
    const members = Object.entries(selectedRoles).map(([userId, role]) => ({ userId, role }));
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: roomName,
        description: roomDescription,
        members
      })
    });

    if (!response.ok) {
      setRoomCreateError(labels.roomCreateError);
      setIsCreatingRoom(false);
      return;
    }

    const body = (await response.json()) as { room: { id: string } };
    router.push(`/rooms/${body.room.id}`);
  }

  function toggleMember(userId: string, checked: boolean) {
    setSelectedRoles((current) => {
      const next = { ...current };
      if (checked) {
        next[userId] = next[userId] ?? "contributor";
      } else {
        delete next[userId];
      }
      return next;
    });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-paper text-ink lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col border-r border-line bg-white">
        <div className="border-b border-line p-4">
          <div className="text-xs font-medium uppercase text-slate-500">{labels.workspace}</div>
          <div className="mt-1 text-lg font-semibold">{props.workspaceName}</div>
        </div>
        <nav className="flex-1 p-3">
          <div className="space-y-2">
            {rooms.map((room) => (
              <a
                key={room.id}
                href={`/rooms/${room.id}`}
                className={[
                  "flex w-full items-center gap-2 rounded border px-3 py-2 text-left text-sm font-medium",
                  room.id === props.currentRoomId
                    ? "border-line bg-paper text-ink"
                    : "border-line text-slate-700 hover:bg-paper"
                ].join(" ")}
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                {room.name}
              </a>
            ))}
          </div>
          <a
            href="/inbox"
            className="mt-3 flex w-full items-center gap-2 rounded border border-line px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-paper"
          >
            <Inbox className="h-4 w-4" aria-hidden="true" />
            {labels.inbox}
          </a>
          <a
            href="/people"
            className="mt-3 flex w-full items-center gap-2 rounded border border-line px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-paper"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            {labels.people}
          </a>
          <button
            type="button"
            onClick={() => setIsCreateRoomOpen((current) => !current)}
            className="mt-3 flex w-full items-center gap-2 rounded border border-dashed border-line px-3 py-2 text-sm text-slate-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {labels.newRoom}
          </button>
          {isCreateRoomOpen ? (
            <form
              onSubmit={createRoom}
              className="mt-3 space-y-3 rounded border border-line bg-white p-3 text-sm"
            >
              <label className="block text-xs font-medium text-slate-600">
                {labels.roomNameLabel}
                <input
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-sm text-ink"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                {labels.roomDescriptionLabel}
                <textarea
                  value={roomDescription}
                  onChange={(event) => setRoomDescription(event.target.value)}
                  className="mt-1 min-h-20 w-full rounded border border-line px-3 py-2 text-sm text-ink"
                />
              </label>
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600">{labels.roomMembersLabel}</div>
                {inviteableMembers.map((member) => {
                  const selected = selectedRoles[member.id] !== undefined;
                  return (
                    <div key={member.id} className="rounded border border-line p-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) => toggleMember(member.id, event.target.checked)}
                        />
                        {member.name}
                      </label>
                      {selected ? (
                        <label className="mt-2 block text-xs text-slate-600">
                          {member.name} {labels.roomRoleLabel}
                          <select
                            value={selectedRoles[member.id]}
                            onChange={(event) =>
                              setSelectedRoles((current) => ({
                                ...current,
                                [member.id]: event.target.value
                              }))
                            }
                            className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                          >
                            <option value="contributor">{labels.roomRoles.contributor}</option>
                            <option value="room_lead">{labels.roomRoles.room_lead}</option>
                            <option value="reviewer">{labels.roomRoles.reviewer}</option>
                            <option value="viewer">{labels.roomRoles.viewer}</option>
                          </select>
                        </label>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {roomCreateError ? (
                <div className="text-xs text-red-700" role="alert">
                  {roomCreateError}
                </div>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isCreatingRoom || !roomName.trim() || !roomDescription.trim()}
                  className="rounded bg-accent px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {labels.createRoom}
                </button>
                <button
                  type="button"
                  disabled={isCreatingRoom}
                  onClick={() => setIsCreateRoomOpen(false)}
                  className="rounded border border-line px-3 py-2 text-xs font-medium"
                >
                  {labels.cancelRoomCreate}
                </button>
              </div>
            </form>
          ) : null}
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
          <div className="flex items-center gap-3">
            {props.currentUser ? (
              <div className="text-right text-xs text-slate-500">
                <div className="font-medium text-slate-800">{props.currentUser.name}</div>
                {props.currentUser.workspaceRole && props.currentUser.functionLabel ? (
                  <div>
                    {[
                      props.currentUser.workspaceRole,
                      props.currentUser.functionLabel,
                      props.currentUser.team?.name
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                ) : null}
                <a className="text-accent hover:underline" href="/logout">
                  退出
                </a>
              </div>
            ) : null}
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
                    {props.onRoomExport ? (
                      <>
                        <div className="mt-2 border-t border-line px-2 pt-2 text-xs font-medium text-slate-500">
                          {labels.data}
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          aria-label={labels.exportRoom}
                          onClick={() => {
                            props.onRoomExport?.();
                            setIsSettingsOpen(false);
                          }}
                          className="mt-1 flex w-full items-center gap-2 rounded px-2 py-2 text-sm hover:bg-paper"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          {labels.exportRoom}
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>
        {props.children}
      </main>
    </div>
  );
}
