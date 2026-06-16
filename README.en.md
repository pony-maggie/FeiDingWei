# FeiDingWei

Open source agent-native workspace for teams.

FeiDingWei has a direct long-term target: benchmark against Feishu, DingTalk, and WeCom, the three closed-source giants of team collaboration software, but rebuild the category as open source, privately deployable, and agent-centered.

It does not start by copying IM, OA, approvals, or enterprise management suites. It starts by moving the center of team work from "humans organizing humans" to "agents organizing work, while humans own goals, judgment, approval, and responsibility." In FeiDingWei, humans are not the default center of the interface; agents are first-class collaborators and execution units, and every agent output must stay traceable, reviewable, and open to human approval or rejection.

The current version lands that direction in one runnable Agent Project Room: humans and AI agents collaborate in the same project space, discuss work, summarize context, create draft tasks, create draft documents, request reviews, record decisions, and keep visible agent run history.

中文版本: [README.md](README.md)

User manual (Chinese, with screenshots): [docs/USER_MANUAL.md](docs/USER_MANUAL.md)

## Deployment

Private deployment first:

- Companies can deploy FeiDingWei on internal servers, private cloud, Kubernetes, Docker, or an internal PaaS.
- Project messages, tasks, documents, and agent run history are stored in company-controlled infrastructure by default.
- The current sample uses SQLite for local development and MVP demos; production deployment should move to PostgreSQL or an existing company database platform.
- Model traffic can go through an internal OpenAI-compatible gateway, private model service, or external providers such as OpenAI, Anthropic, and Gemini.

## Model API Keys

v0 does not require a model API key by default.

The default configuration uses a faux provider for deterministic local runs, so `@PMAgent` can create test draft tasks and documents without any external model service. This keeps the first version focused on validating the product loop and engineering structure.

To test real model calls, enable the OpenAI provider in `.env`:

```env
FEIDINGWEI_LLM_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
FEIDINGWEI_LLM_MODEL="gpt-5.5"
```

With the real provider enabled, agents still run through the same underlying runtime chain, generated content still enters tasks/docs as drafts, and humans still edit, approve, or reject those drafts. The API key is read only from server-side environment variables and is not shown in the UI or written into agent run records.

Future provider extensions can add:

- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- Internal OpenAI-compatible endpoint

## Agent Runtime

FeiDingWei's Agent Runtime does not treat an agent as a hidden background chatbot. It breaks every agent action into an execution chain that can be recorded, reviewed, and replayed:

- A user mentions a visible agent in a room message, and the frontend shows a generation plan before anything runs.
- After confirmation, the server persists the trigger message and creates an `AgentRun` record whose status moves from `running` to `completed` or `failed`.
- The runtime assembles the room context, current members, roles, tasks, docs, reviews, blockers, and recent decisions into the agent input.
- The model layer only decides what to say and which tools to call; the product layer exposes controlled tools such as creating draft tasks, draft documents, and draft decisions.
- Tool calls run sequentially, and every generated artifact starts as `draft`; an agent cannot directly create active tasks, active documents, or active decisions.
- Each generated artifact stores its source message and source agent run, so users can trace it from Tasks, Docs, Decisions, and the Agents page.
- Without a real model key, the runtime uses a deterministic faux provider to exercise the same chain for local development, tests, and demos.

This boundary matters: model/provider selection, tool-call messages, and stateful execution are runtime concerns; rooms, messages, permissions, tasks, docs, approvals, decisions, visible run history, and Web UI are FeiDingWei product concerns.

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

Seed data creates these local demo login users:

- `founder@feidingwei.local`
- `business@feidingwei.local`
- `product@feidingwei.local`
- `engineer@feidingwei.local`
- `qa@feidingwei.local`

The current V2 collaboration iteration uses local demo login first. It does not include passwords,
enterprise SSO, or external identity providers yet.

The Playwright E2E suite uses `http://127.0.0.1:3100` to avoid colliding with the local dev server.
