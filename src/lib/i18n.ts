export const supportedLocales = ["zh", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "zh";

export const translations = {
  zh: {
    languageToggle: "English",
    tabs: {
      chat: "对话",
      tasks: "任务",
      docs: "文档",
      agents: "智能体"
    },
    shell: {
      workspace: "工作区",
      newRoom: "新建项目房间",
      visibleAgents: "智能体是可见的协作者。"
    },
    chat: {
      heading: "对话",
      system: "系统",
      placeholder: "@PMAgent 总结讨论并创建任务草稿",
      send: "发送"
    },
    tasks: {
      heading: "任务",
      approve: "批准",
      status: {
        todo: "待办",
        in_progress: "进行中",
        done: "完成"
      },
      priority: {
        low: "低",
        medium: "中",
        high: "高"
      },
      artifactStatus: {
        draft: "草稿",
        active: "已生效"
      }
    },
    docs: {
      heading: "文档",
      approve: "批准",
      artifactStatus: {
        draft: "草稿",
        active: "已生效"
      }
    },
    agents: {
      heading: "智能体",
      activity: "运行记录",
      status: {
        queued: "排队中",
        running: "运行中",
        completed: "已完成",
        failed: "失败"
      }
    }
  },
  en: {
    languageToggle: "中文",
    tabs: {
      chat: "Chat",
      tasks: "Tasks",
      docs: "Docs",
      agents: "Agents"
    },
    shell: {
      workspace: "Workspace",
      newRoom: "New room",
      visibleAgents: "Agents are visible collaborators."
    },
    chat: {
      heading: "Chat",
      system: "System",
      placeholder: "@PMAgent summarize discussion and create draft tasks",
      send: "Send"
    },
    tasks: {
      heading: "Tasks",
      approve: "Approve",
      status: {
        todo: "todo",
        in_progress: "in progress",
        done: "done"
      },
      priority: {
        low: "low",
        medium: "medium",
        high: "high"
      },
      artifactStatus: {
        draft: "draft",
        active: "active"
      }
    },
    docs: {
      heading: "Docs",
      approve: "Approve",
      artifactStatus: {
        draft: "draft",
        active: "active"
      }
    },
    agents: {
      heading: "Agents",
      activity: "Activity",
      status: {
        queued: "queued",
        running: "running",
        completed: "completed",
        failed: "failed"
      }
    }
  }
} as const;

export type Translation = (typeof translations)[Locale];
