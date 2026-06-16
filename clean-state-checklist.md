# Clean State Checklist

Run this checklist before committing and at the end of each session.

## Scope

- [ ] Exactly one feature from `feature_list.json` is active.
- [ ] No MVP non-goals were added: OA, CRM, attendance, expense, WeChat integration, SSO, enterprise org depth.
- [ ] Changes match the current feature's dependencies and evidence requirements.

## Build

- [ ] `./init.sh` completes successfully.
- [ ] `npm run test` passes after the app scaffold exists.
- [ ] `npm run build` passes after the app scaffold exists.
- [ ] `npm run test:e2e` passes for user-facing MVP workflow when available.

## Architecture

- [ ] FeiDingWei product logic remains separate from Pi runtime adapter code.
- [ ] Pi generic infrastructure stays in `src/lib/pi-runtime.ts` and `src/lib/agent-tools.ts`.
- [ ] Workspace, room, task, doc, approval, and persistence behavior remains FeiDingWei-owned.
- [ ] Agent-generated tasks and docs link back to source messages and agent runs.
- [ ] Generated artifacts default to `draft`, not `active`.
- [ ] LLM provider choices remain behind `src/lib/llm-config.ts` and `src/lib/pi-runtime.ts`.
- [ ] Provider API keys are read from server-side env only and are not persisted.

## Runtime

- [ ] The app starts without errors.
- [ ] Anonymous users land on the local demo login page.
- [ ] A seeded demo user can log in and log out.
- [ ] The user lands in the seeded Agent Project Room.
- [ ] A user can create a project room from the sidebar with selected existing workspace members and roles.
- [ ] Created rooms show in invited members' sidebars and stay hidden from uninvited non-admin members.
- [ ] Created rooms include the default visible Agents.
- [ ] Chat can send a plain human message.
- [ ] `@product` or another room-member mention sends as a normal human message and creates a notification.
- [ ] Mentioned users can open Inbox, see unread notifications, and mark them read.
- [ ] People directory opens from the sidebar and shows workspace members, roles, functions, teams, and active rooms.
- [ ] `@PMAgent` shows a generation plan before running.
- [ ] A QA/reviewer user can trigger `@ReviewAgent`; a viewer user still cannot mutate room work.
- [ ] Confirming the generation plan creates draft tasks and a draft PRD.
- [ ] Tasks can be approved from draft to active.
- [ ] Draft tasks and docs can be edited before approval.
- [ ] Draft tasks can be assigned to a room member and sent to a requested reviewer.
- [ ] Draft docs can be assigned to an owner and sent to a requested reviewer.
- [ ] Returned tasks and docs show reviewer comments and visible blocked/revision reasons.
- [ ] Draft tasks and docs can be rejected without becoming active.
- [ ] Docs show generated draft content.
- [ ] Agents tab shows default agents and completed run history.
- [ ] Agents tab shows current provider/model status and expandable run details.
- [ ] Agents tab generated artifact summaries show assignee/owner, reviewer, and review state when present.
- [ ] Settings can export the current project room JSON without including `.env` secrets.
- [ ] Decisions tab can record a human decision and show creator/status context.
- [ ] Decision trace blocks show source message and Agent run context when available.
- [ ] Agents tab generated artifact summaries include generated decisions when an Agent creates one.
- [ ] No-key mode still uses deterministic faux provider behavior.
- [ ] OpenAI mode can be enabled with `FEIDINGWEI_LLM_PROVIDER="openai"` and `OPENAI_API_KEY`.

## Data Integrity

- [ ] Prisma migrations run from a clean checkout.
- [ ] Seed data creates one workspace, one project room, default agents, sample messages, one task, and one doc.
- [ ] No orphaned tasks or docs exist without a room.
- [ ] Agent run status uses only `queued`, `running`, `completed`, or `failed`.
- [ ] Task status uses only `todo`, `in_progress`, `blocked`, or `done`.
- [ ] Artifact status uses only `draft`, `active`, or `rejected`.
- [ ] Decision status uses only `draft`, `active`, or `rejected`.

## Repository

- [ ] `feature_list.json` reflects actual feature status.
- [ ] `progress.md` includes current state and verification evidence.
- [ ] `session-handoff.md` gives a clear next step.
- [ ] No generated database files are staged unless intentionally required.
- [ ] No credentials, `.env` secrets, API keys, or tokens are staged.
- [ ] No unrelated files were changed.

## Quality

- [ ] `quality-document.md` is updated after milestone completion.
- [ ] README/runbook reflects the shipped behavior.
- [ ] Any architectural decision that changes the plan is documented.
