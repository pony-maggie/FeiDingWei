# Session Handoff

## Current Objective

- Goal: Build FeiDingWei V2, a multi-user Agent-native project collaboration room.
- Current status: V1 accepted by human review; V2 collaboration design and implementation plan are complete; `feat-021-auth-session` through `feat-032-user-manual` are complete.
- Branch: `feature/mvp-implementation`.

## Completed This Session

- [x] Updated Chinese and English README positioning for open source release: FeiDingWei now explicitly benchmarks against Feishu, DingTalk, and WeCom as closed-source collaboration giants.
- [x] Clarified the agent-centered product stance in both READMEs: Agents are first-class collaborators/execution units, while humans own goals, judgment, approval, and responsibility.
- [x] Added README contract assertions for the new Chinese and English positioning statements.
- [x] Repaired baseline test fallout from current room-creation work: AppShell tests mock Next router and member-service tests allow additional active rooms.
- [x] Synced `README.en.md` to the shortened Chinese README structure.
- [x] Rewrote the Chinese and English `Agent Runtime` sections to explain the execution chain, room context assembly, controlled tool calls, draft-only outputs, traceability, and faux-provider path instead of describing runtime as Pi reuse.
- [x] Updated README contract assertions to protect the runtime-principles wording and reject the old Pi-reuse phrasing.
- [x] Confirmed MVP direction: Agent Project Room.
- [x] Wrote design spec.
- [x] Wrote implementation plan.
- [x] Revised implementation plan to reuse Pi agent infrastructure.
- [x] Added iteration management harness files.
- [x] Bootstrapped the Next.js, TypeScript, Tailwind, Prisma, Vitest, and Playwright app.
- [x] Added Prisma schema, migration, seed data, and room service layer.
- [x] Added Pi-backed agent runtime and artifact tools.
- [x] Added message, task approval, and document approval API routes.
- [x] Added project room shell, chat, tasks, docs, agents, and activity UI.
- [x] Added unit, service, API, component, package-script, and E2E tests.
- [x] Added README runbook.
- [x] Completed final seed, test, lint, build, audit, and E2E verification.
- [x] Added Chinese-first UI labels and English toggle.
- [x] Split README into Chinese `README.md` and English `README.en.md`.
- [x] Documented that v0 is a pure Web app, private-deployment-first, and does not require a model API key by default.
- [x] Fixed mixed Chinese/English display by moving language state to the whole project room.
- [x] Moved language switching into the Settings menu.
- [x] Localized known seed/demo/faux content for the selected language.
- [x] Added visible mention tokens in the Agents tab and activity records.
- [x] Added chat `@` suggestions for current room agents.
- [x] Stabilized Vitest DB tests by disabling file parallelism for shared SQLite state.
- [x] Planned `feat-015-agent-run-traceability` at `docs/superpowers/plans/2026-06-07-agent-run-traceability.md`.
- [x] Implemented `feat-015-agent-run-traceability`.
- [x] Added provenance blocks to generated tasks and documents.
- [x] Added trigger message and generated artifact summaries to agent activity.
- [x] Preserved trace metadata through Chinese/English localization.
- [x] Implemented `feat-016-draft-edit-reject`.
- [x] Added inline draft task and document editing.
- [x] Added draft task and document rejection with visible rejected status.
- [x] Added stale non-draft mutation protection so approve/edit/reject attempts return 409 instead of silent no-op success.
- [x] Fixed mobile E2E action targeting with named artifact cards and pending-action UI guards.
- [x] Implemented `feat-017-real-llm-provider-config`.
- [x] Added optional `FEIDINGWEI_LLM_PROVIDER="openai"` + `OPENAI_API_KEY` execution through Pi.
- [x] Preserved no-key faux-provider behavior for deterministic local testing.
- [x] Added API key redaction for failed Agent run errors.
- [x] Updated `.env.example`, Chinese README, English README, architecture, and reliability docs for no-key and real-key modes.
- [x] Implemented `feat-018-agent-run-details-provider-status`.
- [x] Added current provider/model status to the Agents tab.
- [x] Added expandable Agent run details with run ID, input, output, and redacted error display.
- [x] Added generated task/document status badges inside Agent activity.
- [x] Forced Playwright-managed E2E servers to use faux provider mode so automated browser tests do not call real LLM APIs.
- [x] Implemented `feat-019-local-room-data-export`.
- [x] Added Settings-menu room JSON export.
- [x] Added versioned export payloads with room data, locale, and no-secret provider/model metadata.
- [x] Added stable export filenames for local backup, debugging, and open source issue reproduction.
- [x] Implemented `feat-020-agent-generation-plan-preview`.
- [x] Added generation plan preview before mentioned agents run.
- [x] Added confirm/cancel controls so Agent execution only starts after human confirmation.
- [x] Human acceptance completed for the V1 project room behavior.
- [x] Wrote V2 collaboration design at `docs/superpowers/specs/2026-06-14-feidingwei-v2-collaboration-design.md`.
- [x] Wrote V2 collaboration implementation plan at `docs/superpowers/plans/2026-06-14-feidingwei-v2-collaboration-implementation.md`.
- [x] Registered `feat-021-auth-session` through `feat-030-collaboration-e2e` in `feature_list.json` as the V2 sequence.
- [x] Implemented `feat-021-auth-session`.
- [x] Added local demo login/logout, persisted sessions, protected app pages, seeded V2 demo users, and updated E2E login flow.
- [x] Updated README, product, architecture, reliability, clean-state, and quality docs for the V2 auth baseline.
- [x] Updated `esbuild` override to `0.28.1` so `npm audit --json` reports 0 vulnerabilities again.
- [x] Implemented `feat-022-workspace-membership-roles`.
- [x] Added workspace role/function schemas, teams, member summaries, seeded business/product/engineering/QA membership context, and app shell role/function/team display.
- [x] Implemented `feat-023-room-membership-permissions`.
- [x] Added RoomMembership, seeded room roles, access-control helpers, room read/action guards, and authenticated API route tests.
- [x] Implemented `feat-024-multi-user-chat-mentions`.
- [x] Added Notification, mention-service parsing, room-member `@` suggestions, authenticated sender notification fanout, and browser coverage for `@product` human messages.
- [x] Implemented `feat-025-inbox-notifications`.
- [x] Added notification-service create/list/read behavior, `/inbox`, sidebar Inbox entry, recipient-only mark-read API, and cross-user Inbox E2E coverage.
- [x] Implemented `feat-026-task-doc-assignment-review`.
- [x] Added task assignees, document owners, requested reviewers, review states, return comments, blocked/revision reasons, and assignment/review notifications.
- [x] Added task/document assignment and review controls in the room UI plus E2E coverage for generated artifact handoff.
- [x] Implemented `feat-027-people-directory-light-org`.
- [x] Added member-service active room summaries, protected `/people`, PeopleDirectory member cards, sidebar People navigation, and E2E People coverage.
- [x] Implemented `feat-028-agent-member-aware-context`.
- [x] Added room-scoped Agent collaboration context, assignee/review/blocker suggestion tools, and generated-artifact collaboration summaries in Agent run history.
- [x] Implemented `feat-029-decision-log`.
- [x] Added durable room decisions, human decision creation API, Decisions tab, Agent `create_draft_decision` tool, decision trace metadata, export support, and generated-decision summaries in Agent run history.
- [x] Implemented `feat-030-collaboration-e2e`.
- [x] Added full V2 browser coverage for business, product, engineering, and QA collaboration across login, chat, Inbox, generated drafts, review handoff, return-for-revision, Decision Log, ReviewAgent, and Agents traceability.
- [x] Updated reviewer permissions so QA/reviewer users can execute review Agents while viewer users remain read-only.
- [x] Accepted the create-time member/role selection approach for room creation.
- [x] Added `feat-031-room-creation-membership` design and implementation plan.
- [x] Implemented `feat-031-room-creation-membership`.
- [x] Added usable sidebar project-room creation with room name, description, existing workspace member selection, role selection, and redirect to the created room.
- [x] Added accessible room lists so invited members see created rooms and uninvited non-admin members do not.
- [x] Created default visible Agents for each new room, kept creator membership as `room_lead`, filtered the current user out of the inviteable member list, and rejected service-layer room creation when the creator is not a workspace member.
- [x] Implemented `feat-032-user-manual`.
- [x] Added `docs/USER_MANUAL.md` with user-facing workflows for login, room chat, human mentions, `@Agent` generation, task/document review, Decisions, Agents traceability, Inbox, People, room creation, and export.
- [x] Captured 12 PNG screenshots in `docs/user-manual-assets/` for the manual.
- [x] Linked the user manual from `README.md` and `README.en.md`.

