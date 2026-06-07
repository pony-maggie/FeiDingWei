import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test.beforeEach(() => {
  execSync("npm run prisma:seed", { stdio: "inherit" });
});

test("project room turns an agent mention into draft artifacts", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "智能体项目房间" })).toBeVisible();
  await expect(page.getByText("人和 AI 智能体把讨论转成项目成果。")).toBeVisible();
  await expect(page.getByRole("heading", { name: "对话" })).toBeVisible();
  await page.getByRole("button", { name: "设置" }).click();
  await page.getByRole("menuitem", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Agent Project Room" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chat" })).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("menuitem", { name: "中文" }).click();
  await expect(page.getByRole("heading", { name: "智能体项目房间" })).toBeVisible();

  await page
    .getByPlaceholder("@PMAgent 总结讨论并创建任务草稿")
    .fill("@PMAgent summarize this discussion and create draft tasks");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(page.getByText("产品智能体已创建任务草稿")).toBeVisible();

  await page.getByRole("button", { name: "任务" }).click();
  await expect(page.getByRole("heading", { name: "任务" })).toBeVisible();
  await expect(page.getByText("明确 MVP 成功标准")).toBeVisible();
  await page.getByRole("button", { name: "批准" }).first().click();
  await expect(page.getByText("已生效").first()).toBeVisible();

  await page.getByRole("button", { name: "文档" }).click();
  await expect(page.getByText("PRD 草稿", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "智能体", exact: true }).click();
  await expect(page.getByText("产品智能体", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("已完成")).toBeVisible();
});
