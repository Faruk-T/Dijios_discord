import type { Ulid, UuidV7 } from "./primitives.contracts.js";
import type { VoiceParticipantSnapshot } from "./realtime-events.contracts.js";
import type { AcademicSystemRole, PresenceStatus } from "./tenant-auth.contracts.js";

export const CHANNEL_TYPES = {
  TEXT: "TEXT",
  VOICE: "VOICE",
  VIDEO_STAGE: "VIDEO_STAGE",
  ANNOUNCEMENT: "ANNOUNCEMENT",
  DM: "DM",
} as const;

export type ChannelType = (typeof CHANNEL_TYPES)[keyof typeof CHANNEL_TYPES];

export interface ChannelPermissionFlags {
  readonly canView: boolean;
  readonly canSendMessages: boolean;
  readonly canConnectVoice: boolean;
  readonly canSpeak: boolean;
  readonly canShareScreen: boolean;
  readonly canManageChannel: boolean;
}

export interface ChannelCategorySummary {
  readonly id: UuidV7;
  readonly publicId: Ulid;
  readonly name: string;
  readonly position: number;
}

export interface ChannelSummary {
  readonly id: UuidV7;
  readonly publicId: Ulid;
  readonly institutionId: UuidV7;
  readonly categoryId: UuidV7 | null;
  readonly slug: string;
  readonly name: string;
  readonly type: ChannelType;
  readonly isPrivate: boolean;
  readonly maxParticipants: number | null;
  readonly position: number;
}

export interface ChannelWithOccupants extends ChannelSummary {
  readonly topic: string | null;
  readonly branchName: string | null;
  readonly isPdrConfidential: boolean;
  readonly permissions: ChannelPermissionFlags;
  readonly occupants: readonly VoiceParticipantSnapshot[];
}

export interface WorkspaceTreeCategory extends ChannelCategorySummary {
  readonly channels: readonly ChannelWithOccupants[];
}

export interface WorkspaceTreeResponse {
  readonly workspaceId: UuidV7;
  readonly institutionId: UuidV7;
  readonly categories: readonly WorkspaceTreeCategory[];
}

export interface CreateChannelRequestDto {
  readonly name: string;
  readonly slug: string;
  readonly type: ChannelType;
  readonly categoryId: UuidV7;
  readonly topic?: string;
  readonly branchName?: string;
  readonly isPrivate?: boolean;
  readonly isPdrConfidential?: boolean;
  readonly maxParticipants?: number | null;
}

export interface TeacherRosterEntry {
  readonly userId: UuidV7;
  readonly publicId: Ulid;
  readonly fullName: string;
  readonly title: string;
  readonly branchName: string;
  readonly systemRole: AcademicSystemRole;
  readonly status: PresenceStatus;
  readonly currentLesson: string | null;
  readonly activeVoiceChannelId: UuidV7 | null;
}
