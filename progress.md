# Session Progress Log

## Current State

**Last Updated:** 2026-06-16 HKT
**Active Feature:** none
**Current Phase:** README bilingual runtime positioning refresh complete

## Status

### What's Done

- [x] Updated Chinese and English README positioning for open source release: FeiDingWei now explicitly benchmarks against Feishu, DingTalk, and WeCom as closed-source collaboration giants, while preserving the current Agent Project Room MVP boundary.
- [x] Clarified in both READMEs that FeiDingWei is agent-centered: Agents are first-class collaborators/execution units, while humans own goals, judgment, approval, and responsibility.
- [x] Added README contract coverage for the new Chinese and English positioning statements.
- [x] Repaired baseline test fallout from current room-creation work: AppShell component tests now mock Next router, and member-service tests tolerate additional active rooms created by room-creation tests.
- [x] Synced `README.en.md` to the current shortened Chinese README structure.
- [x] Rewrote the Chinese and English `Agent Runtime` sections to explain the underlying execution chain, room context assembly, controlled tool calls, draft-only outputs, traceability, and faux-provider path instead of presenting the runtime as Pi reuse.
- [x] Updated README contract tests to protect the runtime-principles wording and reject the old Pi-reuse phrasing.
- [x] Completed `feat-001-project-bootstrap` through `feat-012-bilingual-ui-readme`.
- [x] Reproduced the mixed-language page with a browser text dump.
- [x] Identified root cause: `RoomTabs` owned locale state, so the language switch did not affect `AppShell`; seed/demo/faux content also stayed in its source language.
- [x] Added regression coverage in `src/components/__tests__/project-room.test.tsx`.
- [x] Added `src/components/project-room.tsx` to own locale state for the whole room.
- [x] Added `src/lib/localized-room.ts` to localize known seed/demo/faux content while leaving arbitrary user text untouched.
- [x] Moved language switching into the `AppShell` Settings menu.
- [x] Updated `RoomTabs` to render labels passed by `ProjectRoom` instead of owning language state.
- [x] Updated E2E to cover Settings-menu switching and localized generated artifacts.
- [x] Updated README copy to say language switching lives in Settings.
- [x] Completed `feat-013-language-consistency-settings`.
- [x] Confirmed manual UX issue: chat `@` did not suggest current room agents, while the Agents tab showed localized names without the canonical mention token.
- [x] Added `mentionTokenForAgentSlug` so the UI uses one source for `@PMAgent`, `@DocAgent`, and `@ReviewAgent`.
- [x] Added chat `@` suggestions that insert the selected agent mention token.
- [x] Updated the Agents tab and activity records to show localized agent name plus mention token.
- [x] Updated E2E coverage for `@` suggestion insertion and token visibility.
- [x] Completed `feat-014-agent-mention-ux`.
- [x] Accepted next functional direction: generated artifact traceability, draft edit/reject, run details, bidirectional run/artifact links, optional real LLM provider config, and local data management.
- [x] Scoped the first next feature as `feat-015-agent-run-traceability`, combining traceability UI, run details, and run/artifact links.
- [x] Wrote implementation plan at `docs/superpowers/plans/2026-06-07-agent-run-traceability.md`.
- [x] Registered `feat-015-agent-run-traceability` in `feature_list.json` as `not-started`.
- [x] Added room trace metadata enrichment so generated tasks/docs link to source messages and source runs.
- [x] Preserved and localized nested trace metadata for known seed/demo/faux content.
- [x] Rendered provenance blocks on generated tasks and documents.
- [x] Rendered trigger message and generated task/document summaries in agent activity.
- [x] Updated E2E to verify source message, Agent run, trigger message, generated tasks, and generated documents.
- [x] Completed `feat-015-agent-run-traceability`.
- [x] Implemented `feat-016-draft-edit-reject`.
- [x] Added draft task editing for title, description, and priority.
- [x] Added draft document editing for title and body.
- [x] Added task/document rejection with `rejected` artifact status.
- [x] Added draft-only mutation guards so stale approve/edit/reject requests return conflict instead of silently succeeding.
- [x] Fixed the mobile E2E race by disabling pending draft actions and scoping E2E actions to named artifact cards.
- [x] Implemented `feat-017-real-llm-provider-config`.
- [x] Added `FEIDINGWEI_LLM_PROVIDER`, `FEIDINGWEI_LLM_MODEL`, and optional `OPENAI_API_KEY` config.
- [x] Preserved deterministic faux-provider behavior when no OpenAI key is configured.
- [x] Wired OpenAI `gpt-5.5` model selection through Pi when provider/key are configured.
- [x] Added API key redaction for failed Agent run errors.
- [x] Updated README and architecture/reliability docs for no-key and real-key modes.
- [x] Repaired the baseline test harness so automated tests force deterministic faux provider behavior even when local `.env` contains real OpenAI settings.
- [x] Implemented `feat-018-agent-run-details-provider-status`.
- [x] Added current provider/model status to the Agents tab.
- [x] Added expandable Agent run details with run ID, input, output, and redacted error display.
- [x] Added generated task/document status badges inside Agent activity.
- [x] Forced Playwright-managed E2E servers to use faux provider mode so browser tests do not call real LLM APIs.
- [x] Implemented `feat-019-local-room-data-export`.
- [x] Added a Settings-menu `导出房间数据` / `Export room data` action.
- [x] Added versioned project room JSON exports with room data, locale, and no-secret provider/model metadata.
- [x] Added stable export filenames for local backup, debugging, and open source issue reproduction.
- [x] Implemented `feat-020-agent-generation-plan-preview`.
- [x] Added a Chat generation plan preview for mentioned agents before API execution.
- [x] Added confirm/cancel actions so users can review planned task/document drafts before the Agent runs.
- [x] Preserved the existing message API, Pi runtime, draft artifact, and traceability flow after confirmation.
- [x] Human acceptance completed for the current V1 behavior.
- [x] Defined V2 as the multi-user Agent collaboration release, focused on login, workspace membership, room permissions, multi-user chat, mentions, Inbox, assignment/review flows, People directory, member-aware Agents, Decision Log, and collaboration E2E.
- [x] Wrote V2 design spec at `docs/superpowers/specs/2026-06-14-feidingwei-v2-collaboration-design.md`.
- [x] Wrote V2 implementation plan at `docs/superpowers/plans/2026-06-14-feidingwei-v2-collaboration-implementation.md`.
- [x] Registered `feat-021-auth-session` through `feat-030-collaboration-e2e` in `feature_list.json` as `not-started`.
- [x] Implemented `feat-021-auth-session`.
- [x] Added Prisma `Session`, local demo login users, auth service, login API, logout route, login page, protected app pages, account display, and E2E login setup.
- [x] Documented local demo login users in Chinese and English READMEs.
- [x] Updated product, architecture, reliability, clean-state, and quality docs for the V2 auth baseline.
- [x] Fixed a fresh npm audit regression by updating the `esbuild` override to `0.28.1`.
- [x] Final `feat-021` verification passed: `npm run prisma:seed`, targeted auth/login tests, `npm run test` (18 files, 64 tests), `npm run lint`, `npm run build`, `npm audit --json` (0 vulnerabilities), `PLAYWRIGHT_PORT=3101 npm run test:e2e` (2 passed), and `./init.sh`.
- [x] Implemented `feat-022-workspace-membership-roles`.
- [x] Added workspace role/function schemas, Team model, Membership function labels and team links, deterministic team/member seed data, member-service summaries, and current-user workspace role/function/team display.
- [x] Final `feat-022` verification passed: targeted member/project-room tests, `npm run test` (19 files, 68 tests), `npm run lint`, `npm run build`, and `./init.sh`.
- [x] Implemented `feat-023-room-membership-permissions`.
- [x] Added room role schema, RoomMembership model, seeded room roles, access-control service, room page read guard, message/Agent execution guards, and task/doc mutation permission checks.
- [x] Final `feat-023` verification passed: access/route/auth tests, `npm run test` (20 files, 73 tests), `npm run lint`, `npm run build`, `PLAYWRIGHT_PORT=3101 npm run test:e2e` (2 passed), and `./init.sh`.
- [x] Implemented `feat-024-multi-user-chat-mentions`.
- [x] Added Notification model and mention service for stable user tokens, Agent-token exclusion, and room-member notification fanout.
- [x] Added room-member chat suggestions so `@product` inserts a human mention while `@PMAgent` still opens the generation plan preview.
- [x] Wired message creation to create mention notifications using the authenticated sender.
- [x] Added E2E coverage for sending a human `@product` message before the existing Agent generation workflow.
- [x] Final `feat-024` verification passed: mention/room-tabs/route tests (3 files, 22 tests), `npm run test` (21 files, 78 tests), `npm run lint`, `npm run build`, `PLAYWRIGHT_PORT=3101 npm run test:e2e` (2 passed), `git diff --check`, and `./init.sh`.
- [x] Implemented `feat-025-inbox-notifications`.
- [x] Added V2 notification types, notification-service create/list/read behavior, recipient-only mark-read API, InboxPanel unread/read UI, protected `/inbox` page, sidebar Inbox entry, and documentation.
- [x] Added cross-user E2E coverage where Business mentions Product and Product reviews the unread notification in Inbox.
- [x] Final `feat-025` verification passed: notification/inbox/project-room/route tests (4 files, 20 tests), `npm run test` (23 files, 84 tests), `npm run lint`, `npm run build`, `PLAYWRIGHT_PORT=3101 npm run test:e2e` (4 passed), `git diff --check`, and `./init.sh`.
- [x] Implemented `feat-026-task-doc-assignment-review`.
- [x] Added task assignees, document owners, requested reviewers, review status transitions, reviewer-gated approvals, return-for-revision comments, blocked/revision reasons, and assignment/review notifications.
- [x] Added task and document assignment/review controls to the room UI and E2E coverage for generated artifact handoff.
- [x] Final `feat-026` verification passed: targeted review/route/RoomTabs tests (3 files, 36 tests), blocked reason target tests (2 files, 18 tests), `npm run prisma:seed && npm run test` (24 files, 100 tests), `npm run lint`, `npm run build`, and `PLAYWRIGHT_PORT=3101 npm run test:e2e` (4 passed).
- [x] Implemented `feat-027-people-directory-light-org`.
- [x] Added workspace-scoped active room summaries to member-service, a protected `/people` page, PeopleDirectory member cards, sidebar People navigation, and E2E coverage for opening People from the room.
- [x] Final `feat-027` verification passed: targeted People/member/project-room tests (3 files, 9 tests), `npm run prisma:seed && npm run test` (25 files, 103 tests), `npm run lint`, `npm run build`, and `PLAYWRIGHT_PORT=3101 npm run test:e2e` (4 passed).
- [x] Implemented `feat-028-agent-member-aware-context`.
- [x] Added room-scoped Agent collaboration context with current user, room members, room roles, function labels, teams, assignments, review requests, and blockers.
- [x] Added Agent tools for assignee suggestions, review request suggestions, and blocker summaries without granting artifact approval or permission mutation.
- [x] Added Agent run generated-artifact collaboration summaries for assignee/owner, reviewer, and review state.
- [x] Final `feat-028` verification passed: targeted agent/RoomTabs tests (3 files, 23 tests), `npm run prisma:seed && npm run test` (25 files, 108 tests), `npm run lint`, `npm run build`, and `PLAYWRIGHT_PORT=3101 npm run test:e2e` (4 passed).
- [x] Implemented `feat-029-decision-log`.
- [x] Added Prisma `Decision` persistence, decision-service creation/listing, human decision API, Decisions tab, and Agent `create_draft_decision` tool.
- [x] Preserved decision provenance through source message and Agent run trace blocks, room export payloads, localization, and Agents tab generated-decision summaries.
- [x] Final `feat-029` verification passed: targeted decision/tool/route/RoomTabs/export tests (5 files, 40 tests), `npm run lint`, `npm run build`, `npm run prisma:seed && npm run test` (26 files, 113 tests), `PLAYWRIGHT_PORT=3101 npm run test:e2e` (4 passed), `git diff --check`, and `./init.sh`.
- [x] Implemented `feat-030-collaboration-e2e`.
- [x] Added `tests/e2e/collaboration.spec.ts` for the V2 business-product-engineering-QA flow across login, chat, PM Agent generation, Product Inbox, PRD review request, Engineering return-for-revision, Product decision recording, QA-triggered ReviewAgent run, and Agents-tab traceability.
- [x] Updated room permissions so reviewer/QA users can execute visible review Agents while viewer users remain read-only.
- [x] Final `feat-030` verification passed: targeted access-control test (1 file, 6 tests), collaboration E2E single-file run (1 passed), `npm run prisma:seed && npm run test` (26 files, 114 tests), `npm run lint`, `npm run build`, `npm audit --json` (0 vulnerabilities), `PLAYWRIGHT_PORT=3101 npm run test:e2e` (5 passed, 1 skipped), `git diff --check`, and `./init.sh`.
- [x] Accepted `feat-031-room-creation-membership` scope: create rooms from the sidebar by selecting workspace members and room roles.
- [x] Wrote design spec at `docs/superpowers/specs/2026-06-15-room-creation-membership-design.md`.
- [x] Wrote implementation plan at `docs/superpowers/plans/2026-06-15-room-creation-membership.md`.
- [x] Implemented `feat-031-room-creation-membership`.
- [x] Added room-service creation and accessible-room listing coverage, authenticated `/api/rooms` coverage, ProjectRoom/AppShell create-room component coverage, and Playwright room creation membership coverage.
- [x] Added `createProjectRoomWithMembers` so new rooms are created with creator `room_lead`, selected workspace members/roles, and default visible Agents in one transaction; the service now rejects creators who are not workspace members.
- [x] Added accessible room links to the sidebar and made root redirect choose the first room accessible to the current user.
- [x] Added the create-time room form with name, description, workspace-member selection, current-user filtering, role selection, error handling, and redirect to the created room.
- [x] Final `feat-031` verification passed: targeted service/API/component tests (3 files, 41 tests), room creation E2E single scenario (1 passed, 1 mobile skip), `npm run prisma:seed && npm run test` (26 files, 122 tests), `npm run lint`, `npm run build`, `PLAYWRIGHT_PORT=3101 npm run test:e2e` (6 passed, 2 skipped), `git diff --check`, and `./init.sh`.

