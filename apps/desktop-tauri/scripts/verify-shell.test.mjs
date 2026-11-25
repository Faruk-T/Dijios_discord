import assert from "node:assert/strict";
import test from "node:test";
import { assertDesktopShell } from "./verify-shell.mjs";

test("the tray and the global push-to-talk shortcut are wired", () => {
  assert.doesNotThrow(() => assertDesktopShell(new URL("../", import.meta.url)));
});
