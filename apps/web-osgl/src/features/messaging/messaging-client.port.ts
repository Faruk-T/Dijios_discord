export interface ChatReaction {
  readonly emoji: string;
  readonly count: number;
  readonly mine: boolean;
}

export interface ChatMessage {
  readonly id: string;
  readonly channelId: string;
  readonly authorName: string;
  readonly branch: string;
  readonly content: string;
  readonly createdAt: string;
  readonly edited: boolean;
  readonly reactions: readonly ChatReaction[];
  readonly replyCount: number;
  readonly parentId: string | null;
  readonly attachment: string | null;
  readonly pinned: boolean;
}

export interface MessagingClientPort {
  load(channelId: string, slug: string): Promise<readonly ChatMessage[]>;
  send(
    channelId: string,
    authorName: string,
    branch: string,
    content: string,
    parentId: string | null,
  ): Promise<ChatMessage>;
  react(channelId: string, messageId: string, emoji: string): Promise<readonly ChatMessage[]>;
  pin(channelId: string, messageId: string): Promise<readonly ChatMessage[]>;
  search(query: string): Promise<readonly ChatMessage[]>;
}
