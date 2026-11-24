import { useEffect, useState } from "react";
import { Badge } from "truncgil-uxigl";

export function useActiveVoiceRoom(now = Date.now()): { readonly label: string } {
  const startedAt = now - 4 * 60 * 1000 - 12 * 1000;
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  return { label: `Matematik Zümresi · ${minutes}:${seconds}` };
}

export function ActiveVoiceMenuPill(): React.JSX.Element {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const voice = useActiveVoiceRoom(now);
  return (
    <Badge id="active-voice" tone="success" pulse pill>
      {voice.label}
    </Badge>
  );
}
