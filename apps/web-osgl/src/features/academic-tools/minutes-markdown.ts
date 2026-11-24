export interface LocalDecision {
  readonly id: string;
  readonly text: string;
  readonly ownerName: string;
  readonly done: boolean;
}

export function renderLocalMinutes(input: {
  readonly notes: string;
  readonly attendees: readonly string[];
  readonly decisions: readonly LocalDecision[];
}): string {
  const lines = input.decisions.map((item) => {
    const mark = item.done ? "x" : " ";
    return `- [${mark}] ${item.text} — Sorumlu: ${item.ownerName}`;
  });
  return [
    "# Örnek Fen ve Teknoloji Koleji — Matematik Toplantı Tutanağı",
    "",
    `Tarih: ${new Date().toISOString().slice(0, 10)}`,
    "",
    `Katılımcılar: ${input.attendees.join(", ")}`,
    "",
    "## Gündem Notları",
    input.notes,
    "",
    "## Alınan Kararlar & Sorumlular",
    ...lines,
  ].join("\n");
}

export function publishMinutes(markdown: string): void {
  if (typeof navigator !== "undefined" && navigator.clipboard !== undefined) {
    void navigator.clipboard.writeText(markdown).catch(() => undefined);
  }
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "zumre-tutanagi.md";
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
