import { createHmac } from "node:crypto";

export function presignedUrl(method: "PUT" | "GET", objectKey: string, secret: string): string {
  const canonical = `${method}\n/${objectKey}\nhost:minio.local`;
  const signature = createHmac("sha256", secret).update(canonical).digest("hex");
  return `https://minio.local/${objectKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=${signature}`;
}
