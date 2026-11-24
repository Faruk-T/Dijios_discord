import type { JSX } from "react";
import { GoogleIcon } from "truncgil-uxigl";
import { useAuthStore } from "../auth/auth.store.js";
import { CreateChannelModal } from "./CreateChannelModal.js";
import { useWorkspaceStore, type ChannelFilter } from "./workspace.store.js";

const CREATORS = new Set(["FOUNDER", "PRINCIPAL", "DEPT_HEAD"]);

const FILTERS: readonly {
  readonly id: ChannelFilter;
  readonly icon: string;
  readonly label: string;
}[] = [
  { id: "all", icon: "grid_view", label: "Tümü" },
  { id: "branch", icon: "school", label: "Zümrem" },
  { id: "voice", icon: "volume_up", label: "Sesli Odalar" },
  { id: "announcements", icon: "campaign", label: "Duyurular" },
];

export function CampusIconRail(): JSX.Element {
  const filter = useWorkspaceStore((state) => state.filter);
  const setFilter = useWorkspaceStore((state) => state.setFilter);
  const setCreateOpen = useWorkspaceStore((state) => state.setCreateOpen);
  const canCreate = CREATORS.has(useAuthStore((state) => state.session?.systemRole ?? ""));
  return (
    <aside className="hub-rail" aria-label="Kampüs rayı">
      <span className="hub-emblem" title="Örnek Fen Koleji">
        d
      </span>
      {FILTERS.map((item) => (
        <button
          key={item.id}
          className={filter === item.id ? "hub-filter is-active" : "hub-filter"}
          type="button"
          title={item.label}
          aria-label={item.label}
          onClick={() => setFilter(item.id)}
        >
          <GoogleIcon name={item.icon} />
        </button>
      ))}
      <button
        className="hub-plus"
        type="button"
        aria-label="Yeni kanal"
        title="Yeni kanal"
        disabled={!canCreate}
        onClick={() => setCreateOpen(true)}
      >
        <GoogleIcon name="add" />
      </button>
      <CreateChannelModal />
    </aside>
  );
}
