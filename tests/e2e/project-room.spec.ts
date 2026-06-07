import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test.beforeEach(() => {
  execSync("npm run prisma:seed", { stdio: "inherit" });
});

test("project room turns an agent mention into draft artifacts", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Agent Project Room" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "对话" })).toBeVisible();
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Chat" })).toBeVisible();
  await expect(page.getByRole("button", { name: "中文" })).toBeVisible();
  await page.getByRole("button", { name: "中文" }).click();

  await page
    .getByPlaceholder("@PMAgent 总结讨论并创建任务草稿")
    .fill("@PMAgent summarize this discussion and create draft tasks");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(page.getByText("PM Agent created draft tasks")).toBeVisible();

  await page.getByRole("button", { name: "任务" }).click();
  await expect(page.getByRole("heading", { name: "任务" })).toBeVisible();
  await expect(page.getByText("Clarify MVP success criteria")).toBeVisible();
  await page.getByRole("button", { name: "批准" }).first().click();
  await expect(page.getByText("已生效").first()).toBeVisible();

  await page.getByRole("button", { name: "文档" }).click();
  await expect(page.getByText("PRD Draft", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "智能体" }).click();
  await expect(page.getByText("PM Agent", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("已完成")).toBeVisible();
});
