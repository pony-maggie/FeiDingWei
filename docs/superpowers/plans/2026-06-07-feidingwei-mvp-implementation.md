# FeiDingWei MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable v0 of FeiDingWei: an agent-native project room where humans can chat, mention agents, generate draft tasks/docs, and inspect agent run history.

**Architecture:** Create a fresh Next.js application with a Prisma SQLite database and a focused domain layer for workspaces, project rooms, messages, tasks, documents, agents, and agent runs. Agent execution uses `@earendil-works/pi-agent-core` for stateful runs and tool execution, plus `@earendil-works/pi-ai` for multi-provider LLM access, with FeiDingWei-specific tools that create draft tasks and docs.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite, Zod, Vitest, React Testing Library, Playwright, lucide-react, `@earendil-works/pi-ai`, `@earendil-works/pi-agent-core`.

---

## Scope

This plan implements Phase 1 from the approved design spec:

- Workspace shell.
- Project rooms.
- Chat.
- Tasks.
- Docs.
- Default agents.
- Agent run history.
- Human approval for generated artifacts.

This plan intentionally excludes attendance, expense reimbursement, CRM, WeChat integration, enterprise SSO, advanced approvals, external integrations, and multi-tenant billing.

## Open Source Reuse Decision

Reuse `earendil-works/pi` for the generic agent infrastructure:

- `@earendil-works/pi-ai`: model/provider abstraction, faux provider for deterministic local runs, streaming primitives, tool-call message types, and future multi-provider support.
- `@earendil-works/pi-agent-core`: stateful agent execution, tool validation, tool execution lifecycle, run events, and future streaming UI support.

Do not copy Pi's terminal coding-agent product shape into FeiDingWei. FeiDingWei owns the product layer:

- Workspaces.
- Project rooms.
- Room-scoped chat.
- Tasks.
- Docs.
- Human approval.
- Agent run persistence.
- Web collaboration UI.

Borrow `pi-chat` conceptually for room-scoped agent sessions, memory, skills, history, and attachments. Do not implement Discord, Telegram, sandbox VM control, or remote terminal workflows in this MVP.

## File Structure

Create these top-level files and directories:

- `package.json`: scripts and dependencies.
- `.npmrc`: exact dependency save behavior.
- `next.config.ts`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.
- `postcss.config.mjs`: PostCSS configuration.
- `tailwind.config.ts`: Tailwind configuration.
- `vitest.config.ts`: unit test configuration.
- `playwright.config.ts`: browser test configuration.
- `prisma/schema.prisma`: database schema.
- `prisma/seed.ts`: seed workspace, room, users, agents, messages, tasks, and docs.
- `src/app/layout.tsx`: root layout.
- `src/app/page.tsx`: redirect to the default project room.
- `src/app/rooms/[roomId]/page.tsx`: main project room screen.
- `src/app/globals.css`: global styles.
- `src/components/app-shell.tsx`: workspace and room layout.
- `src/components/chat-panel.tsx`: chat UI and agent command form.
- `src/components/tasks-panel.tsx`: task list and human approval controls.
- `src/components/docs-panel.tsx`: document list and draft approval controls.
- `src/components/agents-panel.tsx`: agent cards and run history.
- `src/components/room-tabs.tsx`: tab state and panel composition.
- `src/lib/db.ts`: Prisma client singleton.
- `src/lib/domain.ts`: Zod schemas, TypeScript domain types, and constants.
- `src/lib/room-service.ts`: room loading and artifact mutation functions.
- `src/lib/agent-tools.ts`: Pi agent tools for creating draft tasks and docs.
- `src/lib/pi-runtime.ts`: Pi model selection, faux test model setup, and room agent factory.
- `src/lib/agent-service.ts`: message persistence and Pi-backed agent run orchestration.
- `src/app/api/rooms/[roomId]/messages/route.ts`: create human messages and trigger agents.
- `src/app/api/tasks/[taskId]/approve/route.ts`: approve draft tasks.
- `src/app/api/docs/[docId]/approve/route.ts`: approve draft docs.
- `src/test/setup.ts`: Testing Library setup.
- `src/lib/__tests__/agent-service.test.ts`: Pi-backed agent behavior tests.
- `src/lib/__tests__/agent-tools.test.ts`: room artifact tool tests.
- `src/lib/__tests__/room-service.test.ts`: room mutation tests.
- `src/components/__tests__/room-tabs.test.tsx`: UI tab tests.
- `tests/e2e/project-room.spec.ts`: end-to-end project room flow.

## Task 1: Initialize The Application

**Files:**
- Create: `package.json`
- Create: `.npmrc`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "feidingwei",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "engines": {
    "node": ">=22.19.0"
  },
  "dependencies": {
    "@earendil-works/pi-agent-core": "0.78.1",
    "@earendil-works/pi-ai": "0.78.1",
    "@prisma/client": "5.22.0",
    "clsx": "2.1.1",
    "lucide-react": "0.468.0",
    "next": "16.2.7",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "zod": "3.24.1"
  },
  "devDependencies": {
    "@playwright/test": "1.60.0",
    "@testing-library/jest-dom": "6.6.3",
    "@testing-library/react": "16.1.0",
    "@testing-library/user-event": "14.5.2",
    "@types/node": "22.10.2",
    "@types/react": "18.2.79",
    "@types/react-dom": "18.2.25",
    "autoprefixer": "10.4.20",
    "eslint": "9.17.0",
    "eslint-config-next": "15.0.0",
    "jsdom": "25.0.1",
    "postcss": "8.5.10",
    "prisma": "5.22.0",
    "tailwindcss": "3.4.17",
    "tsx": "4.22.4",
    "typescript": "5.7.2",
    "vitest": "4.1.8"
  },
  "overrides": {
    "esbuild": "0.25.12",
    "postcss": "8.5.10"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 2: Create configuration files**

`.npmrc`:

```ini
save-exact=true
```

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

`tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        paper: "#F8FAFC",
        line: "#D9E2EC",
        accent: "#1D7A8C",
        success: "#237A4B",
        warning: "#A65F00",
        danger: "#B42318"
      }
    }
  },
  plugins: []
};

export default config;
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"]
  }
});
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
```

`src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Create base layout and styles**

`src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  background: #f8fafc;
  color: #17202a;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f8fafc;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  letter-spacing: 0;
}

