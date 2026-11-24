import type { JSX } from "react";
import { Avatar, GoogleIcon } from "truncgil-uxigl";
import { useAuthStore } from "../auth/auth.store.js";
import { useWorkspaceStore } from "./workspace.store.js";

export function VoiceQuickFooterBar(): JSX.Element {
  const session = useAuthStore((state) => state.session);
  const muted = useWorkspaceStore((state) => state.muted);
  const deafened = useWorkspaceStore((state) => state.deafened);
  const setMuted = useWorkspaceStore((state) => state.setMuted);
  const setDeafened = useWorkspaceStore((state) => state.setDeafened);
  return (
    <div className="hub-footer">
      <Avatar shape="squircle" size="sm" name={session?.fullName ?? "Öğretmen"} status="online" />
      <span>
        <strong>{session?.fullName}</strong>
        <small>{session?.branchName}</small>
      </span>
      <button type="button" aria-label="Mikrofon" onClick={() => setMuted(!muted)}>
        <GoogleIcon name={muted ? "mic_off" : "mic"} />
      </button>
      <button type="button" aria-label="Kulaklık" onClick={() => setDeafened(!deafened)}>
        <GoogleIcon name={deafened ? "headset_off" : "headset"} />
      </button>
      <button type="button" aria-label="Sahneyi aç">
        <GoogleIcon name="videocam" />
      </button>
    </div>
  );
}
