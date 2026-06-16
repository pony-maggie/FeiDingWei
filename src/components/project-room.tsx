"use client";

import { useMemo, useState } from "react";
import { defaultLocale, translations, type Locale } from "@/lib/i18n";
import type { LlmRuntimeConfig } from "@/lib/llm-config";
import { localizeRoom, type LocalizableRoom } from "@/lib/localized-room";
import { buildRoomExport, roomExportFileName } from "@/lib/room-export";
import { AppShell } from "./app-shell";
import { RoomTabs } from "./room-tabs";

const defaultLlmConfig: LlmRuntimeConfig = {
  mode: "faux",
  reason: "Provider status is unavailable in this client render."
};

export function ProjectRoom({
  room,
  llmConfig = defaultLlmConfig,
  currentUser,
  accessibleRooms,
  workspaceMembers
}: {
  room: LocalizableRoom;
  llmConfig?: LlmRuntimeConfig;
  currentUser?: {
    name: string;
    email: string;
    workspaceRole?: string;
    functionLabel?: string;
    team?: { name: string } | null;
  };
  accessibleRooms?: Array<{ id: string; name: string }>;
  workspaceMembers?: Array<{
    id: string;
    name: string;
    email: string;
    workspaceRole: string;
    functionLabel: string;
    team: { name: string } | null;
    activeRooms: Array<{ id: string; name: string; roomRole: string }>;
  }>;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const labels = translations[locale];
  const localizedRoom = useMemo(() => localizeRoom(room, locale), [locale, room]);
  const roomForTabs = { ...localizedRoom, decisions: localizedRoom.decisions ?? [] };
  const exportRoomData = () => {
    const exported = buildRoomExport({ room, locale, llmConfig });
    const blob = new Blob([JSON.stringify(exported, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = roomExportFileName(room.name, exported.exportedAt);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      workspaceName={localizedRoom.workspace.name}
      roomName={localizedRoom.name}
      roomDescription={localizedRoom.description}
      labels={labels.shell}
      languageToggleLabel={labels.languageToggle}
      currentUser={currentUser}
      currentRoomId={room.id}
      rooms={(accessibleRooms ?? [{ id: room.id, name: room.name }]).map((item) => ({
        ...item,
        name: item.id === room.id ? localizedRoom.name : item.name
      }))}
      workspaceMembers={workspaceMembers}
      onLanguageToggle={() => setLocale((current) => (current === "zh" ? "en" : "zh"))}
      onRoomExport={exportRoomData}
    >
      <RoomTabs room={roomForTabs} labels={labels} llmConfig={llmConfig} />
    </AppShell>
  );
}
