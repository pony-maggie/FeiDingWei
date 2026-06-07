# FeiDingWei MVP Design

## 1. Product Positioning

FeiDingWei is an open source agent-native workspace for teams.

The first version is not a full replacement for Feishu, DingTalk, or WeCom. It is a focused project collaboration space where humans and AI agents work in the same room.

Chinese positioning:

> 飞钉微是一个开源的 Agent First 团队协同平台。
> 第一版先做让人和 AI Agent 在同一个项目空间里协作的工作间。

English positioning:

> Open source agent-native workspace for teams.
> Built for humans and AI agents to work in the same project room.

The product should use Feishu, DingTalk, and WeCom as market references, but it should not copy their full office-suite surface area. The wedge is that agents are first-class collaborators rather than chat add-ons.

## 2. Target Users

The first target users are:

- AI startup teams.
- Software engineering teams.
- Product and design teams working closely with engineering.
- Open source project maintainers.
- Small technical teams that want private deployment and customizable AI workflows.

These users already understand chat, docs, tasks, GitHub, and AI tools. They do not need a complete enterprise OA system on day one. They need a workspace where discussion turns into structured work.

## 3. Core User Journey

The core first-version journey is:

1. A user creates a workspace.
2. The user creates a project room.
3. Team members discuss work in the project room.
4. A user mentions an agent in the conversation.
5. The agent reads the relevant context and produces a structured output.
6. The output becomes a task list, document, summary, or status review.
7. Humans review, edit, assign, and complete the work.
8. The room keeps the conversation, agent runs, tasks, and documents connected.

Example interactions:

```text
@PMAgent summarize the discussion and create this week's tasks.
@DocAgent turn the last 50 messages into a PRD draft.
@ReviewAgent check which tasks are blocked and explain why.
@StandupAgent prepare a daily update from project activity.
```

The product promise is simple: a project room should not only preserve discussion; it should help convert discussion into work.

## 4. MVP Feature Scope

### Workspace

The workspace is the top-level team container.

Required first-version capabilities:

- Create a workspace.
- Invite or add members.
- Show member list.
- Show project list.
- Provide basic roles: owner, member, agent.

The first version does not need complex enterprise organization trees, departments, HR records, or cross-company federation.

### Project Room

The project room is the core product surface.

Each project room contains:

- Chat.
- Tasks.
- Docs.
- Agents.
- Agent run history.

The project room is the context boundary for agents. Agents should operate against room-scoped messages, tasks, docs, and files unless explicitly granted broader access later.

### Chat

Chat is the main interaction surface, but it is not positioned as a generic IM replacement.

Required first-version capabilities:

- Room messages.
- Mentions for people and agents.
- Thread or reply support if simple to include.
- Agent-generated messages.
- Links from messages to generated tasks or docs.

Chat should be designed as a work command surface. Users should feel comfortable asking agents to summarize, extract, generate, review, and update structured artifacts.

### Tasks

Tasks are the first structured work object.

Required first-version capabilities:

- Create, edit, assign, and complete tasks.
- Task status: todo, in progress, blocked, done.
- Task priority: low, medium, high.
- Link tasks to source chat messages.
- Allow agents to generate draft tasks from discussion.
- Require human confirmation before agent-generated tasks become active, unless the workspace later enables automation.

Tasks are not intended to replace a full issue tracker in the MVP. They are the room's lightweight work memory.

### Docs

Docs are the second structured work object.

Required first-version capabilities:

- Create and edit project documents.
- Store meeting notes, PRDs, decisions, and summaries.
- Allow agents to draft docs from chat context.
- Link docs back to source messages and agent runs.

The MVP does not need to compete with mature collaborative document editors. A simple document editor is enough if it supports agent-created drafts and human revision.

### Agents

Agents are first-class members of a project room.

Required first-version capabilities:

- Show agents in the room member list.
- Give each agent a name, role, description, and avatar or visual identity.
- Mention agents in chat.
- Show agent run status: queued, running, completed, failed.
- Show agent run history with input context, output, and created artifacts.
- Support at least three default agents:
  - PM Agent: summarizes discussions, creates tasks, drafts PRDs.
  - Doc Agent: writes meeting notes, specs, and summaries.
  - Review Agent: reviews tasks, finds blockers, and prepares status updates.

Agents should not behave like hidden background automation. Their work should be visible, inspectable, and attributable.

## 5. Non-Goals

The MVP explicitly does not include:

- Time tracking.
- Attendance.
- Expense reimbursement.
- Complex approval workflows.
- CRM.
- Customer group operations.
- WeChat integration.
- Full enterprise org management.
- Enterprise SSO.
- Compliance-grade audit logging.
- Full replacement for Slack, Feishu, DingTalk, or WeCom.
- Full replacement for Notion, Linear, Jira, or Google Docs.

These are valid future directions, but they should not enter the first version unless they directly support the agent-native project room.

## 6. Data Model

The MVP should be designed around these core entities:

- User: a human account.
- Workspace: a team container.
- Membership: a user's role in a workspace.
- ProjectRoom: the core collaboration space.
- RoomMember: a human or agent in a project room.
- Message: a chat message in a room.
- Task: a structured work item.
- Document: a project document.
- Agent: a configured AI collaborator.
- AgentRun: one execution of an agent.
- ArtifactLink: a relationship between messages, tasks, docs, and agent runs.

