import { describe, expect, it } from "vitest";
import { desktopPttPressed } from "./desktop-ptt.js";

describe("desktop push to talk", () => {
  it("maps the tray shortcut payload onto the microphone", () => {
    expect(desktopPttPressed("down")).toBe(true);
    expect(desktopPttPressed("up")).toBe(false);
    expect(desktopPttPressed("idle")).toBeNull();
  });
});
