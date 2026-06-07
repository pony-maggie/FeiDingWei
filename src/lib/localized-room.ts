import type { Locale } from "./i18n";

type NamedEntity = { name: string };
type NullableNamedEntity = NamedEntity | null;

export type LocalizableRoom = {
  id: string;
  workspace: NamedEntity;
  name: string;
  description: string;
  messages: Array<{
    id: string;
    body: string;
    author: NullableNamedEntity;
    agent: NullableNamedEntity;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    artifactStatus: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    body: string;
    artifactStatus: string;
  }>;
  agents: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  agentRuns: Array<{
    id: string;
    status: string;
    output: string;
    input: string;
    agent: NamedEntity;
  }>;
};

const knownText: Record<string, Record<Locale, string>> = {
  "FeiDingWei Labs": {
    zh: "飞钉微实验室",
    en: "FeiDingWei Labs"
  },
  "Agent Project Room": {
    zh: "智能体项目房间",
    en: "Agent Project Room"
  },
  "Humans and AI agents turn discussion into project artifacts.": {
    zh: "人和 AI 智能体把讨论转成项目成果。",
    en: "Humans and AI agents turn discussion into project artifacts."
  },
  Founder: {
    zh: "创始人",
    en: "Founder"
  },
  "We need the first version to prove that chat can become tasks and docs.": {
    zh: "第一版需要证明对话可以转成任务和文档。",
    en: "We need the first version to prove that chat can become tasks and docs."
  },
  "@PMAgent summarize the launch discussion and create draft tasks.": {
    zh: "@PMAgent 总结发布讨论并创建任务草稿。",
    en: "@PMAgent summarize the launch discussion and create draft tasks."
  },
  "Define the Agent Project Room MVP": {
    zh: "定义智能体项目房间 MVP",
    en: "Define the Agent Project Room MVP"
  },
  "Capture the first product scope and non-goals.": {
    zh: "明确第一版产品范围和非目标。",
    en: "Capture the first product scope and non-goals."
  },
  "MVP Positioning": {
    zh: "MVP 定位",
    en: "MVP Positioning"
  },
  "FeiDingWei is an open source agent-native workspace for teams.": {
    zh: "飞钉微是开源的 Agent 原生团队协作空间。",
    en: "FeiDingWei is an open source agent-native workspace for teams."
  },
  "PM Agent": {
    zh: "产品智能体",
    en: "PM Agent"
  },
  "Doc Agent": {
    zh: "文档智能体",
    en: "Doc Agent"
  },
  "Review Agent": {
    zh: "评审智能体",
    en: "Review Agent"
  },
  "Summarizes discussions, drafts PRDs, and creates draft task lists.": {
    zh: "总结讨论、起草 PRD，并创建任务草稿列表。",
    en: "Summarizes discussions, drafts PRDs, and creates draft task lists."
  },
  "Turns rough discussion into readable notes, specs, and summaries.": {
    zh: "把粗糙讨论转成可读的纪要、规格说明和总结。",
    en: "Turns rough discussion into readable notes, specs, and summaries."
  },
  "Finds blockers, missing owners, unclear scope, and stale tasks.": {
    zh: "发现阻塞点、缺失负责人、不清晰范围和停滞任务。",
    en: "Finds blockers, missing owners, unclear scope, and stale tasks."
  },
  "Clarify MVP success criteria": {
    zh: "明确 MVP 成功标准",
    en: "Clarify MVP success criteria"
  },
  "Confirm what a real team must accomplish in the project room.": {
    zh: "确认真实团队必须在项目房间里完成什么。",
    en: "Confirm what a real team must accomplish in the project room."
  },
  "Review generated task drafts": {
    zh: "审查生成的任务草稿",
    en: "Review generated task drafts"
  },
  "Approve, edit, or reject the tasks proposed by the agent.": {
    zh: "批准、编辑或拒绝智能体提出的任务。",
    en: "Approve, edit, or reject the tasks proposed by the agent."
  },
  "Prepare demo project room": {
    zh: "准备演示项目房间",
    en: "Prepare demo project room"
  },
  "Use the seeded room to show chat, tasks, docs, and agent runs together.": {
    zh: "使用 seed 房间展示对话、任务、文档和智能体运行记录。",
    en: "Use the seeded room to show chat, tasks, docs, and agent runs together."
  },
  "PRD Draft": {
    zh: "PRD 草稿",
    en: "PRD Draft"
  },
  "# PRD Draft\n\n## Product Direction\nTurn room discussion into structured project work.": {
    zh: "# PRD 草稿\n\n## 产品方向\n把房间讨论转成结构化项目工作。",
    en: "# PRD Draft\n\n## Product Direction\nTurn room discussion into structured project work."
  },
  "PM Agent created draft tasks and a short PRD outline for human review.": {
    zh: "产品智能体已创建任务草稿和简短 PRD 提纲，等待人工审查。",
    en: "PM Agent created draft tasks and a short PRD outline for human review."
  },
  "PM Agent completed the run.": {
    zh: "产品智能体已完成运行。",
    en: "PM Agent completed the run."
  }
};

const aliases = new Map<string, Record<Locale, string>>();

for (const value of Object.values(knownText)) {
  aliases.set(value.zh, value);
  aliases.set(value.en, value);
}

export function localizeText(value: string, locale: Locale): string {
  return aliases.get(value)?.[locale] ?? value;
}

function localizeName<T extends NullableNamedEntity>(entity: T, locale: Locale): T {
  if (!entity) {
    return entity;
  }

  return { ...entity, name: localizeText(entity.name, locale) };
}

export function localizeRoom<T extends LocalizableRoom>(room: T, locale: Locale): T {
  return {
    ...room,
    workspace: localizeName(room.workspace, locale),
    name: localizeText(room.name, locale),
    description: localizeText(room.description, locale),
    messages: room.messages.map((message) => ({
      ...message,
      body: localizeText(message.body, locale),
      author: localizeName(message.author, locale),
      agent: localizeName(message.agent, locale)
    })),
    tasks: room.tasks.map((task) => ({
      ...task,
      title: localizeText(task.title, locale),
      description: localizeText(task.description, locale)
    })),
    documents: room.documents.map((document) => ({
      ...document,
      title: localizeText(document.title, locale),
      body: localizeText(document.body, locale)
    })),
    agents: room.agents.map((agent) => ({
      ...agent,
      name: localizeText(agent.name, locale),
      description: localizeText(agent.description, locale)
    })),
    agentRuns: room.agentRuns.map((run) => ({
      ...run,
      output: localizeText(run.output, locale),
      input: localizeText(run.input, locale),
      agent: localizeName(run.agent, locale)
    }))
  };
}
