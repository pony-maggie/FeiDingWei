import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test.beforeEach(() => {
  execSync("npm run prisma:seed", { stdio: "inherit" });
});

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
  await expect(page.getByText("PRD Draft", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Agents" }).click();
  await expect(page.getByText("PM Agent", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("completed")).toBeVisible();
});