## Verification Evidence

| Check | Command | Result | Notes |
|---|---|---|---|
| README contract | `npm run test -- src/lib/__tests__/readme.test.ts` | Pass | 1 file, 2 tests; covers bilingual runtime-principles wording and rejects old Pi-reuse phrasing. |
| Standard harness | `./init.sh` | Pass | npm install/audit, Prisma generate, lint, 26 test files / 122 tests, and build. npm reported 2 audit vulnerabilities, but the harness completed successfully. |
| README contract | `npm run test -- src/lib/__tests__/readme.test.ts` | Pass | 1 file, 2 tests; covers Chinese and English open source positioning. |
| Targeted baseline repair | `npm run test -- src/components/__tests__/app-shell.test.tsx src/lib/__tests__/member-service.test.ts src/lib/__tests__/readme.test.ts` | Pass | 3 files, 7 tests. |
| Standard harness | `./init.sh` | Pass | npm install/audit, Prisma generate, lint, 26 test files / 122 tests, and build. |
| Seed data | `npm run prisma:seed` | Pass | Deterministic MVP data recreated. |
| Test suite | `npm run test` | Pass | 16 test files, 57 tests after Agent generation plan preview. |
| TypeScript | `npm run lint` | Pass | Runs `next typegen && tsc --noEmit`. |
| Production build | `npm run build` | Pass | Next.js 16.2.7 build completed. |
| Dependency audit | `npm audit --json` | Pass | 0 total vulnerabilities. |
| Browser E2E | `PLAYWRIGHT_REUSE_EXISTING=1 npm run test:e2e` | Pass | 2 Playwright tests across desktop and mobile; covers Settings-menu switching, `@` suggestions, localized generated artifacts, draft edit/reject, token visibility, and traceability UI in no-key faux mode. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | 2 Playwright tests across desktop and mobile; Playwright-managed server forces faux provider mode and covers provider status plus run details. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | Re-run after local room data export; covers Settings export entry visibility. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | Re-run after generation preview; covers preview-before-run and confirm generation. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | Re-run after multi-user mentions; covers `@product` human message without Agent preview and existing `@PMAgent` generation. |
| User manual screenshot links | `node - <<'NODE' ...` | Pass | `feature_list.json` parsed; 12 Markdown screenshot references checked; 12 unique assets found. |
| README contract | `npm run test -- src/lib/__tests__/readme.test.ts` | Pass | Protects the user manual link in both Chinese and English README files. |
| Diff whitespace | `git diff --check` | Pass | No whitespace errors. |
| Standard harness | `./init.sh` | Pass | npm install/audit, Prisma generate, lint, 26 test files / 122 tests, and build. |
| Test suite | `npm run test` | Pass | 21 test files, 78 tests after multi-user mentions. |
| TypeScript | `npm run lint` | Pass | Re-run after multi-user mentions. |
| Production build | `npm run build` | Pass | Re-run after multi-user mentions. |
| Standard harness | `./init.sh` | Pass | Re-run after multi-user mentions; lint, 21 test files / 78 tests, and build passed. |
| Test suite | `npm run test` | Pass | 23 test files, 84 tests after Inbox. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | 4 tests across desktop and mobile; includes cross-user Inbox notification flow. |
| Standard harness | `./init.sh` | Pass | Re-run after Inbox; lint, 23 test files / 84 tests, and build passed. |
| Test suite | `npm run prisma:seed && npm run test` | Pass | 24 test files, 100 tests after task/document assignment review. |
| TypeScript | `npm run lint` | Pass | Re-run after task/document assignment review. |
| Production build | `npm run build` | Pass | Re-run after task/document assignment review. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | 4 tests across desktop and mobile; includes assignment/review handoff controls. |
| Test suite | `npm run prisma:seed && npm run test` | Pass | 25 test files, 103 tests after People directory. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | 4 tests across desktop and mobile; includes opening People from the room. |
| Test suite | `npm run prisma:seed && npm run test` | Pass | 25 test files, 108 tests after member-aware Agent context. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | 4 tests across desktop and mobile after member-aware Agent context. |
| Targeted tests | `npm run test -- src/lib/__tests__/decision-service.test.ts src/lib/__tests__/agent-tools.test.ts src/app/api/__tests__/routes.test.ts src/components/__tests__/room-tabs.test.tsx src/lib/__tests__/room-export.test.ts` | Pass | 5 files, 40 tests after Decision Log. |
| Test suite | `npm run prisma:seed && npm run test` | Pass | 26 test files, 113 tests after Decision Log. |
| TypeScript | `npm run lint` | Pass | Re-run after Decision Log. |
| Production build | `npm run build` | Pass | Re-run after Decision Log. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | 4 tests across desktop and mobile after Decision Log; includes recording a human decision. |
| Standard harness | `./init.sh` | Pass | Re-run after Decision Log; npm install/audit, Prisma generate, lint, 26 test files / 113 tests, and build passed. |
| Targeted tests | `npm run test -- src/lib/__tests__/access-control.test.ts` | Pass | 1 file, 6 tests after reviewer Agent execution permission. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npx playwright test tests/e2e/collaboration.spec.ts --project=chromium --reporter=line` | Pass | New V2 collaboration workflow passed on desktop. |
| Test suite | `npm run prisma:seed && npm run test` | Pass | 26 test files, 114 tests after V2 collaboration E2E. |
| TypeScript | `npm run lint` | Pass | Re-run after V2 collaboration E2E. |
| Production build | `npm run build` | Pass | Re-run after V2 collaboration E2E. |
| Dependency audit | `npm audit --json` | Pass | 0 total vulnerabilities after V2 collaboration E2E. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | 5 passed, 1 skipped; collaboration workflow runs on desktop and is skipped on mobile. |
| Standard harness | `./init.sh` | Pass | Final V2 run passed: npm install/audit, Prisma generate, lint, 26 test files / 114 tests, and build. |
| Targeted tests | `npm run test -- src/lib/__tests__/room-service.test.ts src/app/api/__tests__/routes.test.ts src/components/__tests__/project-room.test.tsx` | Pass | 3 files, 41 tests after room creation implementation. |
| Browser E2E | `PLAYWRIGHT_REUSE_EXISTING=1 PLAYWRIGHT_PORT=3100 npx playwright test tests/e2e/collaboration.spec.ts -g "room creators select members"` | Pass | Desktop room creation membership flow passed; mobile scenario skipped by test design. |
| Test suite | `npm run prisma:seed && npm run test` | Pass | 26 test files, 122 tests after room creation membership. |
| TypeScript | `npm run lint` | Pass | Re-run after room creation membership. |
| Production build | `npm run build` | Pass | Re-run after room creation membership. |
| Browser E2E | `PLAYWRIGHT_PORT=3101 npm run test:e2e` | Pass | 6 passed, 2 skipped; includes full V2 collaboration, room creation membership, project-room workflow, and Inbox flows. |
| Diff hygiene | `git diff --check` | Pass | No whitespace errors. |
| Standard harness | `./init.sh` | Pass | npm install/audit, Prisma generate, lint, 26 test files / 122 tests, and build passed. |
| Standard harness | `./init.sh` | Pass | npm install/audit, Prisma generate, lint, 57 tests, and build passed after generation plan preview. |
| Local HTTP smoke | `curl -I http://127.0.0.1:3100` and `curl -sL http://127.0.0.1:3100` | Pass | Root redirected to the seeded room; room HTML included OpenAI `gpt-5.5` provider status from local `.env`. |
| Pre-plan baseline | `./init.sh` | Pass | Re-run before traceability planning; lint, 29 tests, and build passed. |

