# 飞钉微 FeiDingWei

开源的 Agent 原生团队协作空间。

飞钉微不是再造一个飞书、钉钉或企业微信。它先做一个让人和 AI Agent 在同一个项目空间里协作的开源办公平台：讨论、总结、生成任务草稿、生成文档草稿、人工批准，并留下可追踪的 Agent 运行记录。

English version: [README.en.md](README.en.md)

## 当前形态

当前 v0 是纯 Web 端应用：

- Next.js Web App。
- Prisma + SQLite 本地数据库。
- Pi agent runtime。
- 浏览器访问项目房间。

目前没有桌面端、移动端 App，也没有接入企业 IM 客户端。后续可以在现有 Web/API 基础上扩展移动端、桌面端、企业身份、消息通知和企业 IM 集成。

## 部署方式

飞钉微 v0 按私有化部署优先设计：

- 公司可以部署在内网服务器、私有云、Kubernetes、Docker 或自有 PaaS。
- 项目消息、任务、文档和 Agent run history 默认保存在公司控制的数据库里。
- 当前示例使用 SQLite，适合本地开发和 MVP 演示；生产部署建议迁移到 PostgreSQL 或公司已有数据库平台。
- 大模型可以走企业自己的 OpenAI-compatible 网关、私有模型服务，或外部 OpenAI、Anthropic、Gemini 等 API。

## 大模型 API Key

v0 默认不需要大模型 API key。

当前实现使用 Pi 的 faux provider 做确定性本地运行，所以 `@PMAgent` 可以在没有外部模型服务的情况下生成测试用任务和文档草稿。这是为了先验证产品流程和工程结构。

后续接真实模型时，可以在现有 Pi runtime adapter 上添加 provider 配置，例如：

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- 企业内部 OpenAI-compatible endpoint

## MVP 功能

第一版实现 Agent Project Room：

- 工作区壳层。
- 项目房间。
- 对话。
- 任务。
- 文档。
- 默认智能体。
- Agent 运行记录。
- Agent 生成内容需要人工批准。
- 中文和英文界面切换。

核心流程：

```text
项目房间对话 -> @PMAgent -> 任务/文档草稿 -> 人工批准 -> 可见运行记录
```

## Agent Runtime

飞钉微复用 Pi 做通用 Agent 基础设施：

- `@earendil-works/pi-ai`：模型/provider 抽象、tool-call 消息类型、确定性 faux local runs。
- `@earendil-works/pi-agent-core`：有状态 Agent 执行和工具调用。

飞钉微自身只负责产品层：项目房间、消息、任务、文档、批准流程、运行记录和 Web UI。

## 环境要求

- Node.js 22.19 或更新版本。
- npm。

## 本地开发

安装依赖：

```bash
npm install
```

创建本地环境文件：

```bash
cp .env.example .env
```

`.env` 默认内容：

```env
DATABASE_URL="file:./dev.db"
```

生成 Prisma Client、创建数据库并写入 seed 数据：

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

运行应用：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:3000
```

Playwright E2E 使用 `http://127.0.0.1:3100`，避免和本地开发服务冲突。

## 验证

运行单元、服务、API 和组件测试：

```bash
npm run test
```

运行 TypeScript 检查：

```bash
npm run lint
```

运行生产构建：

```bash
npm run build
```

运行浏览器 E2E：

```bash
npm run test:e2e
```

运行标准 harness 入口：

```bash
./init.sh
```

## 迭代管理

开发状态通过这些文件追踪：

- `feature_list.json`：feature 状态的 source of truth。
- `progress.md`：会话进度记录。
- `session-handoff.md`：重启/交接说明。
- `clean-state-checklist.md`：提交和会话结束前检查。
- `quality-document.md`：里程碑质量评估。

每次只做一个 feature，并在标记为 `pass` 前记录验证证据。
