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

## Runtime

- [ ] The app starts without errors.
- [ ] The user lands in the seeded Agent Project Room.
- [ ] Chat can send a plain human message.
- [ ] `@PMAgent` creates draft tasks and a draft PRD.
- [ ] Tasks can be approved from draft to active.
- [ ] Docs show generated draft content.
- [ ] Agents tab shows default agents and completed run history.

## Data Integrity

- [ ] Prisma migrations run from a clean checkout.
- [ ] Seed data creates one workspace, one project room, default agents, sample messages, one task, and one doc.
- [ ] No orphaned tasks or docs exist without a room.
- [ ] Agent run status uses only `queued`, `running`, `completed`, or `failed`.
- [ ] Task status uses only `todo`, `in_progress`, `blocked`, or `done`.
- [ ] Artifact status uses only `draft` or `active`.

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