### What's In Progress

- [x] No active feature is in progress.

### What's Next

1. Manually accept `feat-031-room-creation-membership` in the browser: create a room, invite Product/QA, verify Product can enter and Engineer cannot see or enter it.
2. Choose the next feature only after the room creation flow is accepted.
3. Keep broader enterprise org management, external invitations, SSO, OA, CRM, and full IM outside the current MVP boundary.

## Blockers / Risks

- [x] Git repository exists and commits were created on `feature/mvp-implementation`.
- [x] Pi packages are installed and runtime orchestration is covered by unit and E2E tests.
- [x] Node.js requirement is documented as `>=22.19.0`; current environment uses a compatible Node runtime.
- [ ] Playwright emits Node `DEP0205` and `NO_COLOR`/`FORCE_COLOR` warnings under the current toolchain. These are non-blocking warnings; the E2E command exits 0.
- [ ] Language preference is still client-local state; persistence across sessions is not implemented yet.
- [ ] Chrome DevTools smoke check could not open because the local browser profile was already locked; Playwright E2E covered the browser workflow instead.
- [ ] Real OpenAI calls are wired but not exercised by automated tests because they require a human-provided API key and network access.

## Decisions Made

- **MVP wedge:** FeiDingWei starts as an Agent Project Room, not a full office suite.
- **Open source reuse:** Use Pi for generic agent runtime and LLM/provider infrastructure.
- **Iteration management:** Adopt a harness-style workflow from `walkinglabs/learn-harness-engineering`.
- **Clean TypeScript verification:** `npm run lint` runs `next typegen && tsc --noEmit`.
- **Language scope:** `ProjectRoom` owns locale state for the full page.
- **Settings placement:** Language switching lives in the Settings menu instead of a naked tab-bar button.
- **Content localization:** Known seed/demo/faux text is localized; arbitrary user-authored text is not translated automatically.
- **Agent mention UX:** Canonical mention tokens remain English command tokens while localized agent display names are shown beside those tokens.
- **Vitest database stability:** Vitest file parallelism is disabled because DB tests share the same SQLite seed database.
- **Next implementation order:** Build traceability first because source links are already persisted and it strengthens the core agent-native differentiator without expanding into non-goals.
- **Traceability scope:** Use existing `sourceMessageId` and `sourceRunId` fields; no Prisma migration was needed for `feat-015`.
- **README split:** `README.md` is Chinese-first; `README.en.md` is the English version.
- **Deployment stance:** v0 is a pure Web application and is positioned as private-deployment-first for companies.
- **Model key stance:** v0 does not require a model API key by default because it uses Pi faux provider runs.
- **Draft review stance:** Generated artifacts can now be edited, approved, or rejected while preserving source message and agent-run traceability.
- **Stale mutation stance:** API routes return 409 for approve/edit/reject attempts against non-draft artifacts instead of returning a no-op success.
- **Provider config stance:** Default local behavior remains faux/no-key; setting `FEIDINGWEI_LLM_PROVIDER="openai"` plus `OPENAI_API_KEY` enables real OpenAI execution through Pi.
- **Secret handling stance:** Provider API keys stay in server-side environment variables and are redacted from persisted Agent run errors.
- **Automated LLM test stance:** Automated unit/component/E2E checks must use deterministic faux provider behavior even if the developer's local `.env` is configured for OpenAI.
- **Run details stance:** Agents tab exposes provider/model status plus expandable run details; generated artifacts remain draft/reviewable and are shown with status badges.
- **Local data stance:** First local data management capability is export-only. It avoids destructive reset/import behavior while making local backup and bug reports easier.
- **Generation preview stance:** Mentioned agents now require a human confirmation step before execution; plain human messages still send directly.
- **Human mention stance:** Room-member mentions use stable email-local-part tokens like `@product`, create unread mention notifications, and never trigger Agent generation previews.
- **Inbox stance:** Inbox is user-scoped, groups unread/read notifications, and read-state mutation is recipient-only.
- **Review workflow stance:** Requested reviewers own normal task/document approval; room leads and workspace admins can override, while non-selected room reviewers are rejected.
- **Revision reason stance:** Return-for-revision comments are persisted as comments and surfaced as blocked/revision reasons on the artifact card.
- **People directory stance:** People is read-only lightweight org context scoped to the current workspace; it does not manage users, roles, or enterprise org structure.
- **Member-aware Agent stance:** Agents can receive room collaboration context and suggest assignees/review handoffs/blocker summaries, but they still cannot approve artifacts or mutate permissions.
- **Decision Log stance:** Human-recorded decisions are active room records; Agent-created decisions are drafts and remain traceable to source messages and Agent runs.
- **Reviewer Agent permission stance:** Reviewer/QA room members may execute review Agents as part of the review workflow; viewer room members remain read-only.

