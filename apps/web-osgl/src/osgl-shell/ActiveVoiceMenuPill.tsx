import { useEffect, useState } from "react";
import { GoogleIcon } from "truncgil-uxigl";
import { formatElapsed } from "../features/voice-video/voice-session.logic.js";
import { useVoiceSessionStore } from "../features/voice-video/voice-session.store.js";

export function ActiveVoiceMenuPill(): React.JSX.Element {
  const [now, setNow] = useState(() => Date.now());
  const name = useVoiceSessionStore((state) => state.connectedChannelName);
  const connectedAt = useVoiceSessionStore((state) => state.connectedAt);
  const leave = useVoiceSessionStore((state) => state.leave);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <span id="active-voice" className="osgl-voice-pill">
      <i className="osgl-pulse-dot" />
      <GoogleIcon name="graphic_eq" size="sm" />
      <span>{name ?? "Sesli Odada Değil"}</span>
      {name === null ? null : (
        <>
          <span className="osgl-voice-time">{formatElapsed(connectedAt, now)}</span>
          <button type="button" onClick={() => void leave()}>
            Ayrıl
          </button>
        </>
      )}
    </span>
  );
}
