import { Injectable } from "@nestjs/common";
import { createUlid, createUuidV7 } from "../../common/ids/id-generator.js";
import type { MessageStorePort, StoredMessage } from "./message-store.port.js";

const SEEDS: Readonly<Record<string, readonly string[]>> = {
  duyurular: ["Yarın 09:40 zümre toplantısı öğretmenler odasında yapılacak."],
  "ogretmenler-odasi": ["Çay demlendi. İkinci teneffüste öğretmenler odasındayız."],
  "matematik-zumresi": ["11-A türev denemesini paylaşıyorum. @Zeynep bakar mısın?"],
  "pdr-vaka-odasi": ["Vaka notu yalnızca rehberlik ekibinde kalacak. @PDR"],
};

@Injectable()
export class InMemoryMessageStore implements MessageStorePort {
  private readonly messages: StoredMessage[] = [];

  ensureSeed(channelId: string, institutionId: string, slug: string): void {
    if (this.messages.some((item) => item.channelId === channelId)) {
      return;
    }
    for (const content of SEEDS[slug] ?? []) {
      this.messages.push(blank(channelId, institutionId, content));
    }
  }

  page(
    channelId: string,
    parentMessageId: string | null,
    cursor: string | null,
    limit: number,
  ): readonly StoredMessage[] {
    return this.messages
      .filter(
        (item) =>
          item.channelId === channelId &&
          item.parentMessageId === parentMessageId &&
          item.deletedAt === null &&
          (cursor === null || item.id < cursor),
      )
      .sort((left, right) => (left.id < right.id ? 1 : -1))
      .slice(0, limit);
  }

  byId(messageId: string): StoredMessage | null {
    return this.messages.find((item) => item.id === messageId) ?? null;
  }

  save(message: StoredMessage): void {
    const index = this.messages.findIndex((item) => item.id === message.id);
    if (index === -1) {
      this.messages.push(message);
      return;
    }
    this.messages[index] = message;
  }

  all(): readonly StoredMessage[] {
    return this.messages;
  }
}

function blank(channelId: string, institutionId: string, content: string): StoredMessage {
  return {
    id: createUuidV7(),
    publicId: createUlid(),
    institutionId,
    channelId,
    authorId: "018f0000-0000-7000-8000-000000000003",
    parentMessageId: null,
    content,
    isPinned: false,
    editedAt: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    reactions: [],
    attachments: [],
  };
}
