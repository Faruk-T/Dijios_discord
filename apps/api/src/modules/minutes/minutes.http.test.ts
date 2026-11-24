import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FEN_INSTITUTION_ID } from "../../../prisma/seed-data.js";
import { createApp } from "../../app.factory.js";
import { DepartmentProvisionerService } from "../workspaces/department-provisioner.service.js";

async function login(app: NestFastifyApplication, dijiosUserId: string): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { institutionAlias: "fen-koleji", dijiosUserId },
  });
  const body: unknown = response.json();
  if (typeof body !== "object" || body === null || !("accessToken" in body)) {
    throw new Error("Login failed");
  }
  return typeof body.accessToken === "string" ? body.accessToken : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readId(body: unknown): string {
  return isRecord(body) && typeof body.id === "string" ? body.id : "";
}

describe("meeting minutes", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AUTH_MODE = "mock";
    process.env.PORT = "3017";
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

  it("exports the official minutes and attaches live voice attendees", async () => {
    const founder = await login(app, "founder.fen");
    const teacher = await login(app, "physics.fen");
    const fen = app.get(DepartmentProvisionerService).ensure(FEN_INSTITUTION_ID, "Fen");
    const math = fen.channels.find((channel) => channel.slug === "matematik-zumresi")?.id ?? "";
    const voice =
      fen.channels.find((channel) => channel.slug === "matematik-zumresi-ses")?.id ?? "";
    const pdr = fen.channels.find((channel) => channel.slug === "pdr-vaka-odasi")?.id ?? "";
    const joined = await app.inject({
      method: "POST",
      url: `/api/v1/channels/${voice}/voice-token`,
      headers: { authorization: `Bearer ${founder}` },
    });
    expect(joined.statusCode).toBe(201);
    const listed = await app.inject({
      method: "GET",
      url: `/api/v1/channels/${math}/minutes`,
      headers: { authorization: `Bearer ${founder}` },
    });
    expect(listed.statusCode).toBe(200);
    const saved = await app.inject({
      method: "POST",
      url: `/api/v1/channels/${math}/minutes`,
      headers: { authorization: `Bearer ${founder}` },
      payload: {
        title: "Kasım zümresi",
        markdownBody: "Ortak tarama tarihi netleşti.",
        decisions: [
          {
            id: "karar-1",
            text: "11. Sınıf ortak türev taraması Cuma 3. ders uygulanacak",
            ownerName: "Zeynep Başaran",
            done: true,
          },
        ],
      },
    });
    expect(saved.statusCode).toBe(201);
    const document: unknown = saved.json();
    expect(isRecord(document) && Array.isArray(document.attendees)).toBe(true);
    expect(isRecord(document) ? document.attendees : []).toContain("Ayşe Kurucu");
    const exported = await app.inject({
      method: "GET",
      url: `/api/v1/minutes/${readId(document)}/export`,
      headers: { authorization: `Bearer ${founder}` },
    });
    expect(exported.body).toContain(
      "# Örnek Fen ve Teknoloji Koleji — Matematik Toplantı Tutanağı",
    );
    expect(exported.body).toContain(
      "[x] 11. Sınıf ortak türev taraması Cuma 3. ders uygulanacak — Sorumlu: Zeynep Başaran",
    );
    const hidden = await app.inject({
      method: "GET",
      url: `/api/v1/channels/${pdr}/minutes`,
      headers: { authorization: `Bearer ${teacher}` },
    });
    expect(hidden.statusCode).toBe(403);
  });
});
