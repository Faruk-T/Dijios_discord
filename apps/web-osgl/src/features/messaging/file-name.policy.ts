export function assertSafeFile(
  fileName: string,
  sizeBytes: number,
): { ok: true } | { ok: false; reason: string } {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const allowed = new Set([
    "pdf",
    "docx",
    "xlsx",
    "pptx",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "mp3",
    "wav",
  ]);
  const blocked = new Set(["exe", "bat", "ps1", "sh", "js", "html"]);
  if (blocked.has(extension) || !allowed.has(extension) || sizeBytes > 25 * 1024 * 1024) {
    return { ok: false, reason: "Bu dosya türü veya boyutu kabul edilmiyor." };
  }
  return { ok: true };
}
