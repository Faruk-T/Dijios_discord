import { useAuthStore } from "../auth/auth.store.js";
import type { ChatMessage, MessagingClientPort } from "./messaging-client.port.js";
import { hitToChat, toChatMessage } from "./message-summary.mapper.js";
import { SimulatedMessagingClient } from "./simulated-messaging.client.js";

export class HttpMessagingClient implements MessagingClientPort {
  private readonly fallback = new SimulatedMessagingClient();

  constructor(private readonly baseUrl: string) {}

  load(channelId: string, slug: string): Promise<readonly ChatMessage[]> {
    return this.readList(
      `/api/v1/channels/${channelId}/messages`,
      () => this.fallback.load(channelId, slug),
      toChatMessage,
    );
  }

  async send(
    channelId: string,
    authorName: string,
    branch: string,
    content: string,
    parentId: string | null,
  ): Promise<ChatMessage> {
    const path =
      parentId === null
        ? `/api/v1/channels/${channelId}/messages`
        : `/api/v1/messages/${parentId}/thread`;
    const body = await this.write(path, { content }, () =>
      this.fallback.send(channelId, authorName, branch, content, parentId),
    );
    if (isChat(body)) {
      return body;
    }
    const mapped = toChatMessage(body);
    if (mapped === null) {
      throw new Error("Message response was not recognized.");
    }
    return mapped;
  }

  react(channelId: string, messageId: string, emoji: string): Promise<readonly ChatMessage[]> {
    return this.afterWrite(
      `/api/v1/messages/${messageId}/reactions`,
      { emoji },
      () => this.fallback.react(channelId, messageId, emoji),
      () => this.load(channelId, ""),
    );
  }

  pin(channelId: string, messageId: string): Promise<readonly ChatMessage[]> {
    return this.afterWrite(
      `/api/v1/messages/${messageId}/pin`,
      {},
      () => this.fallback.pin(channelId, messageId),
      () => this.load(channelId, ""),
    );
  }

  search(query: string): Promise<readonly ChatMessage[]> {
    const path = `/api/v1/workspaces/current/messages/search?q=${encodeURIComponent(query)}`;
    return this.readList(path, () => this.fallback.search(query), hitToChat);
  }

  private async readList(
    path: string,
    reserve: () => Promise<readonly ChatMessage[]>,
    map: (item: unknown) => ChatMessage | null,
  ): Promise<readonly ChatMessage[]> {
    const body = await this.write(path, null, reserve, "GET");
    if (Array.isArray(body) && body.every(isChat)) {
      return body;
    }
    if (!Array.isArray(body)) {
      return [];
    }
    return body.flatMap((item) => {
      const mapped = map(item);
      return mapped === null ? [] : [mapped];
    });
  }

  private async afterWrite(
    path: string,
    payload: unknown,
    reserve: () => Promise<readonly ChatMessage[]>,
    reload: () => Promise<readonly ChatMessage[]>,
  ): Promise<readonly ChatMessage[]> {
    const body = await this.write(path, payload, reserve);
    return isChatList(body) ? body : reload();
  }

  private async write(
    path: string,
    payload: unknown,
    reserve: () => Promise<ChatMessage | readonly ChatMessage[]>,
    method = "POST",
  ): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: bearerHeaders(),
        ...(payload === null ? {} : { body: JSON.stringify(payload) }),
      });
      if (!response.ok) {
        throw new Error(`Messaging request failed with ${response.status}`);
      }
      const body: unknown = await response.json();
      return body;
    } catch (error: unknown) {
      if (!isOffline(error)) {
        throw error;
      }
      return reserve();
    }
  }
}

function bearerHeaders(): HeadersInit {
  const token = useAuthStore.getState().session?.accessToken;
  return {
    "content-type": "application/json",
    ...(token === undefined ? {} : { authorization: `Bearer ${token}` }),
  };
}

function isOffline(error: unknown): boolean {
  return (
    error instanceof TypeError || (typeof navigator !== "undefined" && navigator.onLine === false)
  );
}

function isChat(value: unknown): value is ChatMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "authorName" in value &&
    "content" in value &&
    !("author" in value)
  );
}

function isChatList(value: unknown): value is readonly ChatMessage[] {
  return Array.isArray(value) && value.every(isChat);
}

export function createMessagingClient(): MessagingClientPort {
  if (import.meta.env.VITE_AUTH_CLIENT === "simulated") {
    return new SimulatedMessagingClient();
  }
  return new HttpMessagingClient(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000");
}
