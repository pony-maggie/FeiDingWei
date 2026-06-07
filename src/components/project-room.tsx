"use client";

import { useMemo, useState } from "react";
import { defaultLocale, translations, type Locale } from "@/lib/i18n";
import { localizeRoom, type LocalizableRoom } from "@/lib/localized-room";
import { AppShell } from "./app-shell";
import { RoomTabs } from "./room-tabs";

export function ProjectRoom({ room }: { room: LocalizableRoom }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const labels = translations[locale];
  const localizedRoom = useMemo(() => localizeRoom(room, locale), [locale, room]);

  return (
    <AppShell
      workspaceName={localizedRoom.workspace.name}
      roomName={localizedRoom.name}
      roomDescription={localizedRoom.description}
      labels={labels.shell}
      languageToggleLabel={labels.languageToggle}
      onLanguageToggle={() => setLocale((current) => (current === "zh" ? "en" : "zh"))}
    >
      <RoomTabs room={localizedRoom} labels={labels} />
    </AppShell>
  );
}
