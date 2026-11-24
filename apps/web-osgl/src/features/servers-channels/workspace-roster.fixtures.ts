import type {
  AcademicSystemRole,
  PresenceStatus,
  TeacherRosterEntry,
  UuidV7,
} from "@dijios-connect/contracts";

function uuid(value: string): UuidV7 {
  return value as UuidV7;
}

function row(
  id: string,
  fullName: string,
  title: string,
  branchName: string,
  systemRole: AcademicSystemRole,
  status: PresenceStatus,
  currentLesson: string | null,
  voice: boolean,
): TeacherRosterEntry {
  return {
    userId: uuid(id),
    publicId: "01JFEN000000000000000000E1" as TeacherRosterEntry["publicId"],
    fullName,
    title,
    branchName,
    systemRole,
    status,
    currentLesson,
    activeVoiceChannelId: voice ? uuid("018f0000-0000-7000-8000-000000000125") : null,
  };
}

export function simulatedRoster(): readonly TeacherRosterEntry[] {
  return [
    row(
      "018f0000-0000-7000-8000-000000000005",
      "Zeynep Başaran",
      "Matematik Zümre Başkanı",
      "Matematik",
      "DEPT_HEAD",
      "IN_CLASS",
      "📚 11-A Matematik · 14 dk",
      true,
    ),
    row(
      "018f0000-0000-7000-8000-000000000006",
      "Can Fizik",
      "Fizik Öğretmeni",
      "Fizik",
      "TEACHER",
      "IN_CLASS",
      "📚 10-B Fizik · 9 dk",
      false,
    ),
    row(
      "018f0000-0000-7000-8000-000000000004",
      "Mehmet Müdür",
      "Kampüs Müdürü",
      "İdare",
      "PRINCIPAL",
      "IN_VOICE",
      null,
      true,
    ),
    row(
      "018f0000-0000-7000-8000-000000000003",
      "Ayşe Kurucu",
      "Kurucu",
      "Yönetim",
      "FOUNDER",
      "ONLINE",
      null,
      false,
    ),
    row(
      "018f0000-0000-7000-8000-000000000007",
      "Elif Rehber",
      "PDR Uzmanı",
      "PDR",
      "COUNSELOR",
      "ONLINE",
      null,
      false,
    ),
    row(
      "018f0000-0000-7000-8000-000000000008",
      "Burak Nöbet",
      "Nöbetçi Öğretmen",
      "Nöbet",
      "TEACHER",
      "ON_DUTY",
      "2. Kat Koridor Nöbeti",
      false,
    ),
  ];
}
