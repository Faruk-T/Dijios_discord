import type { ChannelWithOccupants } from "@dijios-connect/contracts";
import type { JSX } from "react";
import { useEffect } from "react";
import { useAuthStore } from "../auth/auth.store.js";
import { MessageBubbleRow } from "./MessageBubbleRow.js";
import { MessageSearchModal } from "./MessageSearchModal.js";
import { RichMessageComposer } from "./RichMessageComposer.js";
import { ThreadSideDrawer } from "./ThreadSideDrawer.js";
import { TypingIndicatorBar } from "./TypingIndicatorBar.js";
import { useMessagingStore } from "./messaging.store.js";
import { useSmartNotifications } from "./useSmartNotifications.js";

export function ChannelChatPane({
  channel,
}: {
  readonly channel: ChannelWithOccupants;
}): JSX.Element {
  const session = useAuthStore((state) => state.session);
  const messages = useMessagingStore((state) => state.messages);
  const load = useMessagingStore((state) => state.load);
  const pins = messages.filter((item) => item.pinned && item.parentId === null);
  useEffect(() => {
    void load(channel.id, channel.slug);
  }, [channel.id, channel.slug, load]);
  useSmartNotifications(messages);
  return (
    <div className="msg-pane">
      <div className="msg-stream">
        {pins.length > 0 ? <div className="msg-pins">Sabitlenenler: {pins.length}</div> : null}
        {messages
          .filter((item) => item.parentId === null)
          .map((message) => (
            <MessageBubbleRow key={message.id} message={message} channelId={channel.id} />
          ))}
        <TypingIndicatorBar />
        {channel.permissions.canSendMessages ? (
          <RichMessageComposer
            channelId={channel.id}
            authorName={session?.fullName ?? "Öğretmen"}
            branch={session?.branchName ?? ""}
            parentId={null}
          />
        ) : (
          <p className="msg-readonly">
            Bu duyuru kanalında yalnızca okul yönetimi ve zümre başkanları paylaşım yapabilir.
          </p>
        )}
      </div>
      <ThreadSideDrawer
        channelId={channel.id}
        authorName={session?.fullName ?? "Öğretmen"}
        branch={session?.branchName ?? ""}
      />
      <MessageSearchModal />
    </div>
  );
}
