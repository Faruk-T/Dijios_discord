import type { JSX } from "react";
import type { PresenceStatus } from "@dijios-connect/contracts";
import { useAuthStore } from "../auth/auth.store.js";
import { useWorkspaceStore } from "../servers-channels/workspace.store.js";

const OPTIONS: readonly { readonly value: PresenceStatus; readonly label: string }[] = [
  { value: "ONLINE", label: "Çevrimiçi" },
  { value: "IN_CLASS", label: "Derste (Otomatik)" },
  { value: "ON_DUTY", label: "Nöbette" },
  { value: "DND", label: "Rahatsız Etmeyin" },
];

export function PresenceStatusMenu(): JSX.Element {
  const session = useAuthStore((state) => state.session);
  const status = useWorkspaceStore((state) => state.status);
  const setStatus = useWorkspaceStore((state) => state.setStatus);
  return (
    <label className="hub-status">
      <span className="osgl-sr">Durum</span>
      <select
        aria-label="Durum"
        value={status}
        onChange={(event) => {
          const next = OPTIONS.find((item) => item.value === event.target.value);
          if (session !== null && next !== undefined) {
            void setStatus(session, next.value);
          }
        }}
      >
        {OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
