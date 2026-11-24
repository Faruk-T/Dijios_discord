import type {
  ChannelType,
  ChannelWithOccupants,
  UuidV7,
  WorkspaceTreeResponse,
} from "@dijios-connect/contracts";
import type { AcademicSystemRole } from "@dijios-connect/contracts";

function uuid(value: string): UuidV7 {
  return value as UuidV7;
}

const FEN = uuid("018f0000-0000-7000-8000-000000000001");

function channel(
  id: string,
  categoryId: string,
  slug: string,
  name: string,
  type: ChannelType,
  branchName: string | null,
  confidential: boolean,
  position: number,
): ChannelWithOccupants {
  const voice = slug === "matematik-zumresi-ses";
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
    occupants: voice
      ? [
          {
            userId: uuid("018f0000-0000-7000-8000-000000000005"),
            displayName: "Zeynep Başaran",
            livekitIdentity: "math.head.fen",
            speaking: true,
            flags: {
              selfMuted: false,
              selfDeafened: false,
              cameraEnabled: false,
              screenSharing: false,
              handRaised: false,
            },
          },
          {
            userId: uuid("018f0000-0000-7000-8000-000000000004"),
            displayName: "Mehmet Müdür",
            livekitIdentity: "principal.fen",
            speaking: false,
            flags: {
              selfMuted: true,
              selfDeafened: false,
              cameraEnabled: false,
              screenSharing: false,
              handRaised: false,
            },
          },
        ]
      : [],
  };
}

const FIXTURE_CATEGORIES = [
  {
    id: "018f0000-0000-7000-8000-000000000111",
    name: "GENEL & İDARE",
    channels: [
      channel(
        "018f0000-0000-7000-8000-000000000121",
        "018f0000-0000-7000-8000-000000000111",
        "duyurular",
        "📢 duyurular",
        "ANNOUNCEMENT",
        null,
        false,
        0,
      ),
      channel(
        "018f0000-0000-7000-8000-000000000122",
        "018f0000-0000-7000-8000-000000000111",
        "ogretmenler-odasi",
        "# ogretmenler-odasi",
        "TEXT",
        null,
        false,
        1,
      ),
      channel(
        "018f0000-0000-7000-8000-000000000123",
        "018f0000-0000-7000-8000-000000000111",
        "ogretmenler-odasi-ses",
        "🔊 Öğretmenler Odası",
        "VOICE",
        null,
        false,
        2,
      ),
    ],
  },
  {
    id: "018f0000-0000-7000-8000-000000000112",
    name: "AKADEMİK ZÜMRELER",
    channels: [
      channel(
        "018f0000-0000-7000-8000-000000000124",
        "018f0000-0000-7000-8000-000000000112",
        "matematik-zumresi",
        "# matematik-zumresi",
        "TEXT",
        "Matematik",
        false,
        3,
      ),
      channel(
        "018f0000-0000-7000-8000-000000000125",
        "018f0000-0000-7000-8000-000000000112",
        "matematik-zumresi-ses",
        "🔊 Matematik Zümresi",
        "VOICE",
        "Matematik",
        false,
        4,
      ),
      channel(
        "018f0000-0000-7000-8000-000000000126",
        "018f0000-0000-7000-8000-000000000112",
        "fizik-zumresi",
        "# fizik-zumresi",
        "TEXT",
        "Fizik",
        false,
        5,
      ),
    ],
  },
  {
    id: "018f0000-0000-7000-8000-000000000113",
    name: "REHBERLİK & NÖBET",
    channels: [
      channel(
        "018f0000-0000-7000-8000-000000000127",
        "018f0000-0000-7000-8000-000000000113",
        "nobet-hatti",
        "# nobet-hatti",
        "TEXT",
        "Nöbet",
        false,
        6,
      ),
      channel(
        "018f0000-0000-7000-8000-000000000128",
        "018f0000-0000-7000-8000-000000000113",
        "pdr-vaka-odasi",
        "🔒 pdr-vaka-odasi",
        "TEXT",
        "PDR",
        true,
        7,
      ),
    ],
  },
];

export function simulatedTree(role: AcademicSystemRole): WorkspaceTreeResponse {
  return {
    workspaceId: uuid("018f0000-0000-7000-8000-000000000101"),
    institutionId: FEN,
    categories: FIXTURE_CATEGORIES.map((category, position) => ({
      id: uuid(category.id),
      publicId:
        "01JFEN000000000000000000D1" as WorkspaceTreeResponse["categories"][number]["publicId"],
      name: category.name,
      position,
      channels: category.channels.filter((item) => role === "COUNSELOR" || !item.isPdrConfidential),
    })),
  };
}
