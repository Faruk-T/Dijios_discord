import type { MessageSummary } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { TenantForbiddenException } from "../../common/errors/domain.exception.js";
import { createUlid, createUuidV7, parseUlid, parseUuidV7 } from "../../common/ids/id-generator.js";
import {
  SCHOOL_DIRECTORY_PORT,
  type SchoolDirectoryPort,
} from "../directory/school-directory.port.js";
import { ChatEvents } from "../realtime/chat-events.js";
import { ChannelAccessService } from "./channel-access.service.js";
import {
  MESSAGE_STORE_PORT,
  type MessageStorePort,
  type StoredMessage,
} from "./message-store.port.js";

@Injectable()
export class MessagesService {
  constructor(
    @Inject(MESSAGE_STORE_PORT) private readonly store: MessageStorePort,
    @Inject(ChannelAccessService) private readonly access: ChannelAccessService,
    @Inject(SCHOOL_DIRECTORY_PORT) private readonly directory: SchoolDirectoryPort,
    @Inject(ChatEvents) private readonly chat: ChatEvents,
  ) {}

  threadPage(auth: AuthContext, channelId: string, parentId: string): MessageSummary[] {
    this.access.require(auth, channelId, false);
    return this.store
      .page(channelId, parentId, null, 50)
      .map((item) => this.toSummary(item, auth.userId));
  }

  page(
    auth: AuthContext,
    channelId: string,
    cursor: string | null,
    limit: number,
  ): MessageSummary[] {
    const channel = this.access.require(auth, channelId, false);
    this.store.ensureSeed(channel.id, channel.institutionId, channel.slug);
    return this.store
      .page(channel.id, null, cursor, limit)
      .map((item) => this.toSummary(item, auth.userId));
  }

  create(
    auth: AuthContext,
    channelId: string,
    content: string,
    parentMessageId: string | null,
  ): MessageSummary {
    const channel = this.access.require(auth, channelId, true);
    this.store.ensureSeed(channel.id, channel.institutionId, channel.slug);
    const message: StoredMessage = {
      id: createUuidV7(),
      publicId: createUlid(),
      institutionId: auth.institutionId,
      channelId: channel.id,
      authorId: auth.userId,
      parentMessageId,
      content,
      isPinned: false,
      editedAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      reactions: [],
      attachments: [],
    };
    this.store.save(message);
    const summary = this.toSummary(message, auth.userId);
    this.chat.created(auth.institutionId, summary);
    return summary;
  }

  update(auth: AuthContext, messageId: string, content: string): MessageSummary {
    const current = this.owned(auth, messageId);
    const next = { ...current, content, editedAt: new Date().toISOString() };
    this.store.save(next);
    const summary = this.toSummary(next, auth.userId);
    this.chat.updated(auth.institutionId, summary);
    return summary;
  }

  remove(auth: AuthContext, messageId: string): void {
    const current = this.existing(messageId);
    const channel = this.access.require(auth, current.channelId, false);
    const flags = this.access.flags(auth, channel);
    if (current.authorId !== auth.userId && !flags.canManageChannel) {
      throw new TenantForbiddenException(
        "Only the author or a channel manager can delete this message.",
      );
    }
    const next = { ...current, deletedAt: new Date().toISOString() };
    this.store.save(next);
    this.chat.deleted(auth.institutionId, {
      channelId: parseUuidV7(current.channelId),
      messageId: parseUuidV7(current.id),
    });
  }

  toSummary(message: StoredMessage, viewerId: string): MessageSummary {
    const teacher = this.directory.findTeacherById(message.authorId);
    const replies = this.store.page(message.channelId, message.id, null, 100);
    return {
      id: parseUuidV7(message.id),
      publicId: parseUlid(message.publicId),
      channelId: parseUuidV7(message.channelId),
      author: {
        id: parseUuidV7(message.authorId),
        publicId: parseUlid(teacher?.publicId ?? "01JFEN000000000000000000E1"),
        fullName: teacher?.fullName ?? "Öğretmen",
        avatarUrl: teacher?.avatarUrl ?? null,
      },
      content: message.content,
      createdAt: message.createdAt as MessageSummary["createdAt"],
      editedAt: message.editedAt === null ? null : (message.editedAt as MessageSummary["editedAt"]),
      parentMessageId:
        message.parentMessageId === null ? null : parseUuidV7(message.parentMessageId),
      attachments: message.attachments.map((item) => ({
        id: parseUuidV7(item.id),
        fileName: item.fileName,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
      })),
      reactions: groupReactions(message, viewerId),
      embed: null,
      isPinned: message.isPinned,
      replyCount: replies.length,
    };
  }

  existing(messageId: string): StoredMessage {
    const message = this.store.byId(messageId);
    if (message === null || message.deletedAt !== null) {
      throw new TenantForbiddenException("Message is not available.");
    }
    return message;
  }

  private owned(auth: AuthContext, messageId: string): StoredMessage {
    const message = this.existing(messageId);
    this.access.require(auth, message.channelId, false);
    if (message.authorId !== auth.userId) {
      throw new TenantForbiddenException("Only the author can edit this message.");
    }
    return message;
  }
}

function groupReactions(message: StoredMessage, viewerId: string): MessageSummary["reactions"] {
  const emojis = [...new Set(message.reactions.map((item) => item.emoji))];
  return emojis.map((emoji) => ({
    emoji,
    count: message.reactions.filter((item) => item.emoji === emoji).length,
    reactedByMe: message.reactions.some((item) => item.emoji === emoji && item.userId === viewerId),
  }));
}
