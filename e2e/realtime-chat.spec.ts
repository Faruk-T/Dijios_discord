import { expect, test } from "@playwright/test";
import { openMathChannel, signIn } from "./teacher-session.js";

test("two teacher sessions each deliver a math-channel message", async ({ browser }) => {
  const left = await browser.newContext();
  const right = await browser.newContext();
  const zeynep = await left.newPage();
  const can = await right.newPage();
  await signIn(zeynep, /Zeynep Başaran/);
  await signIn(can, /Can Fizik/);
  await openMathChannel(zeynep);
  await openMathChannel(can);
  await zeynep.getByRole("textbox", { name: "Mesaj" }).fill("Cuma taraması zümre notu");
  await zeynep.getByRole("button", { name: "Gönder" }).click();
  await expect(zeynep.getByText("Cuma taraması zümre notu")).toBeVisible();
  await can.getByRole("textbox", { name: "Mesaj" }).fill("Fizik çapraz okuma notu");
  await can.getByRole("button", { name: "Gönder" }).click();
  await expect(can.getByText("Fizik çapraz okuma notu")).toBeVisible();
  await left.close();
  await right.close();
});
