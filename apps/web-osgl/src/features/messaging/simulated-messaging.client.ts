import type { ChatMessage, MessagingClientPort } from "./messaging-client.port.js";

const rooms = new Map<string, ChatMessage[]>();

const SEEDS: Readonly<Record<string, readonly string[]>> = {
  duyurular: ["Yarın 09:40 zümre toplantısı öğretmenler odasında."],
  "ogretmenler-odasi": ["Çay demlendi. İkinci teneffüste öğretmenler odasındayız."],
  "matematik-zumresi": ["11-A türev denemesini paylaşıyorum. @Zeynep"],
  "pdr-vaka-odasi": ["Vaka notu yalnızca rehberlik ekibinde kalacak."],
};

export class SimulatedMessagingClient implements MessagingClientPort {
  load(channelId: string, slug: string): Promise<readonly ChatMessage[]> {
    if (!rooms.has(channelId)) {
      rooms.set(
        channelId,
        (SEEDS[slug] ?? []).map((content, index) => ({
          id: `${channelId}-${index}`,
          channelId,
          authorName: "Ayşe Kurucu",
          branch: "Yönetim",
          content,
          createdAt: "09:12",
          edited: false,
          reactions: [],
          replyCount: 0,
          parentId: null,
          attachment: slug === "matematik-zumresi" ? "📄 11-Sinif-Turev-Deneme.pdf · 1.4 MB" : null,
          pinned: false,
        })),
      );
    }
    return Promise.resolve(rooms.get(channelId) ?? []);
  }

  send(
    channelId: string,
    authorName: string,
    branch: string,
    content: string,
    parentId: string | null,
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: `${channelId}-${Date.now()}`,
      channelId,
      authorName,
      branch,
      content,
      createdAt: "şimdi",
      edited: false,
      reactions: [],
      replyCount: 0,
      parentId,
      attachment: null,
      pinned: false,
    };
    const next = [...(rooms.get(channelId) ?? []), message].map((item) =>
      item.id === parentId ? { ...item, replyCount: item.replyCount + 1 } : item,
    );
    rooms.set(channelId, next);
    return Promise.resolve(message);
  }

  react(channelId: string, messageId: string, emoji: string): Promise<readonly ChatMessage[]> {
    const next = (rooms.get(channelId) ?? []).map((item) =>
      item.id === messageId ? { ...item, reactions: toggle(item.reactions, emoji) } : item,
    );
    rooms.set(channelId, next);
    return Promise.resolve(next);
  }

  pin(channelId: string, messageId: string): Promise<readonly ChatMessage[]> {
    const next = (rooms.get(channelId) ?? []).map((item) =>
      item.id === messageId ? { ...item, pinned: !item.pinned } : item,
    );
    rooms.set(channelId, next);
    return Promise.resolve(next);
  }

  search(query: string): Promise<readonly ChatMessage[]> {
    const needle = query.toLocaleLowerCase("tr-TR");
    const hits = [...rooms.values()].flat().filter((item) => {
      const file = item.attachment?.toLocaleLowerCase("tr-TR") ?? "";
      return item.content.toLocaleLowerCase("tr-TR").includes(needle) || file.includes(needle);
    });
    return Promise.resolve(hits);
  }
}

function toggle(
  reactions: readonly ChatMessage["reactions"][number][],
  emoji: string,
): ChatMessage["reactions"] {
  const current = reactions.find((item) => item.emoji === emoji);
  if (current?.mine) {
    return reactions.filter((item) => item.emoji !== emoji);
  }
  if (current !== undefined) {
    return reactions.map((item) =>
      item.emoji === emoji ? { ...item, count: item.count + 1, mine: true } : item,
    );
  }
  return [...reactions, { emoji, count: 1, mine: true }];
}
