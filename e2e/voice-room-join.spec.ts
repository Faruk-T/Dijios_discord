import { expect, test } from "@playwright/test";
import { signIn } from "./teacher-session.js";

test("two teachers join the math voice room with fake media", async ({ browser }) => {
  const left = await browser.newContext();
  const right = await browser.newContext();
  const zeynep = await left.newPage();
  const elif = await right.newPage();
  await signIn(zeynep, /Zeynep Başaran/);
  await signIn(elif, /Elif Rehber/);
  await zeynep.getByRole("button", { name: "🔊 Matematik Zümresi" }).click();
  await elif.getByRole("button", { name: "🔊 Matematik Zümresi" }).click();
  await zeynep.getByRole("button", { name: "Sesli Odaya Katıl" }).click();
  await elif.getByRole("button", { name: "Sesli Odaya Katıl" }).click();
  await expect(zeynep.getByRole("button", { name: "Ayrıl" })).toBeVisible();
  await expect(elif.getByRole("button", { name: "Ayrıl" })).toBeVisible();
  await left.close();
  await right.close();
});
