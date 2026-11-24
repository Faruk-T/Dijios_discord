import type { JSX } from "react";
import { Avatar, GoogleIcon } from "truncgil-uxigl";
import type { MediaParticipant } from "./media-transport.port.js";

export function ParticipantVideoTile({
  participant,
}: {
  readonly participant: MediaParticipant;
}): JSX.Element {
  return (
    <article className={participant.speaking ? "stage-tile is-speaking" : "stage-tile"}>
      {participant.cameraEnabled ? (
        <div className="stage-preview" role="img" aria-label={`${participant.name} kamera`} />
      ) : (
        <Avatar shape="squircle" size="lg" name={participant.name} status="online" />
      )}
      <header>
        <strong>{participant.name}</strong>
        <em>{participant.branch}</em>
      </header>
      <div className="stage-badges">
        {participant.micEnabled ? null : <GoogleIcon name="mic_off" size="sm" />}
        {participant.handRaised ? <span aria-label="Söz istiyor">✋</span> : null}
        <GoogleIcon name="signal_cellular_alt" size="sm" />
      </div>
    </article>
  );
}
