import type { PresenceStatus } from "@dijios-connect/contracts";
import { describe, expect, it } from "vitest";
import { shouldToast } from "./useSmartNotifications.js";

describe("smart notifications", () => {
  it("stays quiet during class and do-not-disturb", () => {
    const quiet: readonly PresenceStatus[] = ["IN_CLASS", "DND"];
    const audible: readonly PresenceStatus[] = ["ONLINE", "ON_DUTY", "IN_VOICE", "OFFLINE"];
    expect(quiet.every((status) => !shouldToast(status))).toBe(true);
    expect(audible.every((status) => shouldToast(status))).toBe(true);
  });
});
