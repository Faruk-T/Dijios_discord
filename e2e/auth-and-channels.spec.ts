import { expect, test } from "@playwright/test";
import { signIn } from "./teacher-session.js";

test("hides the counseling room and lets the counselor open a poll", async ({ browser }) => {
  const math = await browser.newContext();
  const counseling = await browser.newContext();
  const zeynep = await math.newPage();
  const elif = await counseling.newPage();
  await signIn(zeynep, /Zeynep Başaran/);
  await signIn(elif, /Elif Rehber/);
  await expect(zeynep.getByRole("button", { name: /matematik-zumresi/ })).toBeVisible();
  await expect(zeynep.getByRole("button", { name: /pdr-vaka-odasi/ })).toHaveCount(0);
  await expect(elif.getByRole("button", { name: /pdr-vaka-odasi/ })).toBeVisible();
  await elif
    .getByRole("button", { name: /matematik-zumresi/ })
    .first()
    .click();
  await elif.getByRole("button", { name: "🗳️ Hızlı Oylama" }).click();
  const friday = elif.getByRole("button", { name: /Cuma %/ });
  await expect(friday).toBeVisible();
  await friday.click();
  await expect(elif.getByRole("button", { name: /Cuma %56/ })).toBeVisible();
  await math.close();
  await counseling.close();
});
