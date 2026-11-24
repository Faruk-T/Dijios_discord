import type { JSX } from "react";
import { useVoiceSessionStore } from "../voice-video/voice-session.store.js";

export function PttShortcutField(): JSX.Element {
  const enabled = useVoiceSessionStore((state) => state.pttEnabled);
  const code = useVoiceSessionStore((state) => state.pttCode);
  const setEnabled = useVoiceSessionStore((state) => state.setPttEnabled);
  const setCode = useVoiceSessionStore((state) => state.setPttCode);
  return (
    <div className="studio">
      <button type="button" onClick={() => setEnabled(!enabled)}>
        {enabled ? "Bas-konuş açık" : "Bas-konuş kapalı"}
      </button>
      <button
        type="button"
        aria-label="Bas-konuş tuşu"
        onKeyDown={(event) => {
          event.preventDefault();
          setCode(event.code);
        }}
      >
        Tuş: {code}
      </button>
    </div>
  );
}
