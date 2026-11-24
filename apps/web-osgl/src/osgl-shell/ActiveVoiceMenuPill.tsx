import { useEffect, useState } from "react";
import { GoogleIcon } from "truncgil-uxigl";
import { useActiveVoiceRoom } from "./voice-clock.js";

export function ActiveVoiceMenuPill(): React.JSX.Element {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const voice = useActiveVoiceRoom(now);
  return (
    <span id="active-voice" className="osgl-voice-pill">
      <i className="osgl-pulse-dot" />
      <GoogleIcon name="graphic_eq" size="sm" />
      <span>Matematik Zümresi</span>
      <span className="osgl-voice-time">{voice.elapsed}</span>
    </span>
  );
}
