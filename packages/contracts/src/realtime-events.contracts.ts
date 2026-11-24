import type { CampusBroadcastAlert } from "./academic-bridge.contracts.js";
import type { MessageSummary } from "./messaging.contracts.js";
import type { IsoTimestamp, Ulid, UuidV7 } from "./primitives.contracts.js";
import type { PresenceStatus } from "./tenant-auth.contracts.js";

export interface VoiceStateFlags {
  readonly selfMuted: boolean;
  readonly selfDeafened: boolean;
  readonly cameraEnabled: boolean;
  readonly screenSharing: boolean;
  readonly handRaised: boolean;
}

export interface VoiceParticipantSnapshot {
  readonly userId: UuidV7;
  readonly displayName: string;
  readonly livekitIdentity: string;
  readonly speaking: boolean;
  readonly flags: VoiceStateFlags;
}

export interface ChatMessageSendPayload {
  readonly channelId: UuidV7;
  readonly clientMessageId: Ulid;
  readonly content: string;
  readonly parentMessageId?: UuidV7;
}

export interface TypingSignalPayload {
  readonly channelId: UuidV7;
}

export interface PresenceHeartbeatPayload {
  readonly status: PresenceStatus;
}

export interface HandRaisePayload {
  readonly channelId: UuidV7;
  readonly raised: boolean;
}

export interface MessageDeletedPayload {
  readonly channelId: UuidV7;
  readonly messageId: UuidV7;
}

export interface TypingBroadcastPayload {
  readonly channelId: UuidV7;
  readonly userId: UuidV7;
  readonly active: boolean;
}

export interface PresenceUpdatedPayload {
  readonly userId: UuidV7;
  readonly status: PresenceStatus;
  readonly currentLesson: string | null;
  readonly observedAt: IsoTimestamp;
}

export interface VoiceRoomStatePayload {
  readonly channelId: UuidV7;
  readonly participants: readonly VoiceParticipantSnapshot[];
}

export interface ClientToServerEvents {
  "chat:message_send": (payload: ChatMessageSendPayload) => void;
  "chat:typing_start": (payload: TypingSignalPayload) => void;
  "chat:typing_stop": (payload: TypingSignalPayload) => void;
  "presence:heartbeat": (payload: PresenceHeartbeatPayload) => void;
  "voice:hand_raise": (payload: HandRaisePayload) => void;
}

export interface ServerToClientEvents {
  "chat:message_created": (message: MessageSummary) => void;
  "chat:message_updated": (message: MessageSummary) => void;
  "chat:message_deleted": (payload: MessageDeletedPayload) => void;
  "chat:typing": (payload: TypingBroadcastPayload) => void;
  "presence:updated": (payload: PresenceUpdatedPayload) => void;
  "voice:room_state_updated": (payload: VoiceRoomStatePayload) => void;
  "campus:broadcast": (alert: CampusBroadcastAlert) => void;
}
