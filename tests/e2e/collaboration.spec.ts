import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test.beforeEach(() => {
  execSync("npm run prisma:seed", { stdio: "inherit" });
});

async function loginAs(page: import("@playwright/test").Page, email: string) {
  await page.goto("/logout");
  await expect(page.getByRole("heading", { name: "登录飞钉微" })).toBeVisible();
  await page.getByLabel("选择登录用户").selectOption(email);
  await page.getByRole("button", { name: "进入飞钉微" }).click();
  await expect(page.getByRole("heading", { name: "智能体项目房间" })).toBeVisible();
}

test("business product engineering and QA complete a V2 collaboration workflow", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Full cross-user collaboration flow runs on desktop.");

  await loginAs(page, "business@feidingwei.local");

  const messageBox = page.getByPlaceholder("@PMAgent 总结讨论并创建任务草稿");
  await messageBox.fill("@product 客户反馈：团队需要在项目房间里沉淀需求、任务、评审和决策。");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("@product 客户反馈")).toBeVisible();

  await messageBox.fill("@PMAgent 基于客户反馈生成协作任务和 PRD 草稿");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByRole("heading", { name: "生成计划" })).toBeVisible();
  await page.getByRole("button", { name: "确认生成" }).click();
  await expect(page.getByText("产品智能体已创建任务草稿").first()).toBeVisible();

  await loginAs(page, "product@feidingwei.local");
  await page.getByRole("link", { name: "收件箱" }).click();
  await expect(page.getByRole("heading", { name: "收件箱" })).toBeVisible();
  await expect(page.getByText("Business mentioned you").first()).toBeVisible();
  await expect(page.getByText("客户反馈：团队需要在项目房间里沉淀需求")).toBeVisible();
  await page.getByRole("link", { name: /打开/ }).first().click();
  await expect(page.getByRole("heading", { name: "智能体项目房间" })).toBeVisible();

  await page.getByRole("button", { name: "文档" }).click();
  const prdDraft = page.getByRole("article", { name: "PRD 草稿" }).first();
  await expect(prdDraft).toBeVisible();
  await prdDraft.getByRole("button", { name: "编辑" }).click();
  await page.getByLabel("文档标题").fill("协作工作台 PRD");
  await page.getByLabel("正文").fill("产品补充：业务、产品、研发、测试需要围绕同一房间协作。");
  await page.getByRole("button", { name: "保存" }).click();
  const editedPrd = page.getByRole("article", { name: "协作工作台 PRD" });
  await expect(editedPrd).toBeVisible();
  await editedPrd.getByLabel("负责人").selectOption({ label: "产品" });
  await editedPrd.getByRole("button", { name: "指派" }).click();
  await expect(editedPrd.getByText(/负责人:\s*产品/)).toBeVisible();
  await editedPrd.getByLabel("评审人").selectOption({ label: "研发" });
  await editedPrd.getByRole("button", { name: "请求评审" }).click();
  await expect(editedPrd.getByText(/评审人:\s*研发/)).toBeVisible();
  await expect(editedPrd.getByText(/评审状态:\s*待评审/)).toBeVisible();

  await loginAs(page, "engineer@feidingwei.local");
  await page.getByRole("link", { name: "收件箱" }).click();
  await expect(page.getByText("Product requested your review").first()).toBeVisible();
  await expect(page.getByText("协作工作台 PRD").first()).toBeVisible();
  await page.getByRole("link", { name: /打开/ }).first().click();
  await page.getByRole("button", { name: "文档" }).click();
  const engineerPrd = page.getByRole("article", { name: "协作工作台 PRD" });
  await engineerPrd.getByLabel("修改意见").fill("需要补充研发验收边界，并同步 @product。");
  await engineerPrd.getByRole("button", { name: "退回修改" }).click();
  await expect(engineerPrd.getByText(/评审状态:\s*需修改/)).toBeVisible();
  await expect(
    engineerPrd.getByText("阻塞原因: 需要补充研发验收边界，并同步 @product。")
  ).toBeVisible();

  await loginAs(page, "product@feidingwei.local");
  await page.getByRole("button", { name: "决策" }).click();
  await page.getByLabel("决策标题").fill("V2 先固化项目房间协作闭环");
  await page.getByLabel("决策内容").fill("先覆盖业务、产品、研发、测试在一个房间内协作，不扩展 OA。");
  await page.getByRole("button", { name: "记录决策" }).click();
  const decision = page.getByRole("article", { name: "V2 先固化项目房间协作闭环" });
  await expect(decision).toBeVisible();
  await expect(decision.getByText("先覆盖业务、产品、研发、测试在一个房间内协作，不扩展 OA。")).toBeVisible();

  await loginAs(page, "qa@feidingwei.local");
  const qaMessageBox = page.getByPlaceholder("@PMAgent 总结讨论并创建任务草稿");
  await qaMessageBox.fill("@ReviewAgent 检查当前房间的风险和遗漏项");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByRole("heading", { name: "生成计划" })).toBeVisible();
  await page.getByRole("button", { name: "确认生成" }).click();
  await expect(
    page.getByText("Review Agent created a project review with likely blockers and missing decisions.").first()
  ).toBeVisible();

  await page.getByRole("button", { name: "智能体", exact: true }).click();
  await expect(page.getByText("@PMAgent").first()).toBeVisible();
  await expect(page.getByText("@ReviewAgent").first()).toBeVisible();
  await expect(page.getByText("触发消息").first()).toBeVisible();
  await expect(page.getByText("@PMAgent 基于客户反馈生成协作任务和 PRD 草稿").first()).toBeVisible();
  await expect(page.getByText("@ReviewAgent 检查当前房间的风险和遗漏项").first()).toBeVisible();
  await expect(page.getByText("生成的任务", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("生成的文档", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Project Review").first()).toBeVisible();
  await page.getByRole("button", { name: "详情" }).first().click();
  await expect(page.getByText("Run ID")).toBeVisible();
});

test("room creators select members and only invited users can enter the new room", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Room creation membership flow runs on desktop.");

  await loginAs(page, "business@feidingwei.local");

  await page.getByRole("button", { name: "新建项目房间" }).click();
  await page.getByLabel("房间名称").fill("客户访谈协作");
  await page.getByLabel("房间描述").fill("业务、产品和测试围绕客户访谈沉淀资料。");
  await page.getByRole("checkbox", { name: "Product" }).check();
  await page.getByLabel("Product 角色").selectOption("contributor");
  await page.getByRole("checkbox", { name: "QA" }).check();
  await page.getByLabel("QA 角色").selectOption("reviewer");
  await page.getByRole("button", { name: "创建房间" }).click();

  await expect(page.getByRole("heading", { name: "客户访谈协作" })).toBeVisible();
  await expect(page.getByText("业务、产品和测试围绕客户访谈沉淀资料。")).toBeVisible();
  await expect(page.getByRole("link", { name: "客户访谈协作" })).toBeVisible();
  await page.getByRole("button", { name: "智能体", exact: true }).click();
  await expect(page.getByText("@PMAgent").first()).toBeVisible();
  await expect(page.getByText("@ReviewAgent").first()).toBeVisible();

  const createdRoomUrl = page.url();

  await loginAs(page, "product@feidingwei.local");
  await expect(page.getByRole("link", { name: "客户访谈协作" })).toBeVisible();
  await page.getByRole("link", { name: "客户访谈协作" }).click();
  await expect(page).toHaveURL(createdRoomUrl);
  await expect(page.getByRole("heading", { name: "客户访谈协作" })).toBeVisible();

  await loginAs(page, "engineer@feidingwei.local");
  await expect(page.getByRole("link", { name: "客户访谈协作" })).not.toBeVisible();
  await page.goto(createdRoomUrl);
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