button,
input,
textarea {
  font: inherit;
}
```

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeiDingWei",
  description: "Open source agent-native workspace for teams"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and dependencies install without errors.

- [ ] **Step 5: Run initial verification**

Run:

```bash
npm run test
```

Expected: Vitest reports no test files or zero passing tests without TypeScript configuration errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .npmrc next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts vitest.config.ts playwright.config.ts src
git commit -m "chore: initialize feidingwei app"
```

If the directory is not a Git repository, run `git init` first, then repeat the commit command.

## Task 2: Add Domain Types And Constants

**Files:**
- Create: `src/lib/domain.ts`
- Create: `src/lib/__tests__/domain.test.ts`

- [ ] **Step 1: Write failing domain tests**

`src/lib/__tests__/domain.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  agentRunStatusSchema,
  defaultAgents,
  messageInputSchema,
  taskStatusSchema
} from "../domain";

describe("domain schemas", () => {
  it("accepts valid task statuses", () => {
    expect(taskStatusSchema.parse("todo")).toBe("todo");
    expect(taskStatusSchema.parse("in_progress")).toBe("in_progress");
    expect(taskStatusSchema.parse("blocked")).toBe("blocked");
    expect(taskStatusSchema.parse("done")).toBe("done");
  });

  it("rejects empty messages", () => {
    expect(() => messageInputSchema.parse({ body: "" })).toThrow();
  });

  it("defines the required default agents", () => {
    expect(defaultAgents.map((agent) => agent.slug)).toEqual([
      "pm-agent",
      "doc-agent",
      "review-agent"
    ]);
  });

  it("accepts agent run lifecycle states", () => {
    expect(agentRunStatusSchema.options).toEqual([
      "queued",
      "running",
      "completed",
      "failed"
    ]);
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test -- src/lib/__tests__/domain.test.ts
```

Expected: FAIL because `src/lib/domain.ts` does not exist.

- [ ] **Step 3: Add domain types and schemas**

`src/lib/domain.ts`:

```ts
import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "blocked", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);
export const agentRunStatusSchema = z.enum(["queued", "running", "completed", "failed"]);
export const artifactStatusSchema = z.enum(["draft", "active"]);

export const messageInputSchema = z.object({
  body: z.string().trim().min(1, "Message is required")
});

export const agentMentionSchema = z.object({
  slug: z.string().min(1),
  displayName: z.string().min(1)
});

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type AgentRunStatus = z.infer<typeof agentRunStatusSchema>;
export type ArtifactStatus = z.infer<typeof artifactStatusSchema>;

export type DefaultAgent = {
  slug: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
};

export const defaultAgents: DefaultAgent[] = [
  {
    slug: "pm-agent",
    name: "PM Agent",
    role: "Product manager",
    description: "Summarizes discussions, drafts PRDs, and creates draft task lists.",
    capabilities: ["summarize_discussion", "draft_prd", "create_tasks"]
  },
  {
    slug: "doc-agent",
    name: "Doc Agent",
    role: "Documentation partner",
    description: "Turns rough discussion into readable notes, specs, and summaries.",
    capabilities: ["write_notes", "write_spec", "rewrite_summary"]
  },
  {
    slug: "review-agent",
    name: "Review Agent",
    role: "Project reviewer",
    description: "Finds blockers, missing owners, unclear scope, and stale tasks.",
    capabilities: ["review_tasks", "find_blockers", "prepare_status"]
  }
];

export function extractAgentSlug(body: string): string | null {
  const mention = body.match(/@(PMAgent|DocAgent|ReviewAgent)\b/i)?.[1]?.toLowerCase();

  if (!mention) {
    return null;
  }

  const aliases: Record<string, string> = {
    pmagent: "pm-agent",
    docagent: "doc-agent",
    reviewagent: "review-agent"
  };

  return aliases[mention] ?? null;
}
```

- [ ] **Step 4: Run the test**

Run:

```bash
npm run test -- src/lib/__tests__/domain.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain.ts src/lib/__tests__/domain.test.ts
git commit -m "feat: add workspace domain model"
```

