import { expect, test } from "@playwright/test";
import { openMathChannel, signIn } from "./teacher-session.js";

test("a math note appears live in the second browser", async ({ browser }) => {
  const left = await browser.newContext();
  const right = await browser.newContext();
  const zeynep = await left.newPage();
  const can = await right.newPage();
  await signIn(zeynep, /Zeynep Başaran/);
  await signIn(can, /Can Fizik/);
  await openMathChannel(zeynep);
  await openMathChannel(can);
  await expect(can.getByText("11-A türev denemesini paylaşıyorum.")).toBeVisible();
  await zeynep.getByRole("textbox", { name: "Mesaj" }).fill("Cuma taraması zümre notu");
  await zeynep.getByRole("button", { name: "Gönder" }).click();
  await expect(
    can.getByRole("paragraph").filter({ hasText: "Cuma taraması zümre notu" }),
  ).toBeVisible();
  await left.close();
  await right.close();
});
