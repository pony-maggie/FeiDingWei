import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test.beforeEach(() => {
  execSync("npm run prisma:seed", { stdio: "inherit" });
});

test("project room turns an agent mention into draft artifacts", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "登录飞钉微" })).toBeVisible();
  await page.getByLabel("选择登录用户").selectOption("founder@feidingwei.local");
  await page.getByRole("button", { name: "进入飞钉微" }).click();

  await expect(page.getByRole("heading", { name: "智能体项目房间" })).toBeVisible();
  await expect(page.getByText("人和 AI 智能体把讨论转成项目成果。")).toBeVisible();
  await expect(page.getByRole("heading", { name: "对话" })).toBeVisible();
  await page.getByRole("button", { name: "设置" }).click();
  await expect(page.getByRole("menuitem", { name: "导出房间数据" })).toBeVisible();
  await page.getByRole("menuitem", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Agent Project Room" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chat" })).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("menuitem", { name: "中文" }).click();
  await expect(page.getByRole("heading", { name: "智能体项目房间" })).toBeVisible();

  const messageBox = page.getByPlaceholder("@PMAgent 总结讨论并创建任务草稿");
  await messageBox.fill("@pro");
  await page.getByRole("button", { name: "产品 @product" }).click();
  await expect(messageBox).toHaveValue("@product ");
  await messageBox.fill("@product 请看这个客户请求");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("@product 请看这个客户请求")).toBeVisible();
  await expect(page.getByRole("heading", { name: "生成计划" })).not.toBeVisible();

  await messageBox.fill("@");
  await page.getByRole("button", { name: "产品智能体 @PMAgent" }).click();
  await expect(messageBox).toHaveValue("@PMAgent ");
  await messageBox.fill("@PMAgent summarize this discussion and create draft tasks");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByRole("heading", { name: "生成计划" })).toBeVisible();
  await expect(page.getByText("产品智能体将基于当前对话创建：")).toBeVisible();
  await expect(page.getByText("任务草稿", { exact: true })).toBeVisible();
  await expect(page.getByText("文档草稿", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认生成" }).click();

  await expect(page.getByText("产品智能体已创建任务草稿").first()).toBeVisible();

  await page.getByRole("button", { name: "任务" }).click();
  await expect(page.getByRole("heading", { name: "任务" })).toBeVisible();
  await expect(page.getByText("明确 MVP 成功标准")).toBeVisible();
  const generatedTask = page.getByRole("article", { name: "明确 MVP 成功标准" });
  await generatedTask.getByLabel("负责人").selectOption({ label: "研发" });
  await generatedTask.getByRole("button", { name: "指派" }).click();
  await expect(generatedTask.getByText(/负责人:\s*研发/)).toBeVisible();
  await generatedTask.getByLabel("评审人").selectOption({ label: "测试" });
  await generatedTask.getByRole("button", { name: "请求评审" }).click();
  await expect(generatedTask.getByText(/评审人:\s*测试/)).toBeVisible();
  await expect(generatedTask.getByText(/评审状态:\s*待评审/)).toBeVisible();
  await page
    .getByRole("article", { name: "明确 MVP 成功标准" })
    .getByRole("button", { name: "编辑" })
    .click();
  await page.getByLabel("任务标题").fill("编辑后的 MVP 成功标准");
  await page.getByLabel("描述").fill("人工调整后的任务描述");
  await page.getByLabel("优先级").selectOption("high");
  await page.getByRole("button", { name: "保存" }).click();
  const editedTask = page.getByRole("article", { name: "编辑后的 MVP 成功标准" });
  await expect(editedTask).toBeVisible();
  await editedTask.getByRole("button", { name: "批准" }).click();
  await expect(editedTask.getByText("已生效")).toBeVisible();
  const reviewTask = page.getByRole("article", { name: "审查生成的任务草稿" });
  await reviewTask.getByRole("button", { name: "拒绝" }).click();
  await expect(reviewTask.getByText("已拒绝")).toBeVisible();
  await expect(page.getByText("来源消息").first()).toBeVisible();
  await expect(
    page.getByText("@PMAgent summarize this discussion and create draft tasks").first()
  ).toBeVisible();
  await expect(page.getByText("Agent run").first()).toBeVisible();

  await page.getByRole("button", { name: "文档" }).click();
  await expect(page.getByText("PRD 草稿", { exact: true }).first()).toBeVisible();
  const generatedDocument = page.getByRole("article", { name: "PRD 草稿" }).first();
  await generatedDocument.getByLabel("负责人").selectOption({ label: "产品" });
  await generatedDocument.getByRole("button", { name: "指派" }).click();
  await expect(generatedDocument.getByText(/负责人:\s*产品/)).toBeVisible();
  await generatedDocument.getByLabel("评审人").selectOption({ label: "测试" });
  await generatedDocument.getByRole("button", { name: "请求评审" }).click();
  await expect(generatedDocument.getByText(/评审人:\s*测试/)).toBeVisible();
  await expect(generatedDocument.getByText(/评审状态:\s*待评审/)).toBeVisible();
  await page
    .getByRole("article", { name: "PRD 草稿" })
    .first()
    .getByRole("button", { name: "编辑" })
    .click();
  await page.getByLabel("文档标题").fill("编辑后的 PRD 草稿");
  await page.getByLabel("正文").fill("人工调整后的 PRD 正文");
  await page.getByRole("button", { name: "保存" }).click();
  const editedDocument = page.getByRole("article", { name: "编辑后的 PRD 草稿" });
  await expect(editedDocument).toBeVisible();
  await editedDocument.getByRole("button", { name: "拒绝" }).click();
  await expect(editedDocument.getByText("已拒绝")).toBeVisible();

  await page.getByRole("button", { name: "决策" }).click();
  await expect(page.getByRole("heading", { name: "决策" })).toBeVisible();
  await page.getByLabel("决策标题").fill("保持私有部署优先");
  await page.getByLabel("决策内容").fill("首个版本继续定位为企业私有部署。");
  await page.getByRole("button", { name: "记录决策" }).click();
  const recordedDecision = page.getByRole("article", { name: "保持私有部署优先" });
  await expect(recordedDecision).toBeVisible();
  await expect(recordedDecision.getByText("首个版本继续定位为企业私有部署。")).toBeVisible();

  await page.getByRole("button", { name: "智能体", exact: true }).click();
  await expect(page.getByText("产品智能体").first()).toBeVisible();
  await expect(page.getByText("@PMAgent").first()).toBeVisible();
  await expect(page.getByText("模型来源")).toBeVisible();
  await expect(page.getByText("本地 faux provider")).toBeVisible();
  await expect(page.getByText("已完成")).toBeVisible();
  await expect(page.getByText("触发消息")).toBeVisible();
  await expect(page.getByText("生成的任务", { exact: true })).toBeVisible();
  await expect(page.getByText("生成的文档", { exact: true })).toBeVisible();
  await expect(page.getByText("编辑后的 MVP 成功标准").first()).toBeVisible();
  await expect(page.getByText("编辑后的 PRD 草稿").first()).toBeVisible();
  await page.getByRole("button", { name: "详情" }).first().click();
  await expect(page.getByText("Run ID")).toBeVisible();
  await expect(page.getByText("输入")).toBeVisible();
  await expect(page.getByText("输出")).toBeVisible();

  await page.getByRole("link", { name: "成员" }).click();
  await expect(page.getByRole("heading", { name: "成员" })).toBeVisible();
  const productMember = page.getByRole("article", { name: "Product" });
  await expect(productMember).toBeVisible();
  await expect(productMember.getByText("product@feidingwei.local")).toBeVisible();
  await expect(productMember.getByText("工作区角色: member")).toBeVisible();
  await expect(productMember.getByText("Agent Project Room · room_lead")).toBeVisible();
});

