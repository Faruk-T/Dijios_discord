import type { JSX } from "react";
import { Avatar } from "truncgil-uxigl";
import { SheetMessageEmbed } from "../academic-tools/SheetMessageEmbed.js";
import type { ChatMessage } from "./messaging-client.port.js";
import { useMessagingStore } from "./messaging.store.js";

const EMOJIS = ["👍", "👏", "✅", "❓"] as const;

export function MessageBubbleRow({
  message,
  channelId,
}: {
  readonly message: ChatMessage;
  readonly channelId: string;
}): JSX.Element {
  const react = useMessagingStore((state) => state.react);
  const pin = useMessagingStore((state) => state.pin);
  const openThread = useMessagingStore((state) => state.openThread);
  return (
    <article className="msg-row">
      <Avatar shape="squircle" size="sm" name={message.authorName} status="online" />
      <div>
        <header>
          <strong>{message.authorName}</strong>
          <em>{message.branch}</em>
          <time>{message.createdAt}</time>
          {message.edited ? <small>(düzenlendi)</small> : null}
          {message.pinned ? <small>Sabit</small> : null}
        </header>
        <p>{highlight(message.content)}</p>
        {message.content.startsWith("📊") ? <SheetMessageEmbed title={message.content} /> : null}
        {message.attachment !== null ? <div className="msg-file">{message.attachment}</div> : null}
        <div className="msg-reactions">
          {message.reactions.map((item) => (
            <button
              key={item.emoji}
              type="button"
              onClick={() => void react(channelId, message.id, item.emoji)}
            >
              {item.emoji} {item.count}
            </button>
          ))}
        </div>
        <div className="msg-actions">
          <button type="button" onClick={() => openThread(message.id)}>
            Konu Aç ({message.replyCount})
          </button>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Tepki ${emoji}`}
              onClick={() => void react(channelId, message.id, emoji)}
            >
              {emoji}
            </button>
          ))}
          <button type="button" onClick={() => void pin(channelId, message.id)}>
            Sabitle
          </button>
        </div>
      </div>
    </article>
  );
}

function highlight(content: string): string {
  return content;
}
