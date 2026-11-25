import type { ServerToClientEvents } from "@dijios-connect/contracts";
import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "../auth/auth.store.js";
import { toChatMessage } from "./message-summary.mapper.js";
import { useMessagingStore } from "./messaging.store.js";

function isDeleted(
  value: unknown,
): value is { readonly channelId: string; readonly messageId: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("channelId" in value) || !("messageId" in value)) {
    return false;
  }
  return (
    typeof value.channelId === "string" &&
    value.channelId.length > 0 &&
    typeof value.messageId === "string" &&
    value.messageId.length > 0
  );
}

export function useChatRealtime(): void {
  const token = useAuthStore((state) => state.session?.accessToken);
  useEffect(() => {
    if (
      token === undefined ||
      import.meta.env.MODE === "test" ||
      import.meta.env.VITE_AUTH_CLIENT === "simulated"
    ) {
      return;
    }
    const socket: Socket<ServerToClientEvents> = io(
      import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
      { auth: { token }, transports: ["websocket"] },
    );
    socket.on("chat:message_created", (payload) => {
      const message = toChatMessage(payload);
      if (message !== null) {
        useMessagingStore.getState().applyLive(message);
      }
    });
    socket.on("chat:message_updated", (payload) => {
      const message = toChatMessage(payload);
      if (message !== null) {
        useMessagingStore.getState().applyLive(message);
      }
    });
    socket.on("chat:message_deleted", (payload) => {
      if (!isDeleted(payload)) {
        return;
      }
      useMessagingStore.getState().applyRemoved(payload.channelId, payload.messageId);
    });
    return () => {
      socket.close();
    };
  }, [token]);
}
