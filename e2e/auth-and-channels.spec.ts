import { expect, test } from "@playwright/test";
import { signIn } from "./teacher-session.js";

test("two teachers open their own institution channels", async ({ browser }) => {
  const founder = await browser.newContext();
  const teacher = await browser.newContext();
  const ayse = await founder.newPage();
  const can = await teacher.newPage();
  await signIn(ayse, /Ayşe Kurucu/);
  await signIn(can, /Can Fizik/);
  await expect(ayse.getByRole("button", { name: /matematik-zumresi/ })).toBeVisible();
  await expect(can.getByRole("button", { name: /fizik-zumresi/ })).toBeVisible();
  await founder.close();
  await teacher.close();
});
