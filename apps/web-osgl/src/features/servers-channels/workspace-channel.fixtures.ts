import type { ChannelType, ChannelWithOccupants, UuidV7 } from "@dijios-connect/contracts";

function uuid(value: string): UuidV7 {
  return value as UuidV7;
}

const FEN = uuid("018f0000-0000-7000-8000-000000000001");
const QUIET = {
  selfMuted: false,
  selfDeafened: false,
  cameraEnabled: false,
  screenSharing: false,
  handRaised: false,
};

export function fixtureChannel(
  id: string,
  categoryId: string,
  slug: string,
  name: string,
  type: ChannelType,
  branchName: string | null,
  confidential: boolean,
  position: number,
): ChannelWithOccupants {
  return {
    id: uuid(id),
    publicId: "01JFEN000000000000000000C1" as ChannelWithOccupants["publicId"],
    institutionId: FEN,
    categoryId: uuid(categoryId),
    slug,
    name,
    topic: name,
    type,
    branchName,
    isPrivate: confidential,
    isPdrConfidential: confidential,
    maxParticipants: type === "TEXT" || type === "ANNOUNCEMENT" ? null : 50,
    position,
    permissions: {
      canView: true,
      canSendMessages: type !== "ANNOUNCEMENT",
      canConnectVoice: type === "VOICE" || type === "VIDEO_STAGE",
      canSpeak: type === "VOICE" || type === "VIDEO_STAGE",
      canShareScreen: type === "VIDEO_STAGE",
      canManageChannel: false,
    },
    occupants:
      slug === "matematik-zumresi-ses"
        ? [
            person("018f0000-0000-7000-8000-000000000005", "Zeynep Başaran", "math.head.fen", true),
            person("018f0000-0000-7000-8000-000000000004", "Mehmet Müdür", "principal.fen", false),
          ]
        : [],
  };
}

function person(
  id: string,
  displayName: string,
  livekitIdentity: string,
  speaking: boolean,
): ChannelWithOccupants["occupants"][number] {
  return {
    userId: uuid(id),
    displayName,
    livekitIdentity,
    speaking,
    flags: speaking ? QUIET : { ...QUIET, selfMuted: true },
  };
}

let createdSequence = 200;

export function createdChannel(
  categoryId: string,
  name: string,
  type: ChannelType,
  branchName: string | null,
): ChannelWithOccupants {
  createdSequence += 1;
  const slug = name
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  return fixtureChannel(
    `018f0000-0000-7000-8000-${String(createdSequence).padStart(12, "0")}`,
    categoryId,
    slug.length > 0 ? slug : "kanal",
    name,
    type,
    branchName,
    false,
    createdSequence,
  );
}