## Files Changed

- `AGENTS.md`
- `README.md`
- `README.en.md`
- `init.sh`
- `feature_list.json`
- `progress.md`
- `session-handoff.md`
- `clean-state-checklist.md`
- `quality-document.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/RELIABILITY.md`
- `docs/superpowers/specs/2026-06-07-feidingwei-mvp-design.md`
- `docs/superpowers/plans/2026-06-07-feidingwei-mvp-implementation.md`
- `docs/superpowers/plans/2026-06-07-bilingual-ui-and-readme.md`
- `package.json`
- `package-lock.json`
- `.npmrc`
- `.env.example`
- `.gitignore`
- `next.config.ts`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `tsconfig.json`
- `vitest.config.ts`
- `playwright.config.ts`
- `prisma/**`
- `src/**`
- `tests/e2e/project-room.spec.ts`
- `tests/e2e/collaboration.spec.ts`
- `src/app/api/rooms/route.ts`

## Decisions Made

- FeiDingWei v0 is the first runnable MVP, not a throwaway prototype.
- v0 includes workspace shell, project room, chat, tasks, docs, default agents, agent run history, and human approval.
- v0 is currently a pure Web application.
- Companies should treat v0 as private-deployment-first.
- v0 does not require a model API key by default because it uses deterministic Pi faux provider runs.
- UI defaults to Chinese and offers language switching inside the Settings menu.
- `ProjectRoom` owns locale state for the whole page.
- Known seed/demo/faux content is localized; arbitrary user-authored text is not translated automatically.
- `README.md` is Chinese; `README.en.md` is English.
- Reuse Pi for agent runtime, tool calling, and provider infrastructure.
- Use Pi faux provider defaults for deterministic local tests and demos.
- Canonical agent mention tokens remain English command tokens: `@PMAgent`, `@DocAgent`, and `@ReviewAgent`.
- Localized agent names are displayed beside those command tokens for discoverability.
- Vitest file parallelism is disabled because DB tests share the same SQLite seed state.
- `feat-015-agent-run-traceability` used existing `sourceMessageId` and `sourceRunId`; no Prisma migration was required.
- Draft edit/reject is complete; do not mix real provider config and local data management into the same implementation.
- Stale approve/edit/reject attempts against non-draft artifacts return 409 instead of a no-op success.
- Real provider config is complete; default no-key mode remains faux, while `FEIDINGWEI_LLM_PROVIDER="openai"` plus `OPENAI_API_KEY` selects OpenAI `gpt-5.5` through Pi.
- API keys must remain server-side environment variables and must not be persisted into Agent run errors.
- Automated tests must force deterministic faux provider behavior even if local `.env` is configured for OpenAI.
- Agents tab now shows no-secret provider/model status and expandable run details.
- Local data management starts with export-only room JSON. Reset/import remain intentionally out of scope for this feature because they can destroy or mutate local data.
- Mentioned agents now show a generation plan preview and require confirmation before execution; plain messages still send directly.
- Requested reviewers now own normal task/document approval; room leads and workspace admins can override.
- Return-for-revision comments are persisted and shown as blocked/revision reasons on artifact cards.
- People is a read-only lightweight directory scoped to the current workspace; it does not manage users or roles.
- Agents can suggest assignees/review handoffs and summarize blockers from room context, but still cannot approve artifacts or mutate permissions.
- Human-recorded decisions are active records; Agent-created decisions remain draft records linked to source message/run context.
- Reviewer/QA room members can execute review Agents; viewer room members remain read-only.
- Use harness-style feature tracking and evidence-based completion.
- Keep the MVP single-workspace and seeded; auth and broader enterprise modules are next-iteration work.
- Room creation currently selects existing workspace members at creation time; external invitations, editing room members after creation, and enterprise org management remain out of scope.