test("mentioned users can review notifications in the inbox", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("选择登录用户").selectOption("business@feidingwei.local");
  await page.getByRole("button", { name: "进入飞钉微" }).click();
  await expect(page.getByRole("heading", { name: "智能体项目房间" })).toBeVisible();

  const messageBox = page.getByPlaceholder("@PMAgent 总结讨论并创建任务草稿");
  await messageBox.fill("@product 请看这个客户请求");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("@product 请看这个客户请求")).toBeVisible();

  await page.goto("/logout");
  await expect(page.getByRole("heading", { name: "登录飞钉微" })).toBeVisible();
  await page.getByLabel("选择登录用户").selectOption("product@feidingwei.local");
  await page.getByRole("button", { name: "进入飞钉微" }).click();
  await expect(page.getByRole("heading", { name: "智能体项目房间" })).toBeVisible();
  await page.getByRole("link", { name: "收件箱" }).click();

  await expect(page.getByRole("heading", { name: "收件箱" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "未读" })).toBeVisible();
  const mentionNotification = page.getByRole("article").filter({
    hasText: "@product 请看这个客户请求"
  });
  await expect(mentionNotification.getByText("Business mentioned you")).toBeVisible();
  await expect(mentionNotification.getByText("@product 请看这个客户请求")).toBeVisible();
  await mentionNotification.getByRole("button", { name: "标为已读" }).click();
  await expect(page.getByRole("heading", { name: "已读" })).toBeVisible();
  await expect(page.getByText("Business mentioned you").first()).toBeVisible();
});
