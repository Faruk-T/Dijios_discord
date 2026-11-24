import type { MessageSummary } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { ChatEvents } from "../realtime/chat-events.js";
import { ChannelAccessService } from "./channel-access.service.js";
import { MessagesService } from "./messages.service.js";
import { MESSAGE_STORE_PORT, type MessageStorePort } from "./message-store.port.js";

@Injectable()
export class ReactionsService {
  constructor(
    @Inject(MESSAGE_STORE_PORT) private readonly store: MessageStorePort,
    @Inject(MessagesService) private readonly messages: MessagesService,
    @Inject(ChannelAccessService) private readonly access: ChannelAccessService,
    @Inject(ChatEvents) private readonly chat: ChatEvents,
  ) {}

  toggle(auth: AuthContext, messageId: string, emoji: string): MessageSummary {
    const current = this.messages.existing(messageId);
    this.access.require(auth, current.channelId, true);
    const exists = current.reactions.some(
      (item) => item.userId === auth.userId && item.emoji === emoji,
    );
    const reactions = exists
      ? current.reactions.filter((item) => item.userId !== auth.userId || item.emoji !== emoji)
      : [...current.reactions, { userId: auth.userId, emoji }];
    const next = { ...current, reactions };
    this.store.save(next);
    const summary = this.messages.toSummary(next, auth.userId);
    this.chat.updated(auth.institutionId, summary);
    return summary;
  }
}
