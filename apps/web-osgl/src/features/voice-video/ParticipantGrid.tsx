import type { JSX } from "react";
import type { MediaParticipant } from "./media-transport.port.js";
import { ParticipantVideoTile } from "./ParticipantVideoTile.js";

export function ParticipantGrid({
  participants,
}: {
  readonly participants: readonly MediaParticipant[];
}): JSX.Element {
  const count = participants.length <= 2 ? "2" : "many";
  return (
    <div className="stage-grid" data-count={count}>
      {participants.map((participant) => (
        <ParticipantVideoTile key={participant.id} participant={participant} />
      ))}
    </div>
  );
}
