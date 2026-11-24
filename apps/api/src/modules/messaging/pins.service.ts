import type { MessageSummary } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { TenantForbiddenException } from "../../common/errors/domain.exception.js";
import { ChatEvents } from "../realtime/chat-events.js";
import { ChannelAccessService } from "./channel-access.service.js";
import { MessagesService } from "./messages.service.js";
import { MESSAGE_STORE_PORT, type MessageStorePort } from "./message-store.port.js";

@Injectable()
export class PinsService {
  constructor(
    @Inject(MESSAGE_STORE_PORT) private readonly store: MessageStorePort,
    @Inject(MessagesService) private readonly messages: MessagesService,
    @Inject(ChannelAccessService) private readonly access: ChannelAccessService,
    @Inject(ChatEvents) private readonly chat: ChatEvents,
  ) {}

  pin(auth: AuthContext, messageId: string): MessageSummary {
    const current = this.messages.existing(messageId);
    const channel = this.access.require(auth, current.channelId, false);
    if (!this.access.canPin(auth, channel)) {
      throw new TenantForbiddenException("Only campus leaders can pin this message.");
    }
    const next = { ...current, isPinned: !current.isPinned };
    this.store.save(next);
    const summary = this.messages.toSummary(next, auth.userId);
    this.chat.updated(auth.institutionId, summary);
    return summary;
  }

  list(auth: AuthContext, channelId: string): readonly MessageSummary[] {
    this.access.require(auth, channelId, false);
    return this.store
      .page(channelId, null, null, 100)
      .filter((item) => item.isPinned)
      .map((item) => this.messages.toSummary(item, auth.userId));
  }
}
