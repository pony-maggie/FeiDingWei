# FeiDingWei

Open source agent-native workspace for teams.

FeiDingWei is not trying to clone Feishu, DingTalk, or WeCom. The first version focuses on one project space where humans and AI agents collaborate together: discuss work, summarize context, create draft tasks, create draft documents, require human approval, and keep visible agent run history.

中文版本: [README.md](README.md)

## Current Shape

The current v0 is a pure Web application:

- Next.js Web App.
- Prisma + SQLite local database.
- Pi agent runtime.
- Browser-based project room.

There is no desktop app, mobile app, or enterprise IM client integration yet. Future versions can extend the same Web/API foundation with mobile, desktop, enterprise identity, notifications, and IM integrations.

## Deployment

Private deployment first:

- Companies can deploy FeiDingWei on internal servers, private cloud, Kubernetes, Docker, or an internal PaaS.
- Project messages, tasks, documents, and agent run history are stored in company-controlled infrastructure by default.
- The current sample uses SQLite for local development and MVP demos; production deployment should move to PostgreSQL or an existing company database platform.
- Model traffic can go through an internal OpenAI-compatible gateway, private model service, or external providers such as OpenAI, Anthropic, and Gemini.

## Model API Keys

v0 does not require a model API key by default.

The current implementation uses Pi's faux provider for deterministic local runs, so `@PMAgent` can create test draft tasks and documents without any external model service. This keeps the first version focused on validating the product loop and engineering structure.

When real models are added, provider configuration can be wired through the existing Pi runtime adapter, for example:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- Internal OpenAI-compatible endpoint

## MVP Features

The first version implements an Agent Project Room:

- Workspace shell.
- Project room.
- Chat.
- Tasks.
- Docs.
- Default agents.
- Agent run history.
- Human approval for generated artifacts.
- Chinese and English UI switching.

The core flow is:

```text
Room chat -> @PMAgent -> draft tasks/docs -> human approval -> visible run history
```

## Agent Runtime

FeiDingWei uses Pi for generic agent infrastructure:

- `@earendil-works/pi-ai` for model/provider primitives, tool-call message types, and deterministic faux local runs.
- `@earendil-works/pi-agent-core` for stateful agent execution and tool calling.

FeiDingWei owns the product layer: project rooms, messages, tasks, docs, approval flows, run history, and Web UI.

## Requirements

- Node.js 22.19 or newer.
- npm.

## Development

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Default `.env` content:

```env
DATABASE_URL="file:./dev.db"
```

Generate Prisma Client, create the database, and seed local data:

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

The Playwright E2E suite uses `http://127.0.0.1:3100` to avoid colliding with the local dev server.

## Verification

Run unit, service, API, and component tests:

```bash
npm run test
```

Run TypeScript checking:

```bash
npm run lint
```

Run a production build:

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
