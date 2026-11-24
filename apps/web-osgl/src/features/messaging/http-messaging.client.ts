import type { ChatMessage, MessagingClientPort } from "./messaging-client.port.js";
import { SimulatedMessagingClient } from "./simulated-messaging.client.js";

export class HttpMessagingClient implements MessagingClientPort {
  constructor(private readonly baseUrl: string) {}

  load(): Promise<readonly ChatMessage[]> {
    return Promise.resolve([]);
  }

  async send(
    channelId: string,
    authorName: string,
    branch: string,
    content: string,
    parentId: string | null,
  ): Promise<ChatMessage> {
    await fetch(`${this.baseUrl}/api/v1/channels/${channelId}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, parentMessageId: parentId }),
    });
    return {
      id: channelId,
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
  }

  react(): Promise<readonly ChatMessage[]> {
    return Promise.resolve([]);
  }

  pin(): Promise<readonly ChatMessage[]> {
    return Promise.resolve([]);
  }

  search(): Promise<readonly ChatMessage[]> {
    return Promise.resolve([]);
  }
}

export function createMessagingClient(): MessagingClientPort {
  if (import.meta.env.VITE_AUTH_CLIENT === "simulated") {
    return new SimulatedMessagingClient();
  }
  return new HttpMessagingClient(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000");
}
