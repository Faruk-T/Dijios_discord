import type {
  AcademicSystemRole,
  ChannelType,
  UuidV7,
  WorkspaceTreeResponse,
} from "@dijios-connect/contracts";
import { fixtureChannel } from "./workspace-channel.fixtures.js";

function uuid(value: string): UuidV7 {
  return value as UuidV7;
}

const FEN = uuid("018f0000-0000-7000-8000-000000000001");

const GENEL = "018f0000-0000-7000-8000-000000000111";
const ACADEMIC = "018f0000-0000-7000-8000-000000000112";
const DUTY = "018f0000-0000-7000-8000-000000000113";

type ChannelRow = readonly [string, string, string, string, ChannelType, string | null, boolean];

function pack(id: string, name: string, rows: readonly ChannelRow[]) {
  return {
    id,
    name,
    channels: rows.map((row, position) =>
      fixtureChannel(row[0], row[1], row[2], row[3], row[4], row[5], row[6], position),
    ),
  };
}

const FIXTURE_CATEGORIES = [
  pack(GENEL, "GENEL & İDARE", [
    [
      "018f0000-0000-7000-8000-000000000121",
      GENEL,
      "duyurular",
      "📢 duyurular",
      "ANNOUNCEMENT",
      null,
      false,
    ],
    [
      "018f0000-0000-7000-8000-000000000122",
      GENEL,
      "ogretmenler-odasi",
      "# ogretmenler-odasi",
      "TEXT",
      null,
      false,
    ],
    [
      "018f0000-0000-7000-8000-000000000123",
      GENEL,
      "ogretmenler-odasi-ses",
      "🔊 Öğretmenler Odası",
      "VOICE",
      null,
      false,
    ],
    [
      "018f0000-0000-7000-8000-000000000129",
      GENEL,
      "idare-kurulu",
      "# idare-kurulu",
      "TEXT",
      "İdare",
      false,
    ],
  ]),
  pack(ACADEMIC, "AKADEMİK ZÜMRELER", [
    [
      "018f0000-0000-7000-8000-000000000124",
      ACADEMIC,
      "matematik-zumresi",
      "# matematik-zumresi",
      "TEXT",
      "Matematik",
      false,
    ],
    [
      "018f0000-0000-7000-8000-000000000125",
      ACADEMIC,
      "matematik-zumresi-ses",
      "🔊 Matematik Zümresi",
      "VOICE",
      "Matematik",
      false,
    ],
    [
      "018f0000-0000-7000-8000-000000000126",
      ACADEMIC,
      "fizik-zumresi",
      "# fizik-zumresi",
      "TEXT",
      "Fizik",
      false,
    ],
    [
      "018f0000-0000-7000-8000-000000000130",
      ACADEMIC,
      "fen-laboratuvari",
      "🔊 Fen Laboratuvarı",
      "VOICE",
      "Fizik",
      false,
    ],
    [
      "018f0000-0000-7000-8000-000000000131",
      ACADEMIC,
      "genel-kurul-sahnesi",
      "🎥 Genel Kurul Sahnesi",
      "VIDEO_STAGE",
      null,
      false,
    ],
  ]),
  pack(DUTY, "REHBERLİK & NÖBET", [
    [
      "018f0000-0000-7000-8000-000000000127",
      DUTY,
      "nobet-hatti",
      "# nobet-hatti",
      "TEXT",
      "Nöbet",
      false,
    ],
    [
      "018f0000-0000-7000-8000-000000000128",
      DUTY,
      "pdr-vaka-odasi",
      "🔒 pdr-vaka-odasi",
      "TEXT",
      "PDR",
      true,
    ],
    [
      "018f0000-0000-7000-8000-000000000132",
      DUTY,
      "pdr-gorusme-odasi",
      "🔊 PDR Görüşme Odası",
      "VOICE",
      "PDR",
      true,
    ],
  ]),
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
      channels: category.channels
        .filter((item) => role === "COUNSELOR" || !item.isPdrConfidential)
        .map((item) => ({
          ...item,
          permissions: {
            ...item.permissions,
            canSendMessages:
              item.type !== "ANNOUNCEMENT" ||
              role === "FOUNDER" ||
              role === "PRINCIPAL" ||
              role === "DEPT_HEAD",
          },
        })),
    })),
  };
}
