# 飞钉微 FeiDingWei

开源的 Agent 原生团队协作空间。

飞钉微的长期目标很直接：在团队协作软件这个问题上，正面对标飞书、钉钉、企业微信这三个不开源的巨头，但用开源、可私有化、以 Agent 为核心的方式重做。

它不是先复制 IM、OA、审批和企业管理套件，而是先把团队工作的中心从“人组织人”改成“Agent 组织工作，人负责目标、判断、批准和责任”。在飞钉微里，人不是默认最重要的界面中心；Agent 是一等协作者和执行单元，所有 Agent 产出都必须可追踪、可审查、可被人批准或拒绝。

当前版本先落在一个可运行的 Agent Project Room：人和 AI Agent 在同一个项目空间里协作，讨论、总结、生成任务草稿、生成文档草稿、请求评审、记录决策，并留下可追踪的 Agent 运行记录。

English version: [README.en.md](README.en.md)

用户使用手册： [docs/USER_MANUAL.md](docs/USER_MANUAL.md)


## 部署方式

飞钉微 v0 按私有化部署优先设计：

- 公司可以部署在内网服务器、私有云、Kubernetes、Docker 或自有 PaaS。
- 项目消息、任务、文档和 Agent run history 默认保存在公司控制的数据库里。
- 当前示例使用 SQLite，适合本地开发和 MVP 演示；生产部署建议迁移到 PostgreSQL 或公司已有数据库平台。
- 大模型可以走企业自己的 OpenAI-compatible 网关、私有模型服务，或外部 OpenAI、Anthropic、Gemini 等 API。

## 大模型 API Key

v0 默认不需要大模型 API key。

默认配置使用 faux provider 做确定性本地运行，所以 `@PMAgent` 可以在没有外部模型服务的情况下生成测试用任务和文档草稿。这是为了先验证产品流程和工程结构。

如果要验收真实模型调用，可以在 `.env` 中开启 OpenAI provider：

```env
FEIDINGWEI_LLM_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
FEIDINGWEI_LLM_MODEL="gpt-5.5"
```

配置真实 provider 后，Agent 仍通过同一条底层 runtime 链路执行，生成内容仍然只能进入任务/文档草稿，并且仍需要人工编辑、批准或拒绝。API key 只从服务端环境变量读取，不会展示在前端或写入 Agent run 记录。

后续可以继续扩展：

- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- 企业内部 OpenAI-compatible endpoint

## Agent Runtime

飞钉微的 Agent Runtime 不是把 Agent 当成一个隐藏在后台的聊天机器人，而是把每次 Agent 工作拆成一条可记录、可审查、可回放的执行链路：

- 用户在房间消息里 mention 可见 Agent，前端先生成计划预览，不立即执行。
- 用户确认后，服务端保存触发消息，并创建一条 `AgentRun` 记录，状态从 `running` 到 `completed` 或 `failed`。
- Runtime 会把房间上下文、当前成员、角色、任务、文档、评审、阻塞项和最近决策组织进 Agent 输入。
- 模型层只负责基于上下文决定要说什么、要调用什么工具；产品层只暴露受控工具，例如创建任务草稿、文档草稿和决策草稿。
- 工具调用按顺序执行，所有生成结果默认是 `draft`，不会直接变成正式任务、正式文档或正式决策。
- 每个生成产物都会保存来源消息和来源 Agent run，用户可以在任务、文档、决策和 Agents 页追溯它从哪里来。
- 没有真实模型 key 时，runtime 使用确定性的 faux provider 跑同一条链路，方便本地开发、测试和演示。

这个边界很重要：模型/provider、tool-call 消息和有状态执行是底层运行时问题；房间、消息、权限、任务、文档、审批、决策、可见运行记录和 Web UI 是飞钉微的产品问题。

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

本地 seed 会创建这些演示登录用户：

- `founder@feidingwei.local`
- `business@feidingwei.local`
- `product@feidingwei.local`
- `engineer@feidingwei.local`
- `qa@feidingwei.local`

当前 v2 协作迭代先使用本地演示登录，不包含密码、企业 SSO 或外部身份提供商。

Playwright E2E 使用 `http://127.0.0.1:3100`，避免和本地开发服务冲突。
