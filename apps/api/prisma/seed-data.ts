export const FEN_INSTITUTION_ID = "018f0000-0000-7000-8000-000000000001";
export const ANADOLU_INSTITUTION_ID = "018f0000-0000-7000-8000-000000000010";
export const FEN_CAMPUS_ID = "018f0000-0000-7000-8000-000000000002";
export const ANADOLU_CAMPUS_ID = "018f0000-0000-7000-8000-000000000011";

export interface SeedInstitution {
  readonly id: string;
  readonly publicId: string;
  readonly alias: string;
  readonly name: string;
  readonly primaryColor: string;
}

export interface SeedCampus {
  readonly id: string;
  readonly publicId: string;
  readonly institutionId: string;
  readonly name: string;
}

export interface SeedTeacher {
  readonly id: string;
  readonly publicId: string;
  readonly institutionId: string;
  readonly campusId: string;
  readonly dijiosUserId: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly systemRole: "FOUNDER" | "PRINCIPAL" | "DEPT_HEAD" | "TEACHER" | "COUNSELOR";
  readonly branchName: string;
  readonly title: string;
}

export const SEED_INSTITUTIONS: readonly SeedInstitution[] = [
  {
    id: FEN_INSTITUTION_ID,
    publicId: "01JFEN000000000000000000A1",
    alias: "fen-koleji",
    name: "Örnek Fen ve Teknoloji Koleji",
    primaryColor: "#002147",
  },
  {
    id: ANADOLU_INSTITUTION_ID,
    publicId: "01JFEN000000000000000000A2",
    alias: "anadolu-lisesi",
    name: "İkinci Anadolu Lisesi",
    primaryColor: "#1D3557",
  },
];

export const SEED_CAMPUSES: readonly SeedCampus[] = [
  {
    id: FEN_CAMPUS_ID,
    publicId: "01JFEN000000000000000000B1",
    institutionId: FEN_INSTITUTION_ID,
    name: "Merkez Kampüs",
  },
  {
    id: ANADOLU_CAMPUS_ID,
    publicId: "01JFEN000000000000000000B2",
    institutionId: ANADOLU_INSTITUTION_ID,
    name: "Anadolu Kampüsü",
  },
];

export const SEED_TEACHERS: readonly SeedTeacher[] = [
  teacher("03", "founder.fen", "Ayşe Kurucu", "FOUNDER", "Yönetim", "Kurucu"),
  teacher("04", "principal.fen", "Mehmet Müdür", "PRINCIPAL", "İdare", "Kampüs Müdürü"),
  teacher(
    "05",
    "math.head.fen",
    "Zeynep Başaran",
    "DEPT_HEAD",
    "Matematik",
    "Matematik Zümre Başkanı",
  ),
  teacher("06", "physics.fen", "Can Fizik", "TEACHER", "Fizik", "Fizik Öğretmeni"),
  teacher("07", "counselor.fen", "Elif Rehber", "COUNSELOR", "PDR", "PDR Uzmanı"),
  teacher("08", "duty.fen", "Burak Nöbet", "TEACHER", "Nöbet", "Nöbetçi Öğretmen"),
];

function teacher(
  suffix: string,
  dijiosUserId: string,
  fullName: string,
  systemRole: SeedTeacher["systemRole"],
  branchName: string,
  title: string,
): SeedTeacher {
  return {
    id: `018f0000-0000-7000-8000-0000000000${suffix}`,
    publicId: `01JFEN000000000000000000${suffix}`,
    institutionId: FEN_INSTITUTION_ID,
    campusId: FEN_CAMPUS_ID,
    dijiosUserId,
    fullName,
    email: `${dijiosUserId}@fen.example`,
    phone: `55500000${suffix}`,
    systemRole,
    branchName,
    title,
  };
}
