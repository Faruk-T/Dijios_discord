import { expect, type Page } from "@playwright/test";

export async function signIn(page: Page, name: RegExp): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name }).click();
  await expect(page.locator("#dock-communication-hub")).toBeVisible();
}

export async function openMathChannel(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: /matematik-zumresi/ })
    .first()
    .click();
  await expect(page.getByRole("textbox", { name: "Mesaj" })).toBeVisible();
}
