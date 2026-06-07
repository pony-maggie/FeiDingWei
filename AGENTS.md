# AGENTS.md

This file is the operating manual for agentic development in FeiDingWei.

## Project Purpose

FeiDingWei is an open source agent-native workspace for teams.

The current product goal is a runnable MVP project room where humans can chat, mention visible AI agents, generate draft tasks and documents, approve generated artifacts, and inspect agent run history.

## Startup Workflow

Before writing code:

1. Confirm the working directory with `pwd`.
2. Read this file completely.
3. Read `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and `docs/RELIABILITY.md`.
4. Read `feature_list.json` to find the current feature state.
5. Read `progress.md` and `session-handoff.md` for continuity.
6. Run `./init.sh` once the app scaffold exists.
7. Review recent commits with `git log --oneline -5` when this directory is a Git repository.

If baseline verification is failing, repair that first before adding new scope.

## Working Rules

- Work on exactly one feature from `feature_list.json` at a time.
- Do not change the feature scope to hide unfinished work.
- Keep FeiDingWei's product layer separate from Pi's agent infrastructure.
- Use Pi for generic agent runtime and LLM/provider behavior.
- Implement FeiDingWei-owned behavior in workspace, room, chat, tasks, docs, approvals, run persistence, and Web UI.
- Do not add OA, CRM, attendance, expense, WeChat integration, SSO, or enterprise org features in the MVP.
- Do not claim completion without verification evidence.
- Before ending a session, update `progress.md`, `feature_list.json`, and `session-handoff.md` if work state changed.

## Required Artifacts

- `feature_list.json`: source of truth for feature status.
- `progress.md`: session continuity log.
- `session-handoff.md`: restart instructions for the next session.
- `init.sh`: standard setup and verification path.
- `clean-state-checklist.md`: checks before commit and session end.
- `quality-document.md`: milestone quality assessment.
- `docs/PRODUCT.md`: product scope and user-facing behavior.
- `docs/ARCHITECTURE.md`: system boundaries and data flow.
- `docs/RELIABILITY.md`: verification, safety, and observability expectations.

## Definition of Done

A feature is done only when all of these are true:

- Target behavior is implemented.
- Required tests, build checks, or manual verification actually ran.
- Evidence is recorded in `feature_list.json` or `progress.md`.
- Any changed docs are updated.
- The repository remains restartable from `./init.sh`.
- Agent-generated artifacts remain traceable to source messages and agent runs.

## Verification Commands

Before the app scaffold exists:

```bash
find . -maxdepth 3 -type f | sort
```

After the app scaffold exists:

```bash
./init.sh
```

Expected MVP checks:

```bash
npm run test
npm run build
npm run test:e2e
```

## End Of Session

Before ending a session:

1. Update `progress.md` with current state and verification evidence.
2. Update `feature_list.json` statuses and evidence.
3. Update `session-handoff.md` with the recommended next step.
4. Run the relevant verification commands.
5. Check `clean-state-checklist.md`.
6. Commit only when the state is safe to resume.

## Escalation

Ask for human review when:

- Product scope would expand beyond the MVP boundary.
- A dependency choice changes the Pi-based architecture.
- Verification fails repeatedly for the same reason.
- A feature requires security, privacy, or enterprise compliance decisions.
- Requirements conflict with `docs/PRODUCT.md` or `feature_list.json`.