## Files Modified This Session

- `README.md`: Clarified that language switching is in Settings.
- `README.en.md`: Clarified that language switching is in Settings.
- `docs/superpowers/plans/2026-06-07-bilingual-ui-and-readme.md`: Updated final language architecture.
- `feature_list.json`: Added `feat-013-language-consistency-settings`.
- `progress.md`: Updated current progress and evidence.
- `quality-document.md`: Updated quality evidence.
- `session-handoff.md`: Updated handoff evidence.
- `src/lib/i18n.ts`: Added settings-menu labels.
- `src/lib/localized-room.ts`: Added known seed/demo/faux content localization.
- `src/components/project-room.tsx`: Added whole-room locale owner.
- `src/components/app-shell.tsx`: Added Settings menu and language menu item.
- `src/components/room-tabs.tsx`: Removed local language state and naked language toggle.
- `src/components/__tests__/project-room.test.tsx`: Added regression coverage.
- `src/components/__tests__/room-tabs.test.tsx`: Updated to test localized panel labels.
- `src/app/rooms/[roomId]/page.tsx`: Renders `ProjectRoom`.
- `tests/e2e/project-room.spec.ts`: Updated browser workflow for Settings-menu language switching and localized content.
- `src/lib/domain.ts`: Added canonical mention token mapping.
- `src/components/chat-panel.tsx`: Added room-agent `@` suggestions and insertion.
- `src/components/agents-panel.tsx`: Added mention token display for agent list and run history.
- `playwright.config.ts`: Added optional env-based port and existing-server reuse for local verification.
- `vitest.config.ts`: Disabled file parallelism to avoid shared SQLite test races.
- `docs/superpowers/plans/2026-06-07-agent-run-traceability.md`: Added implementation plan for source message/run traceability and generated artifact summaries.
- `src/lib/room-service.ts`: Added trace metadata enrichment for tasks, documents, and agent runs.
- `src/lib/__tests__/room-service.test.ts`: Added trace metadata service coverage.
- `src/lib/__tests__/localized-room.test.ts`: Added nested trace localization coverage.
- `src/components/tasks-panel.tsx`: Added provenance block for generated tasks.
- `src/components/docs-panel.tsx`: Added provenance block for generated documents.
- `src/components/agents-panel.tsx`: Added trigger message and generated artifact summaries.
- `src/lib/i18n.ts`: Added traceability labels.
- `tests/e2e/project-room.spec.ts`: Added traceability assertions.
- `src/lib/domain.ts`: Added `rejected` artifact status.
- `src/app/api/tasks/[taskId]/route.ts`: Added draft task update endpoint.
- `src/app/api/tasks/[taskId]/reject/route.ts`: Added draft task reject endpoint.
- `src/app/api/docs/[docId]/route.ts`: Added draft document update endpoint.
- `src/app/api/docs/[docId]/reject/route.ts`: Added draft document reject endpoint.
- `src/app/api/tasks/[taskId]/approve/route.ts`: Added stale non-draft conflict handling.
- `src/app/api/docs/[docId]/approve/route.ts`: Added stale non-draft conflict handling.
- `src/app/api/__tests__/routes.test.ts`: Added draft edit/reject and conflict coverage.
- `src/components/tasks-panel.tsx`: Added inline draft editing, rejection, pending action guards, and accessible card names.
- `src/components/docs-panel.tsx`: Added inline draft editing, rejection, pending action guards, and accessible card names.
- `src/components/__tests__/room-tabs.test.tsx`: Added draft edit/reject and accessible-card coverage.
- `tests/e2e/project-room.spec.ts`: Added draft edit/reject workflow coverage with stable artifact-card locators.
- `docs/RELIABILITY.md`: Updated draft review and stale mutation expectations.
- `clean-state-checklist.md`: Updated artifact status and runtime checklist for rejected artifacts.
- `.env.example`: Added optional real OpenAI provider configuration.
- `src/lib/llm-config.ts`: Added server-side provider selection and no-key fallback.
- `src/lib/__tests__/llm-config.test.ts`: Added provider selection and secret non-exposure coverage.
- `src/lib/pi-runtime.ts`: Added OpenAI model selection through Pi runtime.
- `src/lib/agent-service.ts`: Added Agent run error redaction.
- `src/lib/__tests__/agent-service.test.ts`: Added OpenAI model selection and error redaction coverage.
- `src/lib/__tests__/readme.test.ts`: Added provider config documentation coverage.
- `README.md`: Documented optional OpenAI provider configuration and no-key mode.
- `README.en.md`: Documented optional OpenAI provider configuration and no-key mode.
- `docs/ARCHITECTURE.md`: Documented provider selection boundary and server-side API key handling.
- `docs/RELIABILITY.md`: Documented provider error redaction and no-key fallback.
- `src/components/agents-panel.tsx`: Added provider/model status, expandable run detail records, redacted error display, and generated artifact status badges.
- `src/components/room-tabs.tsx`: Passed no-secret LLM runtime config into the Agents panel.
- `src/components/project-room.tsx`: Accepted no-secret LLM runtime config for whole-room rendering.
- `src/app/rooms/[roomId]/page.tsx`: Resolved server-side LLM runtime config and passed provider/model status to the UI.
- `src/lib/i18n.ts`: Added provider, detail, error, and artifact status labels for Agent activity.
- `src/components/__tests__/room-tabs.test.tsx`: Added provider status, expandable run detail, and failed-run secret-redaction coverage.
- `playwright.config.ts`: Forced Playwright-managed E2E servers to use faux provider mode.
- `tests/e2e/project-room.spec.ts`: Added provider status and Agent run detail assertions.
- `clean-state-checklist.md`: Added provider status and run detail runtime checks.
- `src/lib/room-export.ts`: Added versioned room export builder and stable JSON filename generation.
- `src/lib/__tests__/room-export.test.ts`: Added room export structure and filename coverage.
- `src/components/app-shell.tsx`: Added Settings-menu data export action.
- `src/components/project-room.tsx`: Wired project room JSON download behavior.
- `src/components/__tests__/project-room.test.tsx`: Added Settings export coverage and no-secret export assertions.
- `README.md`: Documented local room data export.
- `README.en.md`: Documented local room data export.
- `src/lib/__tests__/readme.test.ts`: Added README export documentation coverage.
- `src/components/chat-panel.tsx`: Added generation plan preview, confirm, and cancel behavior for mentioned agents.
- `src/lib/i18n.ts`: Added generation plan labels in Chinese and English.
- `src/components/__tests__/room-tabs.test.tsx`: Added preview-before-send component coverage.
- `tests/e2e/project-room.spec.ts`: Added browser coverage for generation plan preview and confirm generation.
- `docs/PRODUCT.md`: Documented preview-before-run user journey.
- `docs/ARCHITECTURE.md`: Documented the UI confirmation gate before message API execution.
- `docs/RELIABILITY.md`: Documented preview confirmation as an agent safety behavior.
- `clean-state-checklist.md`: Added runtime checks for preview and confirm generation.
- `docs/superpowers/specs/2026-06-15-room-creation-membership-design.md`: Added accepted room creation design.
- `docs/superpowers/plans/2026-06-15-room-creation-membership.md`: Added room creation implementation plan.
- `src/lib/room-service.ts`: Added accessible room listing and create-with-members transaction.
- `src/app/api/rooms/route.ts`: Added authenticated room creation API route.
- `src/app/page.tsx`: Redirects users to their first accessible room.
- `src/app/rooms/[roomId]/page.tsx`: Loads accessible rooms and workspace members for the room shell.
- `src/components/app-shell.tsx`: Added accessible room links and create-time member/role form.
- `src/components/project-room.tsx`: Passes accessible rooms and workspace members into the shell.
- `src/lib/i18n.ts`: Added room creation labels and room role labels.
- `src/lib/__tests__/room-service.test.ts`: Added room creation and accessible-room tests.
- `src/app/api/__tests__/routes.test.ts`: Added `/api/rooms` creation, validation, and auth tests.
- `src/components/__tests__/project-room.test.tsx`: Added sidebar room links and create-room form coverage.
- `tests/e2e/collaboration.spec.ts`: Added room creation membership E2E flow.
- `README.md`, `README.en.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/RELIABILITY.md`, `clean-state-checklist.md`, `quality-document.md`: Documented room creation behavior and verification expectations.

