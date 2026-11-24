import type { JSX } from "react";
import { Avatar } from "truncgil-uxigl";
import type { ChannelWithOccupants } from "@dijios-connect/contracts";

export function VoiceChannelOccupants({
  channel,
}: {
  readonly channel: ChannelWithOccupants;
}): JSX.Element | null {
  if (channel.type !== "VOICE" && channel.type !== "VIDEO_STAGE") {
    return null;
  }
  if (channel.occupants.length === 0) {
    return null;
  }
  return (
    <div>
      {channel.occupants.map((person) => (
        <div key={person.userId} className="hub-occupant">
          <span className={person.speaking ? "hub-speaking" : undefined}>
            <Avatar shape="squircle" size="xs" name={person.displayName} status="online" />
          </span>
          <span>{person.displayName}</span>
        </div>
      ))}
    </div>
  );
}
