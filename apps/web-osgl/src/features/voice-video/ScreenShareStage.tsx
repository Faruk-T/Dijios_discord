import type { JSX } from "react";
import { useVoiceSessionStore } from "./voice-session.store.js";

const ZOOMS = [1, 1.5, 2] as const;

export function ScreenShareStage(): JSX.Element | null {
  const participants = useVoiceSessionStore((state) => state.participants);
  const zoom = useVoiceSessionStore((state) => state.screenZoom);
  const setZoom = useVoiceSessionStore((state) => state.setScreenZoom);
  const sharing = participants.find((item) => item.screenSharing);
  if (sharing === undefined) {
    return null;
  }
  return (
    <section className="stage-share" data-zoom={zoom} aria-label="Ekran paylaşımı">
      <header>
        <strong>{sharing.name} belge paylaşıyor</strong>
        {ZOOMS.map((value) => (
          <button key={value} type="button" onClick={() => setZoom(value)}>
            {Math.round(value * 100)}%
          </button>
        ))}
      </header>
      <div className="stage-share-zoom">
        <div className="stage-preview" role="img" aria-label="1080p belge önizlemesi" />
      </div>
    </section>
  );
}
