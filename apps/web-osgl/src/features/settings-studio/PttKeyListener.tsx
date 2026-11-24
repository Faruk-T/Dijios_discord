import { useEffect } from "react";
import { microphoneForKey } from "../voice-video/voice-session.logic.js";
import { useVoiceSessionStore } from "../voice-video/voice-session.store.js";

export function PttKeyListener(): null {
  const enabled = useVoiceSessionStore((state) => state.pttEnabled);
  const code = useVoiceSessionStore((state) => state.pttCode);
  const mic = useVoiceSessionStore((state) => state.micEnabled);
  const setMic = useVoiceSessionStore((state) => state.setMicEnabled);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const down = (event: KeyboardEvent): void => {
      setMic(
        microphoneForKey({
          pttEnabled: true,
          pttCode: code,
          code: event.code,
          pressed: true,
          micEnabled: mic,
        }),
      );
    };
    const up = (event: KeyboardEvent): void => {
      if (event.code === code) {
        setMic(false);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [code, enabled, mic, setMic]);
  return null;
}
