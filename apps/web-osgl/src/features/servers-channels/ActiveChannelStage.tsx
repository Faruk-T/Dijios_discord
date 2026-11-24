import type { JSX } from "react";
import { Badge, GoogleIcon } from "truncgil-uxigl";
import { ChannelChatPane } from "../messaging/ChannelChatPane.js";
import { useMessagingStore } from "../messaging/messaging.store.js";
import { useWorkspaceStore } from "./workspace.store.js";

export function ActiveChannelStage(): JSX.Element {
  const tree = useWorkspaceStore((state) => state.tree);
  const active = useWorkspaceStore((state) => state.activeChannelId);
  const toggle = useWorkspaceStore((state) => state.toggleRoster);
  const setSearchOpen = useMessagingStore((state) => state.setSearchOpen);
  const channel = tree?.categories
    .flatMap((category) => category.channels)
    .find((item) => item.id === active);
  return (
    <section className="hub-stage">
      <header className="hub-stage-bar">
        <GoogleIcon name={channel?.type === "VOICE" ? "volume_up" : "tag"} />
        <strong>{channel?.name ?? "Kanal seçin"}</strong>
        <span>{channel?.topic}</span>
        <button type="button" aria-label="Mesaj ara" onClick={() => setSearchOpen(true)}>
          <GoogleIcon name="search" />
        </button>
        <button type="button" aria-label="Kadro paneli" onClick={toggle}>
          <GoogleIcon name="groups" />
        </button>
      </header>
      {channel !== undefined &&
      (channel.type === "TEXT" || channel.type === "ANNOUNCEMENT" || channel.type === "DM") ? (
        <ChannelChatPane channel={channel} />
      ) : null}
      {channel?.type === "ANNOUNCEMENT" && !channel.permissions.canSendMessages ? (
        <div className="hub-card">
          <Badge>Salt Okunur Duyuru Kanalı</Badge>
          <p>Öğretmenler bu kanalda yalnızca duyuruları okuyabilir.</p>
        </div>
      ) : null}
      {channel?.type === "VOICE" || channel?.type === "VIDEO_STAGE" ? (
        <div className="hub-card">
          <h2>Sesli Odaya Katıl / Sahneyi Aç</h2>
          <p>{channel.occupants.length} öğretmen şu an bu odada.</p>
        </div>
      ) : null}
    </section>
  );
}
