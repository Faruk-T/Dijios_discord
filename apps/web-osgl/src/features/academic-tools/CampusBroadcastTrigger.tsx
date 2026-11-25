import type { JSX } from "react";
import { useAuthStore } from "../auth/auth.store.js";
import { publishOfficialAlert } from "./campus-alert.store.js";

export function CampusBroadcastTrigger(): JSX.Element | null {
  const role = useAuthStore((state) => state.session?.systemRole);
  if (role !== "FOUNDER" && role !== "PRINCIPAL") {
    return null;
  }
  return (
    <button
      id="campus-broadcast"
      className="osgl-menu-button"
      type="button"
      onClick={() => void publishOfficialAlert()}
    >
      📢 Anons
    </button>
  );
}
