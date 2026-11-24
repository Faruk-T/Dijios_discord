import type { PresenceStatus } from "@dijios-connect/contracts";

export interface TimetableSlot {
  readonly kind: "IN_CLASS" | "ON_DUTY";
  readonly startMinute: number;
  readonly endMinute: number;
  readonly label: string;
}

export interface ResolvedPresence {
  readonly status: PresenceStatus;
  readonly currentLesson: string | null;
}

export function resolveTimetablePresence(input: {
  readonly now: Date;
  readonly slots: readonly TimetableSlot[];
  readonly manual: PresenceStatus | null;
  readonly inVoice: boolean;
}): ResolvedPresence {
  if (input.manual === "DND") {
    return { status: "DND", currentLesson: null };
  }
  if (input.manual === "ONLINE" || input.manual === "ON_DUTY" || input.manual === "IN_VOICE") {
    return {
      status: input.manual,
      currentLesson: input.manual === "ON_DUTY" ? "2. Kat Koridor Nöbeti" : null,
    };
  }
  const minute = input.now.getHours() * 60 + input.now.getMinutes();
  const slot = input.slots.find((item) => minute >= item.startMinute && minute < item.endMinute);
  if (slot?.kind === "IN_CLASS") {
    return {
      status: "IN_CLASS",
      currentLesson: `${slot.label} · ${slot.endMinute - minute} dk kaldı`,
    };
  }
  if (slot?.kind === "ON_DUTY") {
    return { status: "ON_DUTY", currentLesson: slot.label };
  }
  if (input.inVoice) {
    return { status: "IN_VOICE", currentLesson: null };
  }
  return { status: "ONLINE", currentLesson: null };
}
