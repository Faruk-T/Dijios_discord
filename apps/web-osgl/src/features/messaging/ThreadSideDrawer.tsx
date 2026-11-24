import type { JSX } from "react";
import { MessageBubbleRow } from "./MessageBubbleRow.js";
import { RichMessageComposer } from "./RichMessageComposer.js";
import { useMessagingStore } from "./messaging.store.js";

export function ThreadSideDrawer({
  channelId,
  authorName,
  branch,
}: {
  readonly channelId: string;
  readonly authorName: string;
  readonly branch: string;
}): JSX.Element | null {
  const rootId = useMessagingStore((state) => state.activeThreadRootId);
  const messages = useMessagingStore((state) => state.messages);
  const openThread = useMessagingStore((state) => state.openThread);
  if (rootId === null) return null;
  const replies = messages.filter((item) => item.parentId === rootId);
  return (
    <aside className="msg-thread" aria-label="Alt konu">
      <header>
        <strong>Alt konu</strong>
        <button type="button" onClick={() => openThread(null)}>
          Kapat
        </button>
      </header>
      {replies.map((message) => (
        <MessageBubbleRow key={message.id} message={message} channelId={channelId} />
      ))}
      <RichMessageComposer
        channelId={channelId}
        authorName={authorName}
        branch={branch}
        parentId={rootId}
      />
    </aside>
  );
}
