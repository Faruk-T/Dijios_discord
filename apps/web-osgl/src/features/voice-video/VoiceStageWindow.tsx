import type { JSX } from "react";
import { ParticipantGrid } from "./ParticipantGrid.js";
import { VoiceControlDock } from "./VoiceControlDock.js";
import { useVoiceSessionStore } from "./voice-session.store.js";

export function VoiceStageWindow(): JSX.Element {
  const name = useVoiceSessionStore((state) => state.connectedChannelName);
  const participants = useVoiceSessionStore((state) => state.participants);
  return (
    <section className="stage" aria-label="Görüntülü zümre sahnesi">
      <header className="stage-share">
        <strong>{name ?? "Sesli oda seçilmedi"}</strong>
      </header>
      <div className="stage-body">
        <ParticipantGrid participants={participants} />
      </div>
      <VoiceControlDock />
    </section>
  );
}
