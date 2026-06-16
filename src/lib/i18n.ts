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
      decisions: "决策",
      agents: "智能体"
    },
    shell: {
      workspace: "工作区",
      newRoom: "新建项目房间",
      inbox: "收件箱",
      people: "成员",
      visibleAgents: "智能体是可见的协作者。",
      settings: "设置",
      language: "语言",
      currentLanguage: "中文",
      data: "数据",
      exportRoom: "导出房间数据",
      roomNameLabel: "房间名称",
      roomDescriptionLabel: "房间描述",
      roomMembersLabel: "选择成员",
      roomRoleLabel: "角色",
      createRoom: "创建房间",
      cancelRoomCreate: "取消",
      roomCreateError: "创建房间失败",
      roomRoles: {
        room_lead: "负责人",
        contributor: "协作者",
        reviewer: "评审人",
        viewer: "只读"
      }
    },
    chat: {
      heading: "对话",
      system: "系统",
      placeholder: "@PMAgent 总结讨论并创建任务草稿",
      send: "发送",
      planHeading: "生成计划",
      planIntroSuffix: "将基于当前对话创建：",
      planTaskDrafts: "任务草稿",
      planDocumentDrafts: "文档草稿",
      planConfirmation: "确认后才会运行智能体并写入草稿。",
      confirmGeneration: "确认生成",
      cancelGeneration: "取消"
    },
    inbox: {
      heading: "收件箱",
      unread: "未读",
      read: "已读",
      openRoom: "打开",
      markRead: "标为已读",
      emptyUnread: "没有未读通知",
      emptyRead: "没有已读通知"
    },
    people: {
      heading: "成员",
      workspaceRole: "工作区角色",
      functionLabel: "职能",
      team: "团队",
      activeRooms: "活跃房间",
      noTeam: "未分配团队",
      noActiveRooms: "没有活跃房间"
    },
    tasks: {
      heading: "任务",
      approve: "批准",
      edit: "编辑",
      reject: "拒绝",
      save: "保存",
      cancel: "取消",
      titleLabel: "任务标题",
      descriptionLabel: "描述",
      priorityLabel: "优先级",
      assigneeLabel: "负责人",
      reviewerLabel: "评审人",
      reviewStatusLabel: "评审状态",
      blockedReasonLabel: "阻塞原因",
      assign: "指派",
      requestReview: "请求评审",
      returnRevision: "退回修改",
      returnCommentLabel: "修改意见",
      comments: "评论",
      sourceMessage: "来源消息",
      sourceRun: "Agent run",
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
        active: "已生效",
        rejected: "已拒绝"
      },
      reviewStatus: {
        none: "未请求",
        requested: "待评审",
        approved: "已通过",
        changes_requested: "需修改",
        rejected: "已拒绝"
      }
    },
    docs: {
      heading: "文档",
      approve: "批准",
      edit: "编辑",
      reject: "拒绝",
      save: "保存",
      cancel: "取消",
      titleLabel: "文档标题",
      bodyLabel: "正文",
      ownerLabel: "负责人",
      reviewerLabel: "评审人",
      reviewStatusLabel: "评审状态",
      blockedReasonLabel: "阻塞原因",
      assign: "指派",
      requestReview: "请求评审",
      returnRevision: "退回修改",
      returnCommentLabel: "修改意见",
      comments: "评论",
      sourceMessage: "来源消息",
      sourceRun: "Agent run",
      artifactStatus: {
        draft: "草稿",
        active: "已生效",
        rejected: "已拒绝"
      },
      reviewStatus: {
        none: "未请求",
        requested: "待评审",
        approved: "已通过",
        changes_requested: "需修改",
        rejected: "已拒绝"
      }
    },
    decisions: {
      heading: "决策",
      titleLabel: "决策标题",
      bodyLabel: "决策内容",
      create: "记录决策",
      sourceMessage: "来源消息",
      sourceRun: "Agent run",
      status: {
        draft: "草稿",
        active: "已生效",
        rejected: "已拒绝"
      }
    },
    agents: {
      heading: "智能体",
      activity: "运行记录",
      providerSource: "模型来源",
      localProvider: "本地 faux provider",
      assigneeLabel: "负责人",
      ownerLabel: "负责人",
      reviewerLabel: "评审人",
      details: "详情",
      hideDetails: "收起",
      triggerMessage: "触发消息",
      generatedTasks: "生成的任务",
      generatedDocuments: "生成的文档",
      generatedDecisions: "生成的决策",
      runId: "Run ID",
      runInput: "输入",
      runOutput: "输出",
      runError: "错误",
      artifactStatus: {
        draft: "草稿",
        active: "已生效",
        rejected: "已拒绝"
      },
      reviewStatus: {
        none: "未请求",
        requested: "待评审",
        approved: "已通过",
        changes_requested: "需修改",
        rejected: "已拒绝"
      },
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
      decisions: "Decisions",
      agents: "Agents"
    },
    shell: {
      workspace: "Workspace",
      newRoom: "New room",
      inbox: "Inbox",
      people: "People",
      visibleAgents: "Agents are visible collaborators.",
      settings: "Settings",
      language: "Language",
      currentLanguage: "English",
      data: "Data",
      exportRoom: "Export room data",
      roomNameLabel: "Room name",
      roomDescriptionLabel: "Room description",
      roomMembersLabel: "Members",
      roomRoleLabel: "role",
      createRoom: "Create room",
      cancelRoomCreate: "Cancel",
      roomCreateError: "Room creation failed",
      roomRoles: {
        room_lead: "Room lead",
        contributor: "Contributor",
        reviewer: "Reviewer",
        viewer: "Viewer"
      }
    },
    chat: {
      heading: "Chat",
      system: "System",
      placeholder: "@PMAgent summarize discussion and create draft tasks",
      send: "Send",
      planHeading: "Generation plan",
      planIntroSuffix: " will use the current conversation to create:",
      planTaskDrafts: "Draft tasks",
      planDocumentDrafts: "Draft document",
      planConfirmation: "The agent only runs after you confirm.",
      confirmGeneration: "Confirm generation",
      cancelGeneration: "Cancel"
    },
    inbox: {
      heading: "Inbox",
      unread: "Unread",
      read: "Read",
      openRoom: "Open",
      markRead: "Mark as read",
      emptyUnread: "No unread notifications",
      emptyRead: "No read notifications"
    },
    people: {
      heading: "People",
      workspaceRole: "Workspace role",
      functionLabel: "Function",
      team: "Team",
      activeRooms: "Active rooms",
      noTeam: "No team",
      noActiveRooms: "No active rooms"
    },
    tasks: {
      heading: "Tasks",
      approve: "Approve",
      edit: "Edit",
      reject: "Reject",
      save: "Save",
      cancel: "Cancel",
      titleLabel: "Task title",
      descriptionLabel: "Description",
      priorityLabel: "Priority",
      assigneeLabel: "Assignee",
      reviewerLabel: "Reviewer",
      reviewStatusLabel: "Review",
      blockedReasonLabel: "Blocked reason",
      assign: "Assign",
      requestReview: "Request review",
      returnRevision: "Return for revision",
      returnCommentLabel: "Revision note",
      comments: "Comments",
      sourceMessage: "Source message",
      sourceRun: "Agent run",
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
        active: "active",
        rejected: "rejected"
      },
      reviewStatus: {
        none: "not requested",
        requested: "requested",
        approved: "approved",
        changes_requested: "changes requested",
        rejected: "rejected"
      }
    },
    docs: {
      heading: "Docs",
      approve: "Approve",
      edit: "Edit",
      reject: "Reject",
      save: "Save",
      cancel: "Cancel",
      titleLabel: "Document title",
      bodyLabel: "Body",
      ownerLabel: "Owner",
      reviewerLabel: "Reviewer",
      reviewStatusLabel: "Review",
      blockedReasonLabel: "Blocked reason",
      assign: "Assign",
      requestReview: "Request review",
      returnRevision: "Return for revision",
      returnCommentLabel: "Revision note",
      comments: "Comments",
      sourceMessage: "Source message",
      sourceRun: "Agent run",
      artifactStatus: {
        draft: "draft",
        active: "active",
        rejected: "rejected"
      },
      reviewStatus: {
        none: "not requested",
        requested: "requested",
        approved: "approved",
        changes_requested: "changes requested",
        rejected: "rejected"
      }
    },
    decisions: {
      heading: "Decisions",
      titleLabel: "Decision title",
      bodyLabel: "Decision body",
      create: "Record decision",
      sourceMessage: "Source message",
      sourceRun: "Agent run",
      status: {
        draft: "draft",
        active: "active",
        rejected: "rejected"
      }
    },
    agents: {
      heading: "Agents",
      activity: "Activity",
      providerSource: "Provider",
      localProvider: "Local faux provider",
      assigneeLabel: "Assignee",
      ownerLabel: "Owner",
      reviewerLabel: "Reviewer",
      details: "Details",
      hideDetails: "Hide details",
      triggerMessage: "Trigger message",
      generatedTasks: "Generated tasks",
      generatedDocuments: "Generated documents",
      generatedDecisions: "Generated decisions",
      runId: "Run ID",
      runInput: "Input",
      runOutput: "Output",
      runError: "Error",
      artifactStatus: {
        draft: "draft",
        active: "active",
        rejected: "rejected"
      },
      reviewStatus: {
        none: "not requested",
        requested: "requested",
        approved: "approved",
        changes_requested: "changes requested",
        rejected: "rejected"
      },
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
