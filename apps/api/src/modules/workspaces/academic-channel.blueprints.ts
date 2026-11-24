import type { ChannelType } from "@dijios-connect/contracts";

export interface ChannelBlueprint {
  readonly category: string;
  readonly slug: string;
  readonly name: string;
  readonly type: ChannelType;
  readonly branchName: string | null;
  readonly isPdrConfidential: boolean;
  readonly topic: string;
}

export const ACADEMIC_CHANNEL_BLUEPRINTS: readonly ChannelBlueprint[] = [
  channel(
    "GENEL & İDARE",
    "duyurular",
    "📢 duyurular",
    "ANNOUNCEMENT",
    null,
    false,
    "Kurum duyuruları",
  ),
  channel(
    "GENEL & İDARE",
    "ogretmenler-odasi",
    "# ogretmenler-odasi",
    "TEXT",
    null,
    false,
    "Öğretmenler odası",
  ),
  channel(
    "GENEL & İDARE",
    "ogretmenler-odasi-ses",
    "🔊 Öğretmenler Odası",
    "VOICE",
    null,
    false,
    "Sesli öğretmenler odası",
  ),
  channel(
    "GENEL & İDARE",
    "idare-kurulu",
    "# idare-kurulu",
    "TEXT",
    "İdare",
    false,
    "İdare kurulu",
  ),
  channel(
    "AKADEMİK ZÜMRELER",
    "matematik-zumresi",
    "# matematik-zumresi",
    "TEXT",
    "Matematik",
    false,
    "Matematik zümresi",
  ),
  channel(
    "AKADEMİK ZÜMRELER",
    "matematik-zumresi-ses",
    "🔊 Matematik Zümresi",
    "VOICE",
    "Matematik",
    false,
    "Matematik ses odası",
  ),
  channel(
    "AKADEMİK ZÜMRELER",
    "fizik-zumresi",
    "# fizik-zumresi",
    "TEXT",
    "Fizik",
    false,
    "Fizik zümresi",
  ),
  channel(
    "AKADEMİK ZÜMRELER",
    "fen-laboratuvari",
    "🔊 Fen Laboratuvarı",
    "VOICE",
    "Fizik",
    false,
    "Fen laboratuvarı",
  ),
  channel(
    "AKADEMİK ZÜMRELER",
    "genel-kurul-sahnesi",
    "🎥 Genel Kurul Sahnesi",
    "VIDEO_STAGE",
    null,
    false,
    "Genel kurul",
  ),
  channel(
    "REHBERLİK & NÖBET",
    "nobet-hatti",
    "# nobet-hatti",
    "TEXT",
    "Nöbet",
    false,
    "Nöbet hattı",
  ),
  channel(
    "REHBERLİK & NÖBET",
    "pdr-vaka-odasi",
    "🔒 pdr-vaka-odasi",
    "TEXT",
    "PDR",
    true,
    "KVKK vaka odası",
  ),
  channel(
    "REHBERLİK & NÖBET",
    "pdr-gorusme-odasi",
    "🔊 PDR Görüşme Odası",
    "VOICE",
    "PDR",
    true,
    "PDR görüşme",
  ),
];

function channel(
  category: string,
  slug: string,
  name: string,
  type: ChannelType,
  branchName: string | null,
  isPdrConfidential: boolean,
  topic: string,
): ChannelBlueprint {
  return { category, slug, name, type, branchName, isPdrConfidential, topic };
}
