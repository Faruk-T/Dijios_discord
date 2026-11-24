import type { JSX } from "react";
import { Avatar, GoogleIcon } from "truncgil-uxigl";
import { useAuthStore } from "../auth/auth.store.js";
import { useVoiceSessionStore } from "../voice-video/voice-session.store.js";
import { PresenceStatusMenu } from "../presence-timetable/PresenceStatusMenu.js";

export function VoiceQuickFooterBar(): JSX.Element {
  const session = useAuthStore((state) => state.session);
  const room = useVoiceSessionStore((state) => state.connectedChannelName);
  const mic = useVoiceSessionStore((state) => state.micEnabled);
  const deafened = useVoiceSessionStore((state) => state.deafened);
  const setMic = useVoiceSessionStore((state) => state.setMicEnabled);
  const setDeafened = useVoiceSessionStore((state) => state.setDeafened);
  return (
    <div className="hub-footer">
      <Avatar shape="squircle" size="sm" name={session?.fullName ?? "Öğretmen"} status="online" />
      <span>
        <strong>{session?.fullName}</strong>
        <small>{room ?? "Sesli Odada Değil"}</small>
      </span>
      <PresenceStatusMenu />
      <button type="button" aria-label="Mikrofon" onClick={() => setMic(!mic)}>
        <GoogleIcon name={mic ? "mic" : "mic_off"} />
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