## Evidence of Completion

- [x] Open source README positioning targeted verification passed: `npm run test -- src/lib/__tests__/readme.test.ts` reported 1 file and 2 tests passed.
- [x] Agent runtime README refresh targeted verification passed: `npm run test -- src/lib/__tests__/readme.test.ts` reported 1 file and 2 tests passed after protecting the bilingual execution-chain wording and rejecting old Pi-reuse phrasing.
- [x] Agent runtime README refresh final verification passed: `./init.sh` completed npm install/audit, Prisma generate, lint, 26 test files / 122 tests, and build. npm reported 2 audit vulnerabilities, but the harness completed successfully.
- [x] Baseline repair targeted verification passed: `npm run test -- src/components/__tests__/app-shell.test.tsx src/lib/__tests__/member-service.test.ts src/lib/__tests__/readme.test.ts` reported 3 files and 7 tests passed.
- [x] Final standard verification passed after README positioning refresh: `./init.sh` completed npm install/audit, Prisma generate, lint, 26 test files / 122 tests, and build.
- [x] Browser text dump reproduced the bug before the fix: Chinese UI labels mixed with English room name, description, seed messages, and agent output; English mode still showed Chinese shell labels.
- [x] Regression test failed before implementation because `ProjectRoom` did not exist.
- [x] Targeted tests passed: `npm run test -- src/components/__tests__/project-room.test.tsx src/components/__tests__/room-tabs.test.tsx` reported 2 files and 3 tests passed.
- [x] Final full verification passed: `npm run prisma:seed && npm run test && npm run lint && npm run build && npm audit --json && npm run test:e2e`.
- [x] Final test count: 12 files and 28 tests passed.
- [x] Final audit result: 0 total vulnerabilities.
- [x] Final E2E result: 2 Playwright tests passed across desktop and mobile.
- [x] Local smoke passed at `http://127.0.0.1:3100`: default Chinese room content appeared, key English seed copy was absent, Settings -> English switched the whole page to English.
- [x] Agent mention UX red test failed before implementation because `@PMAgent` was not visible in the Agents tab and no `@` suggestion button existed.
- [x] Targeted mention UX test passed: `npm run test -- src/components/__tests__/room-tabs.test.tsx` reported 1 file and 3 tests passed.
- [x] Full verification after mention UX fix passed: `npm run test` reported 12 files and 29 tests passed; `npm run lint` passed; `npm run build` passed; `PLAYWRIGHT_REUSE_EXISTING=1 npm run test:e2e` passed with 2 tests; `./init.sh` passed.
- [x] Baseline before traceability planning passed: `./init.sh` completed npm install/audit, Prisma generate, lint, 29 tests, and build.
- [x] Traceability red tests failed before implementation for missing task/doc provenance, missing run generated-artifact details, and missing nested trace localization.
- [x] Targeted traceability tests passed: `npm run test -- src/lib/__tests__/room-service.test.ts src/lib/__tests__/localized-room.test.ts src/components/__tests__/room-tabs.test.tsx` reported 3 files and 9 tests passed.
- [x] Final traceability verification passed: `npm run test` reported 13 files and 31 tests passed; `npm run lint` passed; `npm run build` passed; `PLAYWRIGHT_REUSE_EXISTING=1 npm run test:e2e` passed with 2 tests; `./init.sh` passed; `npm audit --json` reported 0 total vulnerabilities.
- [x] Draft edit/reject red tests failed before implementation for missing accessible artifact-card names and non-draft reject requests returning 200 no-op success.
- [x] Targeted draft edit/reject tests passed: `npm run test -- src/lib/__tests__/room-service.test.ts src/app/api/__tests__/routes.test.ts src/components/__tests__/room-tabs.test.tsx` reported 3 files and 26 tests passed.
- [x] Mobile E2E regression passed: `PLAYWRIGHT_REUSE_EXISTING=1 npx playwright test tests/e2e/project-room.spec.ts --project=mobile --reporter=line` reported 1 passed.
- [x] Final draft edit/reject verification passed: `npm run test` reported 13 files and 46 tests passed; `npm run lint` passed; `npm run build` passed; `PLAYWRIGHT_REUSE_EXISTING=1 npm run test:e2e` passed with 2 tests; `./init.sh` passed; `npm audit --json` reported 0 total vulnerabilities.
- [x] Real provider config red tests failed before implementation because `llm-config` did not exist, `createRoomAgent` still selected `feidingwei-faux`, and `sanitizeAgentRunError` did not exist.
- [x] Targeted real provider config tests passed: `npm run test -- src/lib/__tests__/llm-config.test.ts src/lib/__tests__/agent-service.test.ts src/lib/__tests__/readme.test.ts` reported 3 files and 10 tests passed.
- [x] Final real provider config verification passed: `npm run test` reported 14 files and 50 tests passed; `npm run lint` passed; `npm run build` passed; `PLAYWRIGHT_REUSE_EXISTING=1 npm run test:e2e` passed with 2 tests; `./init.sh` passed with lint, 50 tests, and build; `npm audit --json` reported 0 total vulnerabilities.
- [x] Baseline real-key test regression fixed: `npm run test -- src/lib/__tests__/agent-service.test.ts` passed with deterministic faux provider config despite local `.env` containing OpenAI settings.
- [x] Agent run details red tests failed before implementation because Agents UI had no provider status or Details button.
- [x] Targeted Agent run details test passed: `npm run test -- src/components/__tests__/room-tabs.test.tsx` reported 1 file and 6 tests passed.
- [x] Agent run details E2E passed: `PLAYWRIGHT_PORT=3101 npm run test:e2e` reported 2 Playwright tests passed with faux provider mode forced for the test server.
- [x] Final Agent run details verification passed: `npm run test` reported 15 files and 53 tests passed; `npm run lint` passed; `npm run build` passed; `npm audit --json` reported 0 total vulnerabilities; `git diff --check` passed; `./init.sh` passed with lint, 53 tests, and build.
- [x] Local HTTP smoke passed at `http://127.0.0.1:3100`: root redirected to the seeded room and the room HTML included the current OpenAI `gpt-5.5` provider status from `.env`.
- [x] Chrome DevTools MCP browser smoke was blocked by an already-running browser profile; Playwright desktop/mobile E2E and HTTP smoke covered the changed workflow.
- [x] Local room export red tests failed before implementation because `room-export` did not exist and Settings had no `导出房间数据` menu item.
- [x] Targeted local room export tests passed: `npm run test -- src/lib/__tests__/room-export.test.ts src/components/__tests__/project-room.test.tsx src/lib/__tests__/readme.test.ts` reported 3 files and 6 tests passed.
- [x] Local room export E2E passed: `PLAYWRIGHT_PORT=3101 npm run test:e2e` reported 2 Playwright tests passed with the export menu item visible in Settings.
- [x] Local room export full verification passed: `npm run test` reported 16 files and 56 tests passed; `npm run lint` passed; `npm run build` passed; `npm audit --json` reported 0 total vulnerabilities; `git diff --check` passed; `./init.sh` passed with lint, 56 tests, and build.
- [x] Agent generation plan red test failed before implementation because sending `@PMAgent` immediately called the message API and no `生成计划` preview existed.
- [x] Targeted generation preview tests passed: `npm run test -- src/components/__tests__/room-tabs.test.tsx src/lib/__tests__/readme.test.ts` reported 2 files and 9 tests passed.
- [x] Generation preview E2E passed: `PLAYWRIGHT_PORT=3101 npm run test:e2e` reported 2 Playwright tests passed with preview-before-run and confirm-generation covered.
- [x] Generation preview full verification passed: `npm run test` reported 16 files and 57 tests passed; `npm run lint` passed; `npm run build` passed; `npm audit --json` reported 0 total vulnerabilities; `git diff --check` passed; `./init.sh` passed with lint, 57 tests, and build.
- [x] Multi-user mention red tests failed before implementation because `mention-service` and `Notification` did not exist, room-member suggestions were absent, and message routes did not create mention notifications.
- [x] Targeted multi-user mention tests passed: `npm run test -- src/lib/__tests__/mention-service.test.ts src/components/__tests__/room-tabs.test.tsx src/app/api/__tests__/routes.test.ts` reported 3 files and 22 tests passed.
- [x] Multi-user mention full verification passed: `npm run test` reported 21 files and 78 tests passed; `npm run lint` passed; `npm run build` passed; `PLAYWRIGHT_PORT=3101 npm run test:e2e` passed with 2 tests; `git diff --check` passed; `./init.sh` passed with lint, 78 tests, and build.

## Notes For Next Session

Start from the completed bilingual MVP with agent mention discoverability, generation plan preview, agent run traceability, draft edit/reject, optional OpenAI provider configuration, visible provider/run details, and local room data export on branch `feature/mvp-implementation`.
