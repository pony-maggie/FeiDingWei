import type { Locale } from "./i18n";
import type { LlmRuntimeConfig } from "./llm-config";
import type { LocalizableRoom } from "./localized-room";

export type RoomExport = {
  exportVersion: 1;
  product: "FeiDingWei";
  exportedAt: string;
  locale: Locale;
  llm: LlmRuntimeConfig;
  room: LocalizableRoom;
};

export function buildRoomExport(input: {
  room: LocalizableRoom;
  locale: Locale;
  llmConfig: LlmRuntimeConfig;
  exportedAt?: string;
}): RoomExport {
  return {
    exportVersion: 1,
    product: "FeiDingWei",
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    locale: input.locale,
    llm: input.llmConfig,
    room: input.room
  };
}

export function roomExportFileName(roomName: string, exportedAt: string) {
  const slug = roomName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const timestamp = exportedAt.replace(/[:.]/g, "-");

  return `feidingwei-${slug || "room"}-${timestamp}.json`;
}
