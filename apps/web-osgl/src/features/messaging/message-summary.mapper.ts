import type { ChatMessage, ChatReaction } from "./messaging-client.port.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readReaction(value: unknown): ChatReaction | null {
  if (!isRecord(value) || text(value.emoji) === null || typeof value.count !== "number") {
    return null;
  }
  const emoji = text(value.emoji);
  return emoji === null ? null : { emoji, count: value.count, mine: value.reactedByMe === true };
}

export function toChatMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value) || text(value.id) === null || text(value.content) === null) {
    return null;
  }
  const author = isRecord(value.author) ? value.author : null;
  const authorName = author === null ? null : text(author.fullName);
  const id = text(value.id);
  const content = text(value.content);
  if (authorName === null || id === null || content === null) {
    return null;
  }
  const attachments = Array.isArray(value.attachments) ? value.attachments : [];
  const file = attachments.find(isRecord);
  const fileName = file === undefined ? null : text(file.fileName);
  const size = file !== undefined && typeof file.sizeBytes === "number" ? file.sizeBytes : 0;
  return {
    id,
    channelId: text(value.channelId) ?? "",
    authorName,
    branch: author === null ? "" : (text(author.branchName) ?? ""),
    content,
    createdAt: text(value.createdAt) ?? "",
    edited: text(value.editedAt) !== null,
    reactions: Array.isArray(value.reactions)
      ? value.reactions.flatMap((item) => {
          const reaction = readReaction(item);
          return reaction === null ? [] : [reaction];
        })
      : [],
    replyCount: typeof value.replyCount === "number" ? value.replyCount : 0,
    parentId: text(value.parentMessageId),
    attachment: fileName === null ? null : `📄 ${fileName} · ${size}`,
    pinned: value.isPinned === true,
  };
}

export function hitToChat(value: unknown): ChatMessage | null {
  if (
    !isRecord(value) ||
    text(value.messageId) === null ||
    text(value.channelId) === null ||
    text(value.excerpt) === null
  ) {
    return null;
  }
  const id = text(value.messageId);
  const channelId = text(value.channelId);
  const excerpt = text(value.excerpt);
  if (id === null || channelId === null || excerpt === null) {
    return null;
  }
  return {
    id,
    channelId,
    authorName: text(value.channelName) ?? "",
    branch: "",
    content: excerpt,
    createdAt: "",
    edited: false,
    reactions: [],
    replyCount: 0,
    parentId: null,
    attachment: null,
    pinned: false,
  };
}
