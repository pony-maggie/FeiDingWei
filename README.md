# 飞钉微 FeiDingWei

Open source agent-native workspace for teams.

飞钉微不是再造一个飞书、钉钉或企业微信。它是一个让人和 AI Agent 在同一个项目空间里协作的开源办公平台。

In FeiDingWei, agents are not hidden assistants. They are visible project collaborators that can summarize discussions, draft documents, create task lists, review blockers, and keep work moving.

## MVP

The first version implements an Agent Project Room:

- Workspace shell.
- Project room.
- Chat.
- Tasks.
- Docs.
- Default agents.
- Agent run history.
- Human approval for generated artifacts.

The core flow is:

```text
Room chat -> @PMAgent -> draft tasks/docs -> human approval -> visible run history
```

## Agent Runtime

FeiDingWei uses Pi for generic agent infrastructure:

- `@earendil-works/pi-ai` for model/provider primitives, tool-call message types, and deterministic faux local runs.
- `@earendil-works/pi-agent-core` for stateful agent execution and tool calling.

The v0 app defaults to a faux Pi model, so the project room works without an external API key. Future versions can wire the same runtime to OpenAI, Anthropic, Gemini, local OpenAI-compatible APIs, or enterprise providers.

## Requirements

- Node.js 22.19 or newer.
- npm.

## Development

Install dependencies:

```bash
npm install
```

Create and seed the local database:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

The Playwright E2E suite uses `http://127.0.0.1:3100` to avoid colliding with other local services.

## Verification

Run unit and component tests:

```bash
npm run test
```

Run type checking:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Run browser E2E:

```bash
npm run test:e2e
```

Run the standard harness entrypoint:

```bash
./init.sh
```

## Iteration Management

Development is tracked through:

- `feature_list.json`: source of truth for feature status.
- `progress.md`: session progress log.
- `session-handoff.md`: restart instructions.
- `clean-state-checklist.md`: checks before commit/session end.
- `quality-document.md`: milestone quality assessment.

Work on one feature at a time and record verification evidence before marking a feature as `pass`.
