import type { MeetingMinutesDocument } from "@dijios-connect/contracts";

export function renderOfficialMinutes(input: {
  readonly institutionName: string;
  readonly departmentName: string;
  readonly document: MeetingMinutesDocument;
}): string {
  const decisions = input.document.decisions
    .map((item) => {
      const mark = item.done ? "x" : " ";
      return `- [${mark}] ${item.text} — Sorumlu: ${item.ownerName}`;
    })
    .join("\n");
  const table = input.document.decisions
    .map((item) => `| ${item.done ? "x" : " "} | ${item.text} | ${item.ownerName} |`)
    .join("\n");
  return [
    `# ${input.institutionName} — ${input.departmentName} Toplantı Tutanağı`,
    "",
    `Tarih: ${input.document.createdAt.slice(0, 10)}`,
    "",
    `Katılımcılar: ${input.document.attendees.join(", ")}`,
    "",
    "## Gündem Notları",
    input.document.markdownBody,
    "",
    "## Alınan Kararlar & Sorumlular",
    decisions,
    "",
    "| Durum | Karar | Sorumlu |",
    "| --- | --- | --- |",
    table,
  ].join("\n");
}
