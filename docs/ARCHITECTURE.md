# Architecture

## Overview

FeiDingWei is planned as a Next.js App Router application with a Prisma SQLite database and Pi-backed agent runtime.

The architecture has two distinct layers:

- FeiDingWei product layer: workspaces, project rooms, chat, tasks, docs, approvals, run persistence, and Web UI.
- Pi infrastructure layer: stateful agent execution, tool calling, model/provider abstraction, faux local runs, and optional real OpenAI provider execution.

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
- Session.
- Workspace.
- Membership.
- ProjectRoom.
- Message.
- Notification.
- Task.
- TaskComment.
- Document.
- DocumentComment.
- Decision.
- Agent.
- AgentRun.

## Agent Flow

1. User enters a room message.
2. Chat UI suggests current room members for human `@user` mentions and visible room agents for Agent mentions.
3. Chat UI checks whether the message mentions a visible room agent and, if it does, shows a generation plan preview.
4. Human `@user` mentions send as plain messages and do not open an Agent generation plan.
5. After human confirmation for Agent mentions, or immediately for plain/human-mention messages, the message is sent to the API.
6. The API persists the message with the authenticated user as author.
7. Mention service creates `Notification` records for mentioned room members.
8. Domain logic checks whether the message mentions a configured agent.
9. If no agent is mentioned, the flow ends.
10. If an agent is mentioned, an `AgentRun` is created with status `running`.
11. FeiDingWei creates room-scoped Pi tools:
   - `create_draft_task`.
   - `create_draft_document`.
   - `create_draft_decision`.
12. Pi agent runtime executes the agent with room context and tools. By default it uses deterministic faux responses; when `FEIDINGWEI_LLM_PROVIDER="openai"` and `OPENAI_API_KEY` are configured, it uses the configured OpenAI model through Pi.
13. Tool calls persist draft tasks or documents.
14. FeiDingWei persists an agent message and updates `AgentRun` to `completed` or `failed`.
15. UI refreshes chat, tasks, docs, and activity.
16. The Agents tab shows the current provider/model mode and expandable run records with input, output, error, trigger message, and generated artifact summaries.

## Decision Log Flow

1. `/api/rooms/[roomId]/decisions` requires a valid session and room message permission.
2. Human-created decisions are stored as `active` `Decision` records with the authenticated user as creator.
3. Agent-created decisions are stored as `draft` records through the `create_draft_decision` Pi tool.
4. Decisions can link to a source message and source Agent run so the UI and room export can show provenance.
5. The Decisions tab lists room decisions newest first with creator/status context and trace blocks.
6. Agent run history shows generated decisions alongside generated tasks and documents.

## Notification Flow

1. Message creation calls mention service after the human message is persisted.
2. Mention service creates unread `Notification` records for mentioned room members.
3. `/inbox` loads the current authenticated user's notifications through `notification-service`.
4. Inbox groups notifications into unread and read sections and links each item back to its room.
5. `POST /api/notifications/[notificationId]/read` marks a notification as read only when the current user is the recipient.

## Assignment And Review Flow

1. Draft tasks can be assigned to a room member through `POST /api/tasks/[taskId]/assign`.
2. Draft documents can be assigned to an owner through `POST /api/docs/[docId]/assign`.
3. Tasks and documents can request a specific reviewer through their `/review` routes.
4. Assignment and review requests create unread notifications for the assignee, owner, or reviewer.
5. If a draft has a requested reviewer, approval is limited to that reviewer unless a room lead or workspace admin overrides.
6. Reviewer returns create task/document comments, set `reviewStatus` to `changes_requested`, store the comment as `blockedReason`, and notify the assigned human when one exists.

## Room Permission Flow

1. Workspace owners/admins can read and mutate room work even without a room membership.
2. `room_lead`, `contributor`, `reviewer`, and `viewer` can read the room.
3. `room_lead`, `contributor`, and `reviewer` can send room messages.
4. `room_lead`, `contributor`, and `reviewer` can execute visible room Agents; this allows QA/reviewer users to invoke review Agents during the collaboration workflow.
5. `room_lead` and `reviewer` can approve or return artifacts, while requested-review approval still enforces the selected reviewer unless a lead/admin overrides.
6. `viewer` is read-only.

## Room Creation Flow

1. The project room sidebar lists rooms accessible to the current user.
2. The new-room form posts to `/api/rooms` with a name, description, and selected existing workspace members plus room roles.
3. The API requires a valid session and resolves the creator's workspace membership before creating a room.
4. `room-service` creates the `ProjectRoom`, creator `room_lead` membership, selected `RoomMembership` records, and the default visible Agents in one transaction.
5. Users who are not selected do not see the room in their accessible room list and direct room navigation falls through the room access guard.
6. Room creation does not invite external users, edit workspace membership, or manage enterprise org structure.

## People Directory Flow

1. `/people` requires a valid session and uses the current workspace from the seeded room.
2. `member-service` lists workspace memberships for that workspace only.
3. Each member summary includes name, email, workspace role, function label, team, and room memberships scoped to the same workspace.
4. `PeopleDirectory` renders lightweight org context for collaboration; it does not invite users, edit roles, or manage enterprise org state.

## Member-Aware Agent Context

1. Agent orchestration builds a room-scoped collaboration context before running Pi.
2. The context includes current user, room members, room roles, function labels, teams, pending review requests, assignees/owners, reviewers, and visible blockers.
3. The context is appended to the Agent system prompt through `createRoomAgent`.
4. V2 collaboration tools can suggest assignees, suggest review requests, and summarize blockers. These tools do not approve artifacts or mutate permissions.
5. Agent run history continues to show generated artifacts, now including assignee/owner, reviewer, and review status summaries when available.

## Authentication Flow

V2 starts with local demo authentication. `Session` records persist login state
for seeded users. The login route creates an HTTP-only `feidingwei_session`
cookie, protected app pages resolve the current user from that session, and the
logout route deletes the session. This is intentionally not enterprise SSO or
password authentication yet; it creates the product boundary required for later
workspace membership, room permissions, and user-scoped collaboration.

## File Boundaries

Planned boundaries:

- `src/lib/domain.ts`: schemas, constants, and domain types.
- `src/lib/db.ts`: Prisma client singleton.
- `src/lib/auth-service.ts`: session creation, lookup, and deletion.
- `src/lib/member-service.ts`: workspace member summaries, team context, and active room memberships for People.
- `src/lib/room-service.ts`: room loading and artifact approval.
- `src/lib/decision-service.ts`: durable human decisions, Agent draft decisions, and decision trace metadata.
- `src/lib/review-service.ts`: task/document assignment, requested review, approval, revision return, comments, and review notifications.
- `src/lib/mention-service.ts`: human mention parsing and notification fanout.
- `src/lib/notification-service.ts`: notification creation, Inbox listing, and read-state mutation.
- `src/lib/agent-tools.ts`: FeiDingWei tools exposed to Pi.
- `src/lib/llm-config.ts`: server-side model provider selection and no-key fallback.
- `src/lib/pi-runtime.ts`: Pi model and agent construction.
- `src/lib/agent-service.ts`: message persistence, member-aware context building, and agent run orchestration.
- `src/components/*`: UI components.
- `src/app/api/*`: API routes.

## Architecture Rules

- Chat UI does not create tasks or docs directly.
- Agent tools create draft artifacts only.
- Humans approve generated artifacts.
- Agent run records are explicit and queryable.
- LLM/provider choices stay behind Pi runtime adapter boundaries.
- Model API keys stay in server-side environment variables and are not persisted into FeiDingWei data records.
- Room context is scoped to the current project room in the MVP.