## Blockers / Risks

- No active blocker remains for the local MVP.
- Real OpenAI provider configuration is wired but not automatically exercised in CI/E2E because it requires a human-provided API key and external network access.
- Language preference is not persisted across sessions yet.
- Playwright emits Node `DEP0205` and `NO_COLOR`/`FORCE_COLOR` warnings under the current toolchain. Tests pass despite those warnings.
- Chrome DevTools browser smoke could not open during this session because the browser profile was already locked; Playwright E2E covered the user workflow.
- Draft edit/reject is implemented and verified; generated artifacts can now be edited, approved, or rejected while preserving traceability.
- Chrome DevTools MCP smoke is still blocked by a locked local browser profile in this environment; Playwright desktop/mobile E2E and HTTP smoke covered the changed UI path.

## Next Session Startup

1. Read `AGENTS.md`.
2. Run `npm install` if dependencies are missing.
3. Run `npm run prisma:seed`.
4. For no-key validation, keep `FEIDINGWEI_LLM_PROVIDER="faux"` or leave it unset.
5. For real OpenAI validation, set `FEIDINGWEI_LLM_PROVIDER="openai"`, `OPENAI_API_KEY`, and optionally `FEIDINGWEI_LLM_MODEL`; the Agents tab should show `OpenAI · gpt-5.5` or the configured model.
6. Run `npm run dev -- --hostname 127.0.0.1 --port 3100`.
7. Open `http://127.0.0.1:3100`.
8. Use Settings -> `导出房间数据` / `Export room data` to download the current project room JSON.
9. Send an `@PMAgent` message and confirm the generation plan before checking generated drafts.
10. In Tasks or Docs, assign the generated draft to a member, request review from QA, and confirm the assignee/reviewer/review status updates.
11. Open People from the sidebar and confirm members show role, function, team, and active room context.
12. Open Decisions and record a room decision.
13. As QA, trigger `@ReviewAgent` and confirm the generated review artifact appears.
14. Open Agents and confirm generated artifact summaries include assignee/owner, reviewer, review status, generated decisions when present, and both PM/Review trigger messages.
15. As Business, click `新建项目房间`, create a room with Product as contributor and QA as reviewer, then confirm Product can enter and Engineer cannot see or direct-open the room.

## Recommended Next Step

- Review `docs/USER_MANUAL.md`; after acceptance, choose the next tracked feature without expanding into external invitations, enterprise org management, SSO, OA, CRM, or full IM.