## Task 3: Add Database Schema And Seed Data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Add Prisma schema**

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id          String       @id @default(cuid())
  name        String
  email       String       @unique
  memberships Membership[]
  messages    Message[]
  tasks       Task[]       @relation("TaskAssignee")
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Workspace {
  id          String       @id @default(cuid())
  name        String
  memberships Membership[]
  rooms       ProjectRoom[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Membership {
  id          String    @id @default(cuid())
  role        String
  userId      String
  workspaceId String
  user        User      @relation(fields: [userId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([userId, workspaceId])
}

model ProjectRoom {
  id          String      @id @default(cuid())
  name        String
  description String
  workspaceId String
  workspace   Workspace   @relation(fields: [workspaceId], references: [id])
  messages    Message[]
  tasks       Task[]
  documents   Document[]
  agents      Agent[]
  agentRuns   AgentRun[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Message {
  id        String      @id @default(cuid())
  body      String
  authorId  String?
  agentId   String?
  roomId    String
  author    User?       @relation(fields: [authorId], references: [id])
  agent     Agent?      @relation(fields: [agentId], references: [id])
  room      ProjectRoom @relation(fields: [roomId], references: [id])
  createdAt DateTime    @default(now())
}

model Task {
  id              String      @id @default(cuid())
  title           String
  description     String
  status          String
  priority        String
  artifactStatus  String
  assigneeId      String?
  sourceMessageId String?
  sourceRunId     String?
  roomId          String
  assignee        User?       @relation("TaskAssignee", fields: [assigneeId], references: [id])
  room            ProjectRoom @relation(fields: [roomId], references: [id])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Document {
  id              String      @id @default(cuid())
  title           String
  body            String
  artifactStatus  String
  sourceMessageId String?
  sourceRunId     String?
  roomId          String
  room            ProjectRoom @relation(fields: [roomId], references: [id])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Agent {
  id           String      @id @default(cuid())
  slug         String
  name         String
  role         String
  description  String
  capabilities String
  roomId       String
  room         ProjectRoom @relation(fields: [roomId], references: [id])
  messages     Message[]
  runs         AgentRun[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@unique([slug, roomId])
}

model AgentRun {
  id              String      @id @default(cuid())
  status          String
  input           String
  output          String
  error           String?
  agentId         String
  roomId          String
  sourceMessageId String?
  agent           Agent       @relation(fields: [agentId], references: [id])
  room            ProjectRoom @relation(fields: [roomId], references: [id])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

- [ ] **Step 2: Add Prisma client singleton**

`src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Add seed data**

`prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import { defaultAgents } from "../src/lib/domain";

const prisma = new PrismaClient();

async function main() {
  await prisma.agentRun.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.document.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.projectRoom.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Founder",
      email: "founder@feidingwei.local"
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "FeiDingWei Labs",
      memberships: {
        create: {
          role: "owner",
          userId: user.id
        }
      }
    }
  });

  const room = await prisma.projectRoom.create({
    data: {
      name: "Agent Project Room",
      description: "Humans and AI agents turn discussion into project artifacts.",
      workspaceId: workspace.id
    }
  });

  await prisma.agent.createMany({
    data: defaultAgents.map((agent) => ({
      slug: agent.slug,
      name: agent.name,
      role: agent.role,
      description: agent.description,
      capabilities: JSON.stringify(agent.capabilities),
      roomId: room.id
    }))
  });

  await prisma.message.createMany({
    data: [
      {
        body: "We need the first version to prove that chat can become tasks and docs.",
        authorId: user.id,
        roomId: room.id
      },
      {
        body: "@PMAgent summarize the launch discussion and create draft tasks.",
        authorId: user.id,
        roomId: room.id
      }
    ]
  });

  await prisma.task.create({
    data: {
      title: "Define the Agent Project Room MVP",
      description: "Capture the first product scope and non-goals.",
      status: "done",
      priority: "high",
      artifactStatus: "active",
      assigneeId: user.id,
      roomId: room.id
    }
  });

  await prisma.document.create({
    data: {
      title: "MVP Positioning",
      body: "FeiDingWei is an open source agent-native workspace for teams.",
      artifactStatus: "active",
      roomId: room.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 4: Create `.env`**

Create `.env`:

```bash
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 5: Generate and migrate**

Run:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Expected: Prisma generates the client, creates `prisma/dev.db`, and inserts one seeded workspace with one room.

- [ ] **Step 6: Commit**

```bash
git add .env prisma src/lib/db.ts
git commit -m "feat: add persistent workspace schema"
```

## Task 4: Add Room Service

**Files:**
- Create: `src/lib/room-service.ts`
- Create: `src/lib/__tests__/room-service.test.ts`

- [ ] **Step 1: Write service tests**

`src/lib/__tests__/room-service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildRoomViewModel, summarizeDraftCounts } from "../room-service";

describe("room service pure helpers", () => {
  it("sorts room artifacts for display", () => {
    const view = buildRoomViewModel({
      id: "room-1",
      name: "Launch Room",
      description: "A room",
      messages: [
        { id: "m2", body: "second", createdAt: new Date("2026-01-02"), author: null, agent: null },
        { id: "m1", body: "first", createdAt: new Date("2026-01-01"), author: null, agent: null }
      ],
      tasks: [],
      documents: [],
      agents: [],
      agentRuns: []
    });

    expect(view.messages.map((message) => message.id)).toEqual(["m1", "m2"]);
  });

  it("counts draft tasks and docs", () => {
    expect(
      summarizeDraftCounts({
        tasks: [{ artifactStatus: "draft" }, { artifactStatus: "active" }],
        documents: [{ artifactStatus: "draft" }, { artifactStatus: "draft" }]
      })
    ).toEqual({ draftTasks: 1, draftDocs: 2 });
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test -- src/lib/__tests__/room-service.test.ts
```

Expected: FAIL because `src/lib/room-service.ts` does not exist.

- [ ] **Step 3: Add room service**

`src/lib/room-service.ts`:

```ts
import { prisma } from "./db";

type SortableMessage = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string } | null;
  agent: { name: string } | null;
};

type RoomInput = {
  id: string;
  name: string;
  description: string;
  messages: SortableMessage[];
  tasks: { artifactStatus: string }[];
  documents: { artifactStatus: string }[];
  agents: unknown[];
  agentRuns: unknown[];
};

export function buildRoomViewModel<T extends RoomInput>(room: T): T {
  return {
    ...room,
    messages: [...room.messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  };
}

export function summarizeDraftCounts(input: {
  tasks: { artifactStatus: string }[];
  documents: { artifactStatus: string }[];
}) {
  return {
    draftTasks: input.tasks.filter((task) => task.artifactStatus === "draft").length,
    draftDocs: input.documents.filter((doc) => doc.artifactStatus === "draft").length
  };
}

export async function getDefaultRoomId() {
  const room = await prisma.projectRoom.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true }
  });

  return room?.id ?? null;
}

export async function getProjectRoom(roomId: string) {
  const room = await prisma.projectRoom.findUnique({
    where: { id: roomId },
    include: {
      workspace: true,
      messages: {
        include: {
          author: { select: { name: true } },
          agent: { select: { name: true } }
        }
      },
      tasks: {
        include: {
          assignee: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      documents: {
        orderBy: { createdAt: "desc" }
      },
      agents: {
        orderBy: { name: "asc" }
      },
      agentRuns: {
        include: {
          agent: { select: { name: true, slug: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return room ? buildRoomViewModel(room) : null;
}

export async function approveTask(taskId: string) {
  return prisma.task.update({
    where: { id: taskId },
    data: { artifactStatus: "active" }
  });
}

export async function approveDocument(documentId: string) {
  return prisma.document.update({
    where: { id: documentId },
    data: { artifactStatus: "active" }
  });
}
```

- [ ] **Step 4: Run the test**

Run:

```bash
npm run test -- src/lib/__tests__/room-service.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/room-service.ts src/lib/__tests__/room-service.test.ts
git commit -m "feat: add project room service"
```

## Task 5: Add Pi-Backed Agent Runtime

**Files:**
- Create: `src/lib/agent-tools.ts`
- Create: `src/lib/pi-runtime.ts`
- Create: `src/lib/agent-service.ts`
- Create: `src/lib/__tests__/agent-tools.test.ts`
- Create: `src/lib/__tests__/agent-service.test.ts`

- [ ] **Step 1: Write room artifact tool tests**

`src/lib/__tests__/agent-tools.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildRoomArtifactTools } from "../agent-tools";

describe("room artifact tools", () => {
  it("creates draft tasks through an injected handler", async () => {
    const tools = buildRoomArtifactTools({
      createDraftTask: async (input) => ({ id: "task-1", title: input.title }),
      createDraftDocument: async () => ({ id: "doc-1", title: "Unused" })
    });

    const createTask = tools.find((tool) => tool.name === "create_draft_task");
    expect(createTask).toBeDefined();

    const result = await createTask!.execute("tool-1", {
      title: "Clarify MVP",
      description: "Define what the first room must prove.",
      priority: "high"
    });

    expect(result.content[0]).toEqual({
      type: "text",
      text: "Draft task created: Clarify MVP"
    });
    expect(result.details).toEqual({ id: "task-1", title: "Clarify MVP" });
  });

  it("creates draft documents through an injected handler", async () => {
    const tools = buildRoomArtifactTools({
      createDraftTask: async () => ({ id: "task-1", title: "Unused" }),
      createDraftDocument: async (input) => ({ id: "doc-1", title: input.title })
    });

    const createDocument = tools.find((tool) => tool.name === "create_draft_document");
    expect(createDocument).toBeDefined();

    const result = await createDocument!.execute("tool-2", {
      title: "PRD Draft",
      body: "# PRD Draft\n\nTurn discussion into project work."
    });

    expect(result.content[0]).toEqual({
      type: "text",
      text: "Draft document created: PRD Draft"
    });
    expect(result.details).toEqual({ id: "doc-1", title: "PRD Draft" });
  });
});
```

- [ ] **Step 2: Write Pi runtime tests**

`src/lib/__tests__/agent-service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { extractAssistantText } from "../agent-service";
import { createDefaultFauxResponses } from "../pi-runtime";

describe("pi-backed agent service helpers", () => {
  it("creates default faux responses with tool calls for PM Agent", () => {
    const responses = createDefaultFauxResponses("pm-agent");

    expect(responses).toHaveLength(2);
    const first = responses[0];
    expect(first.content.filter((block) => block.type === "toolCall")).toHaveLength(4);
  });

  it("creates default faux responses with a document tool for Doc Agent", () => {
    const responses = createDefaultFauxResponses("doc-agent");
    const first = responses[0];

    expect(first.content.filter((block) => block.type === "toolCall")).toHaveLength(1);
  });

  it("extracts assistant text from Pi agent messages", () => {
    const text = extractAssistantText([
      { role: "user", content: "hello" },
      {
        role: "assistant",
        content: [
          { type: "text", text: "Agent completed the run." },
          { type: "toolCall", id: "tool-1", name: "create_draft_task", arguments: {} }
        ]
      }
    ]);

    expect(text).toBe("Agent completed the run.");
  });
});
```

- [ ] **Step 3: Run the failing tests**

Run:

```bash
npm run test -- src/lib/__tests__/agent-tools.test.ts src/lib/__tests__/agent-service.test.ts
```

Expected: FAIL because `src/lib/agent-tools.ts`, `src/lib/pi-runtime.ts`, and `src/lib/agent-service.ts` do not exist.

- [ ] **Step 4: Add Pi room artifact tools**

`src/lib/agent-tools.ts`:

```ts
import type { AgentTool } from "@earendil-works/pi-agent-core";
import { Type, type Static } from "@earendil-works/pi-ai";

const CreateDraftTaskParameters = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.String({ minLength: 1 }),
  priority: Type.Union([Type.Literal("low"), Type.Literal("medium"), Type.Literal("high")])
});

const CreateDraftDocumentParameters = Type.Object({
  title: Type.String({ minLength: 1 }),
  body: Type.String({ minLength: 1 })
});

type CreateDraftTaskInput = Static<typeof CreateDraftTaskParameters>;
type CreateDraftDocumentInput = Static<typeof CreateDraftDocumentParameters>;

export type RoomArtifactToolHandlers = {
  createDraftTask(input: CreateDraftTaskInput): Promise<{ id: string; title: string }>;
  createDraftDocument(input: CreateDraftDocumentInput): Promise<{ id: string; title: string }>;
};

export function buildRoomArtifactTools(handlers: RoomArtifactToolHandlers): AgentTool[] {
  return [
    {
      name: "create_draft_task",
      label: "Create draft task",
      description: "Create a draft task in the current project room for human approval.",
      parameters: CreateDraftTaskParameters,
      executionMode: "sequential",
      execute: async (_toolCallId, params) => {
        const task = await handlers.createDraftTask(params);

        return {
          content: [{ type: "text", text: `Draft task created: ${task.title}` }],
          details: task
        };
      }
    },
    {
      name: "create_draft_document",
      label: "Create draft document",
      description: "Create a draft project document in the current project room for human editing.",
      parameters: CreateDraftDocumentParameters,
      executionMode: "sequential",
      execute: async (_toolCallId, params) => {
        const document = await handlers.createDraftDocument(params);

        return {
          content: [{ type: "text", text: `Draft document created: ${document.title}` }],
          details: document
        };
      }
    }
  ];
}
```

- [ ] **Step 5: Add Pi runtime adapter**

`src/lib/pi-runtime.ts`:

```ts
import { Agent } from "@earendil-works/pi-agent-core";
import type { AgentTool } from "@earendil-works/pi-agent-core";
import {
  fauxAssistantMessage,
  fauxToolCall,
  registerFauxProvider
} from "@earendil-works/pi-ai";
import type { AssistantMessage } from "@earendil-works/pi-ai";

export function createDefaultFauxResponses(agentSlug: string): AssistantMessage[] {
  if (agentSlug === "pm-agent") {
    return [
      fauxAssistantMessage([
        fauxToolCall(
          "create_draft_task",
          {
            title: "Clarify MVP success criteria",
            description: "Confirm what a real team must accomplish in the project room.",
            priority: "high"
          },
          { id: "pm-task-1" }
        ),
        fauxToolCall(
          "create_draft_task",
          {
            title: "Review generated task drafts",
            description: "Approve, edit, or reject the tasks proposed by the agent.",
            priority: "medium"
          },
          { id: "pm-task-2" }
        ),
        fauxToolCall(
          "create_draft_task",
          {
            title: "Prepare demo project room",
            description: "Use the seeded room to show chat, tasks, docs, and agent runs together.",
            priority: "medium"
          },
          { id: "pm-task-3" }
        ),
        fauxToolCall(
          "create_draft_document",
          {
            title: "PRD Draft",
            body:
              "# PRD Draft\n\n## Product Direction\nTurn room discussion into structured project work."
          },
          { id: "pm-doc-1" }
        )
      ]),
      fauxAssistantMessage("PM Agent created draft tasks and a short PRD outline for human review.")
    ];
  }

  if (agentSlug === "doc-agent") {
    return [
      fauxAssistantMessage([
        fauxToolCall(
          "create_draft_document",
          {
            title: "Discussion Notes",
            body: "# Discussion Notes\n\nThe project room should turn discussion into durable work artifacts."
          },
          { id: "doc-doc-1" }
        )
      ]),
      fauxAssistantMessage("Doc Agent created draft discussion notes for human editing.")
    ];
  }

  return [
    fauxAssistantMessage([
      fauxToolCall(
        "create_draft_document",
        {
          title: "Project Review",
          body:
            "# Project Review\n\n- Check for unclear owners.\n- Check for stale or blocked tasks.\n- Confirm generated drafts have been reviewed."
        },
        { id: "review-doc-1" }
      )
    ]),
    fauxAssistantMessage("Review Agent created a project review with likely blockers and missing decisions.")
  ];
}

export function createRoomAgent(input: {
  agentSlug: string;
  agentName: string;
  roomName: string;
  tools: AgentTool[];
}) {
  const faux = registerFauxProvider({
    provider: "feidingwei-faux",
    tokenSize: { min: 12, max: 24 }
  });
  faux.setResponses(createDefaultFauxResponses(input.agentSlug));

  return new Agent({
    initialState: {
      systemPrompt: [
        `You are ${input.agentName}, a visible AI collaborator in the ${input.roomName} project room.`,
        "Create draft tasks and documents only through tools.",
        "Do not mark generated artifacts active. Humans approve drafts."
      ].join("\n"),
      model: faux.getModel(),
      thinkingLevel: "off",
      tools: input.tools
    },
    toolExecution: "sequential"
  });
}
```

- [ ] **Step 6: Add Pi-backed agent service**

`src/lib/agent-service.ts`:

```ts
import { buildRoomArtifactTools } from "./agent-tools";
import { prisma } from "./db";
import { extractAgentSlug } from "./domain";
import { createRoomAgent } from "./pi-runtime";

export function extractAssistantText(messages: Array<{ role: string; content: unknown }>) {
  const assistant = [...messages].reverse().find((message) => message.role === "assistant");

  if (!assistant || !Array.isArray(assistant.content)) {
    return "";
  }

  return assistant.content
    .filter((block): block is { type: "text"; text: string } => {
      return (
        typeof block === "object" &&
        block !== null &&
        "type" in block &&
        (block as { type: unknown }).type === "text" &&
        "text" in block &&
        typeof (block as { text: unknown }).text === "string"
      );
    })
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export async function createMessageAndMaybeRunAgent(input: {
  roomId: string;
  body: string;
}) {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

  if (!user) {
    throw new Error("Seed user is required before creating messages.");
  }

  const message = await prisma.message.create({
    data: {
      body: input.body,
      roomId: input.roomId,
      authorId: user.id
    }
  });

  const agentSlug = extractAgentSlug(input.body);

  if (!agentSlug) {
    return { message, agentRun: null };
  }

  const roomAgentConfig = await prisma.agent.findUnique({
    where: {
      slug_roomId: {
        slug: agentSlug,
        roomId: input.roomId
      }
    },
    include: {
      room: { select: { name: true } }
    }
  });

  if (!roomAgentConfig) {
    throw new Error(`Agent ${agentSlug} is not configured for this room.`);
  }

  const startedRun = await prisma.agentRun.create({
    data: {
      status: "running",
      input: input.body,
      output: "",
      agentId: roomAgentConfig.id,
      roomId: input.roomId,
      sourceMessageId: message.id
    }
  });

  const tools = buildRoomArtifactTools({
    createDraftTask: async (task) => {
      const created = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: "todo",
          artifactStatus: "draft",
          roomId: input.roomId,
          sourceMessageId: message.id,
          sourceRunId: startedRun.id
        },
        select: { id: true, title: true }
      });

      return created;
    },
    createDraftDocument: async (document) => {
      const created = await prisma.document.create({
        data: {
          title: document.title,
          body: document.body,
          artifactStatus: "draft",
          roomId: input.roomId,
          sourceMessageId: message.id,
          sourceRunId: startedRun.id
        },
        select: { id: true, title: true }
      });

      return created;
    }
  });

  const roomAgent = createRoomAgent({
    agentSlug,
    agentName: roomAgentConfig.name,
    roomName: roomAgentConfig.room.name,
    tools
  });

  try {
    await roomAgent.prompt(input.body);
    const output =
      extractAssistantText(roomAgent.state.messages) ||
      `${roomAgentConfig.name} completed the run.`;

    await prisma.message.create({
      data: {
        body: output,
        roomId: input.roomId,
        agentId: roomAgentConfig.id
      }
    });

    const agentRun = await prisma.agentRun.update({
      where: { id: startedRun.id },
      data: {
        status: "completed",
        output
      }
    });

    return { message, agentRun };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Agent run failed.";
    const agentRun = await prisma.agentRun.update({
      where: { id: startedRun.id },
      data: {
        status: "failed",
        error: errorMessage,
        output: ""
      }
    });

    return { message, agentRun };
  }
}
```

- [ ] **Step 7: Run tests**

Run:

```bash
npm run test -- src/lib/__tests__/agent-tools.test.ts src/lib/__tests__/agent-service.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/agent-tools.ts src/lib/pi-runtime.ts src/lib/agent-service.ts src/lib/__tests__/agent-tools.test.ts src/lib/__tests__/agent-service.test.ts
git commit -m "feat: add pi-backed agent runtime"
```

## Task 6: Add API Routes

**Files:**
- Create: `src/app/api/rooms/[roomId]/messages/route.ts`
- Create: `src/app/api/tasks/[taskId]/approve/route.ts`
- Create: `src/app/api/docs/[docId]/approve/route.ts`

- [ ] **Step 1: Add message API route**

`src/app/api/rooms/[roomId]/messages/route.ts`:

```ts
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createMessageAndMaybeRunAgent } from "@/lib/agent-service";
import { messageInputSchema } from "@/lib/domain";

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await context.params;
  const body = await request.json();
  const parsed = messageInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Message body is required." }, { status: 400 });
  }

  await createMessageAndMaybeRunAgent({
    roomId,
    body: parsed.data.body
  });

  revalidatePath(`/rooms/${roomId}`);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Add approval API routes**

`src/app/api/tasks/[taskId]/approve/route.ts`:

```ts
import { NextResponse } from "next/server";
import { approveTask } from "@/lib/room-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;
  const task = await approveTask(taskId);
  return NextResponse.json({ task });
}
```

`src/app/api/docs/[docId]/approve/route.ts`:

```ts
import { NextResponse } from "next/server";
import { approveDocument } from "@/lib/room-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ docId: string }> }
) {
  const { docId } = await context.params;
  const document = await approveDocument(docId);
  return NextResponse.json({ document });
}
```

- [ ] **Step 3: Run build check**

Run:

```bash
npm run build
```

Expected: FAIL because page files are not created yet. TypeScript should not report errors inside the API route files.

- [ ] **Step 4: Commit**

```bash
git add src/app/api
git commit -m "feat: add room artifact api routes"
```

## Task 7: Add Project Room UI Shell

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/app/rooms/[roomId]/page.tsx`
- Create: `src/components/app-shell.tsx`

- [ ] **Step 1: Add root redirect**

`src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getDefaultRoomId } from "@/lib/room-service";

export default async function HomePage() {
  const roomId = await getDefaultRoomId();

  if (!roomId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper p-8 text-ink">
        <div className="max-w-md rounded border border-line bg-white p-6">
          <h1 className="text-xl font-semibold">FeiDingWei</h1>
          <p className="mt-2 text-sm text-slate-600">
            Run the database seed command to create the first project room.
          </p>
        </div>
      </main>
    );
  }

  redirect(`/rooms/${roomId}`);
}
```

- [ ] **Step 2: Add app shell**

`src/components/app-shell.tsx`:

```tsx
import { Bot, Plus, Users } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell(props: {
  workspaceName: string;
  roomName: string;
  roomDescription: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-paper text-ink">
      <aside className="border-r border-line bg-white">
        <div className="border-b border-line p-4">
          <div className="text-xs font-medium uppercase text-slate-500">Workspace</div>
          <div className="mt-1 text-lg font-semibold">{props.workspaceName}</div>
        </div>
        <nav className="p-3">
          <button className="flex w-full items-center gap-2 rounded border border-line bg-paper px-3 py-2 text-left text-sm font-medium">
            <Users className="h-4 w-4" />
            {props.roomName}
          </button>
          <button className="mt-3 flex w-full items-center gap-2 rounded border border-dashed border-line px-3 py-2 text-sm text-slate-600">
            <Plus className="h-4 w-4" />
            New room
          </button>
        </nav>
        <div className="absolute bottom-0 w-[260px] border-t border-line p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-accent" />
            Agents are visible collaborators.
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <header className="border-b border-line bg-white px-6 py-4">
          <h1 className="text-2xl font-semibold">{props.roomName}</h1>
          <p className="mt-1 text-sm text-slate-600">{props.roomDescription}</p>
        </header>
        {props.children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Add room page**

`src/app/rooms/[roomId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getProjectRoom } from "@/lib/room-service";

export default async function RoomPage({
  params
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = await getProjectRoom(roomId);

  if (!room) {
    notFound();
  }

  return (
    <AppShell
      workspaceName={room.workspace.name}
      roomName={room.name}
      roomDescription={room.description}
    >
      <div className="p-6">
        <div className="rounded border border-line bg-white p-6">
          <h2 className="text-lg font-semibold">Project room loaded</h2>
          <p className="mt-2 text-sm text-slate-600">
            Chat, tasks, docs, agents, and activity tabs will appear here.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/rooms src/components/app-shell.tsx
git commit -m "feat: add project room shell"
```

## Task 8: Add Room Tabs And Panels

**Files:**
- Create: `src/components/room-tabs.tsx`
- Create: `src/components/chat-panel.tsx`
- Create: `src/components/tasks-panel.tsx`
- Create: `src/components/docs-panel.tsx`
- Create: `src/components/agents-panel.tsx`
- Create: `src/components/__tests__/room-tabs.test.tsx`
- Modify: `src/app/rooms/[roomId]/page.tsx`

- [ ] **Step 1: Write tab UI test**

`src/components/__tests__/room-tabs.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RoomTabs } from "../room-tabs";

const room = {
  id: "room-1",
  messages: [],
  tasks: [],
  documents: [],
  agents: [],
  agentRuns: []
};

describe("RoomTabs", () => {
  it("switches between work panels", async () => {
    render(<RoomTabs room={room} />);
    expect(screen.getByRole("heading", { name: "Chat" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tasks" }));
    expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Agents" }));
    expect(screen.getByRole("heading", { name: "Agents" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm run test -- src/components/__tests__/room-tabs.test.tsx
```

Expected: FAIL because room tab components do not exist.

- [ ] **Step 3: Add panel components**

`src/components/chat-panel.tsx`:

```tsx
"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChatPanel({ room }: { room: { id: string; messages: any[] } }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setIsSending(true);
    await fetch(`/api/rooms/${room.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });
    setBody("");
    setIsSending(false);
    router.refresh();
  }

  return (
    <section className="grid h-[calc(100vh-168px)] grid-rows-[1fr_auto]">
      <div className="space-y-3 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold">Chat</h2>
        {room.messages.map((message) => (
          <article key={message.id} className="rounded border border-line bg-white p-3">
            <div className="text-xs font-medium text-slate-500">
              {message.author?.name ?? message.agent?.name ?? "System"}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{message.body}</p>
          </article>
        ))}
      </div>
      <form onSubmit={sendMessage} className="border-t border-line bg-white p-4">
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="min-w-0 flex-1 rounded border border-line px-3 py-2 text-sm"
            placeholder="@PMAgent summarize discussion and create draft tasks"
          />
          <button
            disabled={isSending}
            className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
```

`src/components/tasks-panel.tsx`:

```tsx
"use client";

import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function TasksPanel({ tasks }: { tasks: any[] }) {
  const router = useRouter();

  async function approve(taskId: string) {
    await fetch(`/api/tasks/${taskId}/approve`, { method: "POST" });
    router.refresh();
  }

  return (
    <section className="space-y-3 p-4">
      <h2 className="text-lg font-semibold">Tasks</h2>
      {tasks.map((task) => (
        <article key={task.id} className="rounded border border-line bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{task.title}</div>
              <p className="mt-1 text-sm text-slate-600">{task.description}</p>
              <div className="mt-2 text-xs text-slate-500">
                {task.status} · {task.priority} · {task.artifactStatus}
              </div>
            </div>
            {task.artifactStatus === "draft" ? (
              <button
                onClick={() => approve(task.id)}
                className="inline-flex shrink-0 items-center gap-2 rounded border border-line px-3 py-2 text-sm"
              >
                <CheckCircle className="h-4 w-4 text-success" />
                Approve
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
```

`src/components/docs-panel.tsx`:

```tsx
"use client";

import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocsPanel({ documents }: { documents: any[] }) {
  const router = useRouter();

  async function approve(documentId: string) {
    await fetch(`/api/docs/${documentId}/approve`, { method: "POST" });
    router.refresh();
  }

  return (
    <section className="space-y-3 p-4">
      <h2 className="text-lg font-semibold">Docs</h2>
      {documents.map((document) => (
        <article key={document.id} className="rounded border border-line bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold">{document.title}</div>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-paper p-3 text-sm">
                {document.body}
              </pre>
              <div className="mt-2 text-xs text-slate-500">{document.artifactStatus}</div>
            </div>
            {document.artifactStatus === "draft" ? (
              <button
                onClick={() => approve(document.id)}
                className="inline-flex shrink-0 items-center gap-2 rounded border border-line px-3 py-2 text-sm"
              >
                <CheckCircle className="h-4 w-4 text-success" />
                Approve
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
```

`src/components/agents-panel.tsx`:

```tsx
import { Bot, History } from "lucide-react";

export function AgentsPanel({
  agents,
  agentRuns
}: {
  agents: any[];
  agentRuns: any[];
}) {
  return (
    <section className="grid gap-4 p-4 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Agents</h2>
        {agents.map((agent) => (
          <article key={agent.id} className="rounded border border-line bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-accent" />
              {agent.name}
            </div>
            <p className="mt-1 text-sm text-slate-600">{agent.description}</p>
          </article>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <History className="h-4 w-4" />
          Activity
        </h3>
        {agentRuns.map((run) => (
          <article key={run.id} className="rounded border border-line bg-white p-4">
            <div className="text-sm font-semibold">{run.agent.name}</div>
            <div className="mt-1 text-xs text-slate-500">{run.status}</div>
            <p className="mt-2 text-sm">{run.output || run.input}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add tab composition**

`src/components/room-tabs.tsx`:

```tsx
"use client";

import { Bot, FileText, ListChecks, MessageSquare } from "lucide-react";
import { useState } from "react";
import { AgentsPanel } from "./agents-panel";
import { ChatPanel } from "./chat-panel";
import { DocsPanel } from "./docs-panel";
import { TasksPanel } from "./tasks-panel";

type Tab = "chat" | "tasks" | "docs" | "agents";

export function RoomTabs({ room }: { room: any }) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "chat", label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "tasks", label: "Tasks", icon: <ListChecks className="h-4 w-4" /> },
    { id: "docs", label: "Docs", icon: <FileText className="h-4 w-4" /> },
    { id: "agents", label: "Agents", icon: <Bot className="h-4 w-4" /> }
  ];

  return (
    <div>
      <div className="flex gap-2 border-b border-line bg-white px-6 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium ${
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-slate-600"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "chat" ? <ChatPanel room={room} /> : null}
      {activeTab === "tasks" ? <TasksPanel tasks={room.tasks} /> : null}
      {activeTab === "docs" ? <DocsPanel documents={room.documents} /> : null}
      {activeTab === "agents" ? (
        <AgentsPanel agents={room.agents} agentRuns={room.agentRuns} />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Wire tabs into page**

Modify `src/app/rooms/[roomId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RoomTabs } from "@/components/room-tabs";
import { getProjectRoom } from "@/lib/room-service";

export default async function RoomPage({
  params
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = await getProjectRoom(roomId);

  if (!room) {
    notFound();
  }

  return (
    <AppShell
      workspaceName={room.workspace.name}
      roomName={room.name}
      roomDescription={room.description}
    >
      <RoomTabs room={room} />
    </AppShell>
  );
}
```

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm run test -- src/components/__tests__/room-tabs.test.tsx
npm run build
```

Expected: both commands PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components src/app/rooms/[roomId]/page.tsx
git commit -m "feat: add agent project room panels"
```

## Task 9: Add End-To-End Coverage

**Files:**
- Create: `tests/e2e/project-room.spec.ts`

- [ ] **Step 1: Write Playwright test**

`tests/e2e/project-room.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("project room turns an agent mention into draft artifacts", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Agent Project Room" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chat" })).toBeVisible();

  await page
    .getByPlaceholder("@PMAgent summarize discussion and create draft tasks")
    .fill("@PMAgent summarize this discussion and create draft tasks");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText("PM Agent created draft tasks")).toBeVisible();

  await page.getByRole("button", { name: "Tasks" }).click();
  await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
  await expect(page.getByText("Clarify MVP success criteria")).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByText("active").first()).toBeVisible();

  await page.getByRole("button", { name: "Docs" }).click();
  await expect(page.getByText("PRD Draft")).toBeVisible();

  await page.getByRole("button", { name: "Agents" }).click();
  await expect(page.getByText("PM Agent")).toBeVisible();
  await expect(page.getByText("completed")).toBeVisible();
});
```

- [ ] **Step 2: Prepare database and run E2E**

Run:

```bash
npm run prisma:seed
npm run test:e2e
```

Expected: PASS in desktop and mobile projects.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/project-room.spec.ts
git commit -m "test: cover agent project room workflow"
```

## Task 10: Add README And Runbook

**Files:**
- Create: `README.md`

- [ ] **Step 1: Add README**

`README.md`:

```md
# 飞钉微 FeiDingWei

Open source agent-native workspace for teams.

飞钉微不是再造一个飞书、钉钉或企业微信。
它是一个让人和 AI Agent 在同一个项目空间里协作的开源办公平台。

In FeiDingWei, agents are not hidden assistants.
They are visible project collaborators that can summarize discussions,
draft documents, create task lists, review blockers, and keep work moving.

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

## Agent Runtime

FeiDingWei uses Pi for the generic agent infrastructure:

- `@earendil-works/pi-ai` for model/provider primitives and deterministic faux local runs.
- `@earendil-works/pi-agent-core` for stateful agent execution and tool calling.

The v0 app defaults to a faux Pi model so the project room works without an external API key.
Future versions can wire the same runtime to OpenAI, Anthropic, Gemini, local OpenAI-compatible APIs, or enterprise providers.

## Development

Requires Node.js 22.19 or newer.

Install dependencies:

```bash
npm install
```

Create the local database:

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

Run tests:

```bash
npm run test
npm run test:e2e
```
```

- [ ] **Step 2: Run verification**

Run:

```bash
npm run test
npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add feidingwei mvp runbook"
```

## Task 11: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Reset and seed the database**

Run:

```bash
npm run prisma:seed
```

Expected: seed completes without errors.

- [ ] **Step 2: Run full automated checks**

Run:

```bash
npm run test
npm run build
npm run test:e2e
```

Expected: all commands PASS.

- [ ] **Step 3: Start local dev server**

Run:

```bash
npm run dev
```

Expected: app starts at `http://127.0.0.1:3000`.

- [ ] **Step 4: Manual smoke test**

Open `http://127.0.0.1:3000` and verify:

- The user lands in the seeded Agent Project Room.
- Chat tab shows seeded messages.
- Sending a plain message creates a human message.
- Sending `@PMAgent summarize this discussion and create draft tasks` creates an agent reply.
- Tasks tab shows draft tasks.
- Approving a draft task changes it to active.
- Docs tab shows the PRD draft.
- Agents tab shows default agents and completed run history.

- [ ] **Step 5: Commit final fixes**

If verification required fixes, commit the changed files:

```bash
git status --short
git add <changed-files>
git commit -m "fix: complete mvp verification"
```

If verification produced no changes, do not create an empty commit.

## Self-Review

Spec coverage:

- Workspace shell: Task 7.
- Project room: Tasks 4, 7, and 8.
- Chat: Tasks 6 and 8.
- Agent mention flow: Tasks 2, 5, 6, and 9.
- Pi-based agent runtime reuse: Tasks 1 and 5.
- Room artifact tools: Task 5.
- Tasks: Tasks 3, 4, 6, 8, and 9.
- Docs: Tasks 3, 4, 6, 8, and 9.
- Default agents: Tasks 2, 3, 5, and 8.
- Agent run history: Tasks 3, 5, 8, and 9.
- Human approval for generated artifacts: Tasks 4, 6, 8, and 9.
- Private deployment credibility: Tasks 3 and 10.

Placeholder scan:

- No unresolved placeholder markers.
- No task says to add generic handling without concrete code or commands.

Type consistency:

- Task statuses are `todo`, `in_progress`, `blocked`, and `done`.
- Artifact statuses are `draft` and `active`.
- Agent run statuses are `queued`, `running`, `completed`, and `failed`.
- Default agent slugs are `pm-agent`, `doc-agent`, and `review-agent`.
