export interface StoredAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  objectKey: string;
}

export interface StoredReaction {
  userId: string;
  emoji: string;
}

export interface StoredMessage {
  id: string;
  publicId: string;
  institutionId: string;
  channelId: string;
  authorId: string;
  parentMessageId: string | null;
  content: string;
  isPinned: boolean;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  reactions: StoredReaction[];
  attachments: StoredAttachment[];
}

export interface MessageStorePort {
  ensureSeed(channelId: string, institutionId: string, slug: string): void;
  page(
    channelId: string,
    parentMessageId: string | null,
    cursor: string | null,
    limit: number,
  ): readonly StoredMessage[];
  byId(messageId: string): StoredMessage | null;
  save(message: StoredMessage): void;
  all(): readonly StoredMessage[];
}

export const MESSAGE_STORE_PORT = Symbol("MESSAGE_STORE_PORT");
