import { ValidationDomainException } from "../../common/errors/domain.exception.js";

const ALLOWED = new Set([
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
const BLOCKED = new Set(["exe", "bat", "ps1", "sh", "js", "html"]);
const MAX_BYTES = 25 * 1024 * 1024;

export function assertSafeFile(fileName: string, sizeBytes: number): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (BLOCKED.has(extension) || !ALLOWED.has(extension) || sizeBytes > MAX_BYTES || sizeBytes < 1) {
    throw new ValidationDomainException("This file type or size is not allowed.");
  }
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-");
}