Important relationships:

- A workspace has many project rooms.
- A project room has many messages, tasks, documents, and agents.
- A message may mention users or agents.
- An agent run belongs to one project room and one agent.
- An agent run can create or update tasks and documents.
- Tasks and documents can link back to source messages and agent runs.

This structure keeps agent work explainable. Users should be able to answer: why does this task exist, which agent created it, and what context was used?

## 7. Agent Model

Agents should operate as role-based collaborators.

Each agent has:

- Name.
- Role.
- Description.
- Capabilities.
- Prompt or instruction profile.
- Enabled tools.
- Project room access scope.

The MVP should favor a small number of reliable agents over a large agent marketplace.

Default agents:

- PM Agent:
  - Summarize discussions.
  - Draft PRDs.
  - Extract action items.
  - Create draft task lists.
- Doc Agent:
  - Generate meeting notes.
  - Turn discussions into structured docs.
  - Rewrite rough notes into readable documents.
- Review Agent:
  - Inspect tasks for blockers.
  - Summarize project status.
  - Identify missing owners, unclear scope, and stale tasks.

Agent safety rules:

- Agents create drafts by default.
- Humans approve task activation and important document updates.
- Agent outputs should include source links when possible.
- Agent runs should be visible in the project room history.
- Failed runs should show a useful error state instead of silently disappearing.

## 8. UI Structure

The first screen after login should be the work surface, not a marketing page.

Recommended app structure:

- Left sidebar:
  - Workspace switcher.
  - Project room list.
  - Create room action.
- Main area:
  - Current project room.
  - Default tab: Chat.
  - Additional tabs: Tasks, Docs, Agents, Activity.
- Right panel:
  - Room context.
  - Active agents.
  - Selected task, doc, or agent run details.

Room tabs:

- Chat: discussion and agent commands.
- Tasks: structured work board or list.
- Docs: room documents.
- Agents: configured agents and their capabilities.
- Activity: agent runs and artifact history.

The UI should feel like a serious work tool for technical teams. It should be dense enough for repeated daily use, with clear hierarchy and restrained visual styling.

## 9. Technical Architecture

The architecture should keep the product easy to understand and self-host.

Recommended high-level architecture:

- Web app frontend.
- Backend API.
- Database for users, workspaces, rooms, messages, tasks, docs, agents, and runs.
- Agent execution service or worker.
- LLM provider abstraction.
- Optional integration layer for future GitHub, Linear, Jira, Slack, Feishu, or DingTalk connectors.

Important boundaries:

- The chat system should not directly own task or document generation logic.
- Agent execution should be represented as explicit AgentRun records.
- Agent tools should use stable internal APIs to create draft tasks and docs.
- LLM providers should be abstracted so the project can support OpenAI-compatible APIs, local models, and enterprise providers.
- Project room context retrieval should be isolated from the agent prompt construction layer.

The architecture should make private deployment credible from the beginning.

## 10. Success Criteria

The MVP succeeds if an early team can use it for a real project and say:

- We can discuss project work in one room.
- We can ask agents to summarize and structure the discussion.
- We can turn chat into tasks and docs without leaving the room.
- We can see what agents did and why.
- We can self-host or control our data.

The MVP fails if it feels like:

- A generic chat app with an AI bot bolted on.
- A weak clone of Feishu, DingTalk, or WeCom.
- A scattered office suite with no sharp first use case.
- A demo that cannot support a real team's daily project work.

## 11. Roadmap

### Phase 1: Agent Project Room

- Workspace.
- Project rooms.
- Chat.
- Tasks.
- Docs.
- Default agents.
- Agent run history.
- Human approval for generated artifacts.

### Phase 2: Integrations

- GitHub integration.
- Linear or Jira import.
- Slack or Feishu message import.
- Webhook-based automation.
- External document import.

### Phase 3: Workflow Automation

- Reusable agent workflows.
- Scheduled standups.
- Automatic blocker detection.
- Project status reports.
- Approval-lite flows for technical teams.

### Phase 4: Enterprise Expansion

- Organization structure.
- Role-based access control.
- SSO.
- Audit logs.
- Compliance controls.
- Private model and enterprise LLM configuration.

### Phase 5: Broader Office Platform

- OA modules.
- Rich approval flows.
- CRM-adjacent workflows.
- Customer operations.
- Broader knowledge management.

These later phases should only be pursued after the project room wedge proves useful.

## 12. Recommended README Opening

```md
# 飞钉微 FeiDingWei

Open source agent-native workspace for teams.

飞钉微不是再造一个飞书、钉钉或企业微信。
它是一个让人和 AI Agent 在同一个项目空间里协作的开源办公平台。

In FeiDingWei, agents are not hidden assistants.
They are visible project collaborators that can summarize discussions,
draft documents, create task lists, review blockers, and keep work moving.
```

## 13. Product Decision

The first product decision is to avoid building a general office suite.

The first version should be:

> Open source Linear + Slack + Notion for project rooms, with AI agents as visible team members.

This gives FeiDingWei a clear wedge, a realistic MVP, and a product identity that is meaningfully different from Feishu, DingTalk, and WeCom.
