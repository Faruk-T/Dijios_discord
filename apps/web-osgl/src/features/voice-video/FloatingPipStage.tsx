import type { JSX } from "react";
import { useVoiceSessionStore } from "./voice-session.store.js";
import { shouldShowPip } from "./voice-session.logic.js";
import { useWindowManager } from "../../windows/window-manager.store.js";

export function FloatingPipStage(): JSX.Element | null {
  const connected = useVoiceSessionStore((state) => state.connectedChannelId !== null);
  const name = useVoiceSessionStore((state) => state.connectedChannelName);
  const participants = useVoiceSessionStore((state) => state.participants);
  const mic = useVoiceSessionStore((state) => state.micEnabled);
  const setMic = useVoiceSessionStore((state) => state.setMicEnabled);
  const leave = useVoiceSessionStore((state) => state.leave);
  const windows = useWindowManager((state) => state.windows);
  const open = useWindowManager((state) => state.openApp);
  const stage = windows.find((item) => item.appId === "voice-stage");
  const speaker = participants.find((item) => item.speaking) ?? participants[0];
  if (!shouldShowPip(connected, stage === undefined || stage.minimized)) {
    return null;
  }
  return (
    <aside className="pip-card" aria-label="Yüzen mini sahne">
      <header>
        <strong>{speaker?.name ?? name}</strong>
      </header>
      <p>{name}</p>
      <button type="button" aria-label="Sessize Al" onClick={() => setMic(!mic)}>
        Sessize Al
      </button>
      <button type="button" onClick={() => open("voice-stage")}>
        Sahneyi Büyüt
      </button>
      <button className="is-leave" type="button" onClick={() => void leave()}>
        Ayrıl
      </button>
    </aside>
  );
}
