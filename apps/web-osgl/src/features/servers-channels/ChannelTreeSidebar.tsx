import type { JSX } from "react";
import type { ChannelType } from "@dijios-connect/contracts";
import { GoogleIcon } from "truncgil-uxigl";
import { useAuthStore } from "../auth/auth.store.js";
import { useWorkspaceStore, type ChannelFilter } from "./workspace.store.js";
import { VoiceChannelOccupants } from "./VoiceChannelOccupants.js";

function iconFor(type: ChannelType, confidential: boolean): string {
  if (confidential) return "lock";
  if (type === "ANNOUNCEMENT") return "campaign";
  if (type === "VOICE") return "volume_up";
  if (type === "VIDEO_STAGE") return "podcasts";
  return "tag";
}

function matches(
  filter: ChannelFilter,
  type: ChannelType,
  branch: string | null,
  own: string,
): boolean {
  if (filter === "dm") return type === "DM";
  if (filter === "voice") return type === "VOICE" || type === "VIDEO_STAGE";
  if (filter === "announcements") return type === "ANNOUNCEMENT";
  if (filter === "branch") return branch === own || branch === null;
  return true;
}

export function ChannelTreeSidebar(): JSX.Element {
  const tree = useWorkspaceStore((state) => state.tree);
  const filter = useWorkspaceStore((state) => state.filter);
  const active = useWorkspaceStore((state) => state.activeChannelId);
  const select = useWorkspaceStore((state) => state.selectChannel);
  const branch = useAuthStore((state) => state.session?.branchName ?? "");
  return (
    <aside className="hub-tree" aria-label="Zümre kanalları">
      {tree?.categories.map((category) => (
        <section key={category.id}>
          <div className="hub-category">{category.name}</div>
          {category.channels
            .filter((channel) => matches(filter, channel.type, channel.branchName, branch))
            .map((channel) => (
              <div key={channel.id}>
                <button
                  className={active === channel.id ? "hub-channel is-active" : "hub-channel"}
                  type="button"
                  onClick={() => select(channel.id)}
                >
                  <GoogleIcon name={iconFor(channel.type, channel.isPdrConfidential)} size="sm" />
                  <span>{channel.name}</span>
                  {channel.slug === "matematik-zumresi" ? (
                    <span className="msg-mention">1</span>
                  ) : null}
                </button>
                <VoiceChannelOccupants channel={channel} />
              </div>
            ))}
        </section>
      ))}
    </aside>
  );
}
