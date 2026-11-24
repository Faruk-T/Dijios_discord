import type { IsoTimestamp, Ulid, UuidV7 } from "./primitives.contracts.js";
import type { AuthorSummary } from "./tenant-auth.contracts.js";

export const MESSAGE_EMBED_KINDS = {
  SHEETGL: "sheetgl",
  STUDENT360: "student360",
  POLL: "poll",
  FILE: "file",
  AUDIO: "audio",
} as const;

export type MessageEmbedKind = (typeof MESSAGE_EMBED_KINDS)[keyof typeof MESSAGE_EMBED_KINDS];

export interface AttachmentMetadata {
  readonly id: UuidV7;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
}

export interface MessageEmbedPayload {
  readonly kind: MessageEmbedKind;
  readonly title: string;
  readonly refId: Ulid;
}

export interface MessageReactionSummary {
  readonly emoji: string;
  readonly count: number;
  readonly reactedByMe: boolean;
}

export interface MessageSummary {
  readonly id: UuidV7;
  readonly publicId: Ulid;
  readonly channelId: UuidV7;
  readonly author: AuthorSummary;
  readonly content: string;
  readonly createdAt: IsoTimestamp;
  readonly editedAt: IsoTimestamp | null;
  readonly parentMessageId: UuidV7 | null;
  readonly attachments: readonly AttachmentMetadata[];
  readonly reactions: readonly MessageReactionSummary[];
  readonly embed: MessageEmbedPayload | null;
  readonly isPinned: boolean;
  readonly replyCount: number;
}

export interface CreateMessageRequestDto {
  readonly content: string;
  readonly parentMessageId?: UuidV7;
}

export interface UpdateMessageRequestDto {
  readonly content: string;
}

export interface ToggleReactionRequestDto {
  readonly emoji: string;
}

export interface ChannelUnreadSummary {
  readonly channelId: UuidV7;
  readonly unreadCount: number;
  readonly mentionCount: number;
}

export interface MessageSearchHit {
  readonly channelId: UuidV7;
  readonly channelName: string;
  readonly messageId: UuidV7;
  readonly excerpt: string;
}

export interface ThreadSummary {
  readonly id: UuidV7;
  readonly publicId: Ulid;
  readonly channelId: UuidV7;
  readonly rootMessageId: UuidV7;
  readonly title: string;
  readonly replyCount: number;
}
