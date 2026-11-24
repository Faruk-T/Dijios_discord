import type { PresenceStatus } from "@dijios-connect/contracts";
import { useEffect, useRef } from "react";
import { useToast } from "truncgil-uxigl";
import { useWorkspaceStore } from "../servers-channels/workspace.store.js";
import type { ChatMessage } from "./messaging-client.port.js";

export function shouldToast(status: PresenceStatus): boolean {
  return status !== "IN_CLASS" && status !== "DND";
}

export function useSmartNotifications(messages: readonly ChatMessage[]): void {
  const status = useWorkspaceStore((state) => state.status);
  const toast = useToast();
  const seen = useRef(messages.length);
  useEffect(() => {
    const latest = messages[messages.length - 1];
    if (messages.length > seen.current && latest !== undefined && shouldToast(status)) {
      const mentioned = latest.content.includes("@");
      if (mentioned || latest.parentId === null) {
        toast.notify({ title: latest.authorName, description: latest.content });
      }
    }
    seen.current = messages.length;
  }, [messages, status, toast]);
}
