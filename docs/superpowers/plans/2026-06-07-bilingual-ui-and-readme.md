# Bilingual UI And README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Chinese and English support to the MVP UI, split README into Chinese and English versions, and document the private-deployment posture.

**Architecture:** Keep i18n lightweight for v0. A client-side dictionary powers UI labels, `ProjectRoom` owns the current locale for the whole page, `AppShell` exposes language switching inside a Settings menu, and known seed/demo content is localized for the selected language. README files are separate documents so Chinese users see Chinese first while English readers can open `README.en.md`.

**Tech Stack:** Next.js App Router, React client components, Vitest, Testing Library, Playwright.

---

## File Structure

- Create `src/lib/i18n.ts`: language codes, dictionary, default language, and translation types.
- Create `src/lib/localized-room.ts`: localize known seed/demo content without translating arbitrary user input.
- Create `src/components/project-room.tsx`: own current language state for the whole room and pass localized data/labels down.
- Modify `src/components/room-tabs.tsx`: render localized labels passed from `ProjectRoom`.
- Modify `src/components/app-shell.tsx`: accept localized shell labels and render language switching inside a Settings menu.
- Modify `src/components/chat-panel.tsx`: accept localized chat labels.
- Modify `src/components/tasks-panel.tsx`: accept localized task labels and status translations.
- Modify `src/components/docs-panel.tsx`: accept localized doc labels and status translations.
- Modify `src/components/agents-panel.tsx`: accept localized agent labels and status translations.
- Modify `src/components/__tests__/room-tabs.test.tsx`: verify localized panel labels.
- Create `src/components/__tests__/project-room.test.tsx`: verify whole-room Chinese defaults, localized seed/demo content, and Settings-menu language switching.
- Modify `src/lib/__tests__/readme.test.ts`: verify Chinese and English README runbooks.
- Modify `README.md`: Chinese README.
- Create `README.en.md`: English README.
- Modify `tests/e2e/project-room.spec.ts`: use Chinese default labels and verify English toggle.

## Tasks

### Task 1: README Contract

- [ ] Add failing tests that assert `README.md` is Chinese-first, `README.en.md` exists, both mention Web app deployment posture, private deployment, no required API key for v0, Pi runtime, setup, and E2E verification.
- [ ] Run `npm run test -- src/lib/__tests__/readme.test.ts` and confirm failure because `README.en.md` is missing and deployment copy is incomplete.
- [ ] Replace `README.md` with Chinese copy and add `README.en.md`.
- [ ] Re-run the README test and confirm pass.

### Task 2: UI Localization

- [ ] Add failing component tests for default Chinese UI and switching to English.
- [ ] Run `npm run test -- src/components/__tests__/room-tabs.test.tsx` and confirm failure.
- [ ] Add `src/lib/i18n.ts`, wire `RoomTabs`, `AppShell`, `ChatPanel`, `TasksPanel`, `DocsPanel`, and `AgentsPanel` to localized labels.
- [ ] Re-run the component test and confirm pass.

### Task 2.1: Language Consistency Bugfix

- [x] Confirm root cause with a browser text dump: `RoomTabs` owned locale state, while `AppShell` and seed/demo content remained in their source language.
- [x] Add failing regression test in `src/components/__tests__/project-room.test.tsx` for whole-page Chinese defaults and Settings-menu language switching.
- [x] Add `src/components/project-room.tsx` and `src/lib/localized-room.ts`.
- [x] Move language switching into `AppShell` Settings menu.
- [x] Re-run targeted tests and confirm pass.

### Task 3: E2E And Verification

- [ ] Update `tests/e2e/project-room.spec.ts` for Chinese default labels, Settings-menu language switching, localized seed/demo content, and localized generated artifact display.
- [ ] Run `npm run prisma:seed && npm run test && npm run lint && npm run build && npm audit --json && npm run test:e2e`.
- [ ] Update `feature_list.json`, `progress.md`, `quality-document.md`, and `session-handoff.md` with bilingual UI and README evidence.
- [ ] Commit with `feat: add bilingual ui and readmes`.
