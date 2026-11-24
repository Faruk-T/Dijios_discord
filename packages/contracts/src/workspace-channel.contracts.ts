import type { Ulid, UuidV7 } from "./primitives.contracts.js";

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
