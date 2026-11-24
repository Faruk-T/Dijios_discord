import { describe, expect, it } from "vitest";
import { resolveTimetablePresence } from "./timetable-presence.resolver.js";

const math = [
  {
    kind: "IN_CLASS" as const,
    startMinute: 8 * 60,
    endMinute: 8 * 60 + 40,
    label: "11-A Matematik Dersinde",
  },
];

describe("timetable presence", () => {
  it("counts remaining class minutes and keeps do-not-disturb", () => {
    const during = resolveTimetablePresence({
      now: new Date(2026, 10, 24, 8, 26, 0),
      slots: math,
      manual: null,
      inVoice: false,
    });
    const quiet = resolveTimetablePresence({
      now: new Date(2026, 10, 24, 8, 26, 0),
      slots: math,
      manual: "DND",
      inVoice: true,
    });
    expect(during).toEqual({
      status: "IN_CLASS",
      currentLesson: "11-A Matematik Dersinde · 14 dk kaldı",
    });
    expect(quiet.status).toBe("DND");
  });
});
