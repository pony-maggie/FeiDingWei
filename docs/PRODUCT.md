# Product

## Positioning

FeiDingWei is an open source agent-native workspace for teams.

The MVP is an Agent Project Room where humans and visible AI agents collaborate in the same project space. It is not a full replacement for Feishu, DingTalk, WeCom, Slack, Notion, Linear, or Jira.

## Target Users

- AI startup teams.
- Software engineering teams.
- Product and design teams working with engineering.
- Open source project maintainers.
- Small technical teams that want private deployment and customizable agent workflows.

## MVP User Journey

1. A user enters a workspace.
2. The user opens a project room.
3. Team members discuss work in room chat.
4. A user mentions an agent, such as `@PMAgent`.
5. The room shows a generation plan before the agent runs.
6. After human confirmation, the agent uses room context and tools to create draft tasks or documents.
7. Humans review and approve generated artifacts.
8. Agent run history shows what happened and why.

## MVP Feature Scope

- Workspace shell.
- Project room.
- Local demo login and logout.
- Chat.
- Tasks.
- Docs.
- Default agents.
- Agent run history.
- Human approval for generated artifacts.

## V2 Collaboration Direction

V1 has been accepted as the first runnable project room. V2 upgrades the room from
a single-user demo into a multi-user Agent collaboration workspace. The first V2
steps add local demo authentication, workspace membership, room permissions,
human `@user` mentions, a personal Inbox, and task/document assignment review
flows. Seeded users can sign in, app pages are protected by a persisted session,
room actions are guarded by role, chat can mention room members while preserving
Agent mention previews, mentioned users can review unread/read notifications
from the Inbox, and draft tasks/documents can be assigned, sent to a reviewer,
approved by the requested reviewer, or returned with a visible revision reason.
The People directory shows workspace members with role, function, team, and
active room context. Users can create a new project room from the sidebar by
entering a room name and description, selecting existing workspace members, and
assigning room roles; the creator is always the room lead and every created room
starts with the default visible Agents. Agents now receive room member,
function, assignment, review, and blocker context so they can suggest assignees,
suggest review handoffs, and summarize blockers without approving artifacts.
Decision Log adds durable room decisions that humans can record directly and
Agents can create as drafts, with trace links back to source messages and Agent
runs. The V2 browser acceptance path now covers business, product, engineering,
and QA moving work through chat, Inbox, generated drafts, review handoff,
return-for-revision, decision recording, room creation with selected members,
and Agent run traceability.

## Non-Goals

- Attendance.
- Expense reimbursement.
- Complex approval workflows.
- CRM.
- Customer group operations.
- WeChat integration.
- Full enterprise org management.
- Enterprise SSO.
- Full IM replacement.
- Full collaborative document editor replacement.

## Product Success Criteria

The MVP succeeds when an early technical team can use one room to:

- Discuss project work.
- Ask agents to summarize and structure the discussion.
- Generate draft tasks and docs.
- Approve generated work.
- Inspect agent run history.
- Self-host or control project data.
