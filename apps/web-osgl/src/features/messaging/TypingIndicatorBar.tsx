import type { JSX } from "react";
import { useMessagingStore } from "./messaging.store.js";

export function TypingIndicatorBar(): JSX.Element | null {
  const typingName = useMessagingStore((state) => state.typingName);
  if (typingName === null) return null;
  return <p className="msg-typing">{typingName} yazıyor...</p>;
}
