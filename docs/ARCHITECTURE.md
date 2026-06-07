# Architecture

## Overview

FeiDingWei is planned as a Next.js App Router application with a Prisma SQLite database and Pi-backed agent runtime.

The architecture has two distinct layers:

- FeiDingWei product layer: workspaces, project rooms, chat, tasks, docs, approvals, run persistence, and Web UI.
- Pi infrastructure layer: stateful agent execution, tool calling, model/provider abstraction, faux local runs, and future real LLM provider integration.

## Planned Tech Stack

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Prisma.
- SQLite for MVP persistence.
- `@earendil-works/pi-ai`.
- `@earendil-works/pi-agent-core`.
- Vitest.
- React Testing Library.
- Playwright.

## Core Data Entities

- User.
- Workspace.
- Membership.
- ProjectRoom.
- Message.
- Task.
- Document.
- Agent.
- AgentRun.

## Agent Flow

1. User sends a room message.
2. API persists the human message.
3. Domain logic checks whether the message mentions a configured agent.
4. If no agent is mentioned, the flow ends.
5. If an agent is mentioned, an `AgentRun` is created with status `running`.
6. FeiDingWei creates room-scoped Pi tools:
   - `create_draft_task`.
   - `create_draft_document`.
7. Pi agent runtime executes the agent with room context and tools.
8. Tool calls persist draft tasks or documents.
9. FeiDingWei persists an agent message and updates `AgentRun` to `completed` or `failed`.
10. UI refreshes chat, tasks, docs, and activity.

## File Boundaries

Planned boundaries:

- `src/lib/domain.ts`: schemas, constants, and domain types.
- `src/lib/db.ts`: Prisma client singleton.
- `src/lib/room-service.ts`: room loading and artifact approval.
- `src/lib/agent-tools.ts`: FeiDingWei tools exposed to Pi.
- `src/lib/pi-runtime.ts`: Pi model and agent construction.
- `src/lib/agent-service.ts`: message persistence and agent run orchestration.
- `src/components/*`: UI components.
- `src/app/api/*`: API routes.

## Architecture Rules

- Chat UI does not create tasks or docs directly.
- Agent tools create draft artifacts only.
- Humans approve generated artifacts.
- Agent run records are explicit and queryable.
- LLM/provider choices stay behind Pi runtime adapter boundaries.
- Room context is scoped to the current project room in the MVP.
