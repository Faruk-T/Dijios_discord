import { create } from "zustand";
import type { ChatMessage } from "./messaging-client.port.js";
import { createMessagingClient } from "./http-messaging.client.js";
import type { MessagingClientPort } from "./messaging-client.port.js";

interface MessagingState {
  readonly client: MessagingClientPort;
  readonly messages: readonly ChatMessage[];
  readonly activeThreadRootId: string | null;
  readonly typingName: string | null;
  readonly searchOpen: boolean;
  readonly hits: readonly ChatMessage[];
  load: (channelId: string, slug: string) => Promise<void>;
  send: (
    channelId: string,
    authorName: string,
    branch: string,
    content: string,
    parentId: string | null,
  ) => Promise<void>;
  react: (channelId: string, messageId: string, emoji: string) => Promise<void>;
  pin: (channelId: string, messageId: string) => Promise<void>;
  openThread: (messageId: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  search: (query: string) => Promise<void>;
  setTyping: (name: string | null) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  client: createMessagingClient(),
  messages: [],
  activeThreadRootId: null,
  typingName: null,
  searchOpen: false,
  hits: [],
  load: async (channelId, slug) => {
    set({ messages: await get().client.load(channelId, slug), activeThreadRootId: null });
  },
  send: async (channelId, authorName, branch, content, parentId) => {
    await get().client.send(channelId, authorName, branch, content, parentId);
    set({ messages: await get().client.load(channelId, ""), typingName: null });
  },
  react: async (channelId, messageId, emoji) => {
    set({ messages: await get().client.react(channelId, messageId, emoji) });
  },
  pin: async (channelId, messageId) => {
    set({ messages: await get().client.pin(channelId, messageId) });
  },
  openThread: (activeThreadRootId) => set({ activeThreadRootId }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  search: async (query) => set({ hits: await get().client.search(query), searchOpen: true }),
  setTyping: (typingName) => set({ typingName }),
}));
