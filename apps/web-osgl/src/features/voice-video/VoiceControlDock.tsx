import type { JSX } from "react";
import { GoogleIcon } from "truncgil-uxigl";
import { useWindowManager } from "../../windows/window-manager.store.js";
import { useVoiceSessionStore } from "./voice-session.store.js";

export function VoiceControlDock(): JSX.Element {
  const mic = useVoiceSessionStore((state) => state.micEnabled);
  const deafened = useVoiceSessionStore((state) => state.deafened);
  const camera = useVoiceSessionStore((state) => state.cameraEnabled);
  const screen = useVoiceSessionStore((state) => state.screenShareEnabled);
  const hand = useVoiceSessionStore((state) => state.handRaised);
  const noise = useVoiceSessionStore((state) => state.noiseSuppression);
  const setMic = useVoiceSessionStore((state) => state.setMicEnabled);
  const setDeafened = useVoiceSessionStore((state) => state.setDeafened);
  const setCamera = useVoiceSessionStore((state) => state.setCameraEnabled);
  const setScreen = useVoiceSessionStore((state) => state.setScreenShareEnabled);
  const setHand = useVoiceSessionStore((state) => state.setHandRaised);
  const setNoise = useVoiceSessionStore((state) => state.setNoiseSuppression);
  const leave = useVoiceSessionStore((state) => state.leave);
  const openStudio = useWindowManager((state) => state.openApp);
  return (
    <div className="stage-dock">
      <button type="button" aria-label="Mikrofon" onClick={() => setMic(!mic)}>
        <GoogleIcon name={mic ? "mic" : "mic_off"} />
      </button>
      <button type="button" aria-label="Sağırlaştır" onClick={() => setDeafened(!deafened)}>
        <GoogleIcon name={deafened ? "headset_off" : "headset"} />
      </button>
      <button type="button" aria-label="Kamera" onClick={() => setCamera(!camera)}>
        <GoogleIcon name={camera ? "videocam" : "videocam_off"} />
      </button>
      <button type="button" aria-label="Ekran Paylaş" onClick={() => setScreen(!screen)}>
        <GoogleIcon name="screen_share" />
      </button>
      <button type="button" aria-label="El Kaldır" onClick={() => setHand(!hand)}>
        ✋
      </button>
      <button type="button" aria-label="Gürültü Engelleme" onClick={() => setNoise(!noise)}>
        {noise ? "Gürültü açık" : "Gürültü kapalı"}
      </button>
      <button type="button" aria-label="Cihaz Stüdyosu" onClick={() => openStudio("media-studio")}>
        <GoogleIcon name="tune" />
      </button>
      <button type="button" onClick={() => openStudio("meeting-minutes")}>
        📝 Tutanak
      </button>
      <button className="is-leave" type="button" aria-label="Ayrıl" onClick={() => void leave()}>
        Ayrıl
      </button>
    </div>
  );
}
