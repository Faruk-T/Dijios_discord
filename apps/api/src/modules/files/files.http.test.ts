import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ANADOLU_INSTITUTION_ID } from "../../../prisma/seed-data.js";
import { createApp } from "../../app.factory.js";
import { OBJECT_STORAGE_PORT, type ObjectStoragePort } from "./object-storage.port.js";

async function login(app: NestFastifyApplication): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { institutionAlias: "fen-koleji", dijiosUserId: "founder.fen" },
  });
  const body: unknown = response.json();
  if (
    typeof body !== "object" ||
    body === null ||
    !("accessToken" in body) ||
    typeof body.accessToken !== "string"
  ) {
    throw new Error("Login failed");
  }
  return body.accessToken;
}

describe("attachment presign", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AUTH_MODE = "mock";
    process.env.PORT = "3015";
    process.env.JWT_ACCESS_SECRET = "test-access-secret-value";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret-value";
    process.env.DIJIOS_API_BASE_URL = "https://app.dijios.com";
    process.env.DATABASE_URL = "postgresql://dijios:dijios@localhost:5432/dijios_connect";
    process.env.REDIS_URL = "redis://localhost:6379";
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects executables and hides another institution object", async () => {
    const token = await login(app);
    const tree = await app.inject({
      method: "GET",
      url: "/api/v1/workspaces/current/tree",
      headers: { authorization: `Bearer ${token}` },
    });
    const body: unknown = tree.json();
    const channelId = firstChannel(body);
    const blocked = await app.inject({
      method: "POST",
      url: `/api/v1/channels/${channelId}/attachments/presign`,
      headers: { authorization: `Bearer ${token}` },
      payload: { fileName: "zararli.exe", mimeType: "application/octet-stream", sizeBytes: 120 },
    });
    expect(blocked.statusCode).toBe(400);
    expect(blocked.json()).toMatchObject({ code: "VALIDATION_FAILED" });
    const storage = app.get<ObjectStoragePort>(OBJECT_STORAGE_PORT);
    storage.save({
      id: "018f0000-0000-7000-8000-000000000199",
      institutionId: ANADOLU_INSTITUTION_ID,
      channelId,
      fileName: "not.pdf",
      mimeType: "application/pdf",
      sizeBytes: 10,
      objectKey: `institutions/${ANADOLU_INSTITUTION_ID}/channels/${channelId}/secret.pdf`,
    });
    const hidden = await app.inject({
      method: "GET",
      url: "/api/v1/attachments/018f0000-0000-7000-8000-000000000199/download-url",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(hidden.statusCode).toBe(403);
  });
});

function firstChannel(body: unknown): string {
  if (
    typeof body !== "object" ||
    body === null ||
    !("categories" in body) ||
    !Array.isArray(body.categories)
  ) {
    return "";
  }
  const categories: unknown[] = body.categories;
  const category = categories[0];
  if (
    typeof category !== "object" ||
    category === null ||
    !("channels" in category) ||
    !Array.isArray(category.channels)
  ) {
    return "";
  }
  const channels: unknown[] = category.channels;
  const channel = channels[0];
  return typeof channel === "object" &&
    channel !== null &&
    "id" in channel &&
    typeof channel.id === "string"
    ? channel.id
    : "";
}
