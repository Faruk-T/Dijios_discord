import type {
  PresenceStatus,
  PresenceUpdatedPayload,
  TeacherRosterEntry,
  VoiceParticipantSnapshot,
  VoiceRoomStatePayload,
} from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import { parseUlid, parseUuidV7 } from "../../common/ids/id-generator.js";
import {
  SCHOOL_DIRECTORY_PORT,
  type SchoolDirectoryPort,
} from "../directory/school-directory.port.js";
import { resolveTimetablePresence, type TimetableSlot } from "./timetable-presence.resolver.js";

const MATH_CLASS: readonly TimetableSlot[] = [
  {
    kind: "IN_CLASS",
    startMinute: 8 * 60,
    endMinute: 8 * 60 + 40,
    label: "11-A Matematik Dersinde",
  },
];
const DUTY: readonly TimetableSlot[] = [
  { kind: "ON_DUTY", startMinute: 9 * 60, endMinute: 9 * 60 + 20, label: "2. Kat Koridor Nöbeti" },
];

interface LiveState {
  readonly manual: PresenceStatus | null;
  readonly lastSeenAt: string;
}

export interface PresencePublisher {
  presence: (institutionId: string, payload: PresenceUpdatedPayload) => void;
  voice: (institutionId: string, payload: VoiceRoomStatePayload) => void;
}

@Injectable()
export class PresenceService {
  private readonly live = new Map<string, LiveState>();
  private readonly channels = new Map<string, string>();
  private publisher: PresencePublisher | null = null;
  now: () => Date = () => new Date();

  constructor(@Inject(SCHOOL_DIRECTORY_PORT) private readonly directory: SchoolDirectoryPort) {}

  bind(publisher: PresencePublisher): void {
    this.publisher = publisher;
  }

  attachChannel(slug: string, channelId: string): void {
    this.channels.set(slug, channelId);
  }

  occupants(slug: string): readonly VoiceParticipantSnapshot[] {
    if (slug !== "matematik-zumresi-ses") {
      return [];
    }
    return [
      person("018f0000-0000-7000-8000-000000000005", "Zeynep Başaran", true),
      person("018f0000-0000-7000-8000-000000000004", "Mehmet Müdür", false),
    ];
  }

  heartbeat(institutionId: string, userId: string, status: PresenceStatus): void {
    const manual = status === "IN_CLASS" ? null : status;
    this.live.set(userId, { manual, lastSeenAt: this.now().toISOString() });
    this.publishTeacher(institutionId, userId);
  }

  roster(institutionId: string): readonly TeacherRosterEntry[] {
    return this.directory.listTeachers(institutionId).map((teacher) => this.entry(teacher));
  }

  private entry(teacher: {
    readonly id: string;
    readonly publicId: string;
    readonly fullName: string;
    readonly title: string;
    readonly branchName: string;
    readonly systemRole: TeacherRosterEntry["systemRole"];
  }): TeacherRosterEntry {
    const state = this.live.get(teacher.id);
    const voiceId = this.voiceChannelFor(teacher.id);
    const resolved = resolveTimetablePresence({
      now: this.now(),
      slots: slotsFor(teacher.id),
      manual: state?.manual ?? null,
      inVoice: voiceId !== null,
    });
    return {
      userId: parseUuidV7(teacher.id),
      publicId: parseUlid(teacher.publicId),
      fullName: teacher.fullName,
      title: teacher.title,
      branchName: teacher.branchName,
      systemRole: teacher.systemRole,
      status: resolved.status,
      currentLesson: resolved.currentLesson,
      activeVoiceChannelId: voiceId === null ? null : parseUuidV7(voiceId),
    };
  }

  private voiceChannelFor(userId: string): string | null {
    if (
      userId !== "018f0000-0000-7000-8000-000000000005" &&
      userId !== "018f0000-0000-7000-8000-000000000004"
    ) {
      return null;
    }
    return this.channels.get("matematik-zumresi-ses") ?? null;
  }

  private publishTeacher(institutionId: string, userId: string): void {
    const teacher = this.directory.findTeacherById(userId);
    if (teacher === null) {
      return;
    }
    const entry = this.entry(teacher);
    this.publisher?.presence(institutionId, {
      userId: entry.userId,
      status: entry.status,
      currentLesson: entry.currentLesson,
      observedAt: (this.live.get(userId)?.lastSeenAt ??
        this.now().toISOString()) as PresenceUpdatedPayload["observedAt"],
    });
    const channelId = this.channels.get("matematik-zumresi-ses");
    if (channelId !== undefined) {
      this.publisher?.voice(institutionId, {
        channelId: parseUuidV7(channelId),
        participants: this.occupants("matematik-zumresi-ses"),
      });
    }
  }
}

function slotsFor(userId: string): readonly TimetableSlot[] {
  if (userId === "018f0000-0000-7000-8000-000000000005") {
    return MATH_CLASS;
  }
  if (userId === "018f0000-0000-7000-8000-000000000008") {
    return DUTY;
  }
  return [];
}

function person(userId: string, displayName: string, speaking: boolean): VoiceParticipantSnapshot {
  return {
    userId: parseUuidV7(userId),
    displayName,
    livekitIdentity: userId,
    speaking,
    flags: {
      selfMuted: false,
      selfDeafened: false,
      cameraEnabled: false,
      screenSharing: false,
      handRaised: false,
    },
  };
}
