import type { MessageSummary } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { MessagesService } from "./messages.service.js";

@Injectable()
export class ThreadsService {
  constructor(@Inject(MessagesService) private readonly messages: MessagesService) {}

  list(auth: AuthContext, messageId: string): readonly MessageSummary[] {
    const root = this.messages.existing(messageId);
    return this.messages.threadPage(auth, root.channelId, root.id);
  }

  reply(auth: AuthContext, messageId: string, content: string): MessageSummary {
    const root = this.messages.existing(messageId);
    return this.messages.create(auth, root.channelId, content, root.id);
  }
}
