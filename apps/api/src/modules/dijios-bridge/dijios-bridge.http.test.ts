import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ANADOLU_INSTITUTION_ID } from "../../../prisma/seed-data.js";
import { createApp } from "../../app.factory.js";
import { TokenService } from "../auth/token.service.js";

const MESSAGE = "Saat 15:30'da Genel Kurul Sahnesinde zümre değerlendirmesi yapılacaktır";

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

function foreignToken(app: NestFastifyApplication): string {
  return app.get(TokenService).issue({
    userId: "018f0000-0000-7000-8000-000000000012",
    publicId: "01JFEN000000000000000000A2",
    institutionId: ANADOLU_INSTITUTION_ID,
    institutionPublicId: "01JFEN000000000000000000A2",
    institutionAlias: "anadolu-lisesi",
    institutionName: "İkinci Anadolu Lisesi",
    primaryColor: "#1D3557",
    fullName: "Anadolu Öğretmeni",
    systemRole: "TEACHER",
    branchName: "Matematik",
    title: "Öğretmen",
    avatarUrl: null,
  }).response.accessToken;
}

describe("student 360 and campus broadcast", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AUTH_MODE = "mock";
    process.env.PORT = "3018";
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

  it("masks the counseling note unless the reader is a counselor", async () => {
    const teacher = await login(app, "physics.fen");
    const head = await login(app, "math.head.fen");
    const counselor = await login(app, "counselor.fen");
    const hidden = await app.inject({
      method: "GET",
      url: "/api/v1/dijios-bridge/students/2026-1042",
      headers: { authorization: `Bearer ${teacher}` },
    });
    const headView = await app.inject({
      method: "GET",
      url: "/api/v1/dijios-bridge/students/2026-1042",
      headers: { authorization: `Bearer ${head}` },
    });
    const revealed = await app.inject({
      method: "GET",
      url: "/api/v1/dijios-bridge/students/2026-1042",
      headers: { authorization: `Bearer ${counselor}` },
    });
    expect(hidden.statusCode).toBe(200);
    expect(isRecord(hidden.json()) ? hidden.json() : {}).toMatchObject({
      fullName: "Kerem Yılmaz",
      gradeLabel: "11/A Fen",
      pdrConfidentialNote: null,
    });
    expect(isRecord(headView.json()) ? headView.json() : {}).toMatchObject({
      pdrConfidentialNote: null,
    });
    expect(isRecord(revealed.json()) ? revealed.json() : {}).toMatchObject({
      pdrConfidentialNote: "Sınav kaygısı için haftalık PDR görüşmesi sürüyor.",
    });
    const foreign = await app.inject({
      method: "GET",
      url: "/api/v1/dijios-bridge/students/2026-1042",
      headers: { authorization: `Bearer ${foreignToken(app)}` },
    });
    expect(foreign.statusCode).toBe(403);
    expect(isRecord(foreign.json()) ? foreign.json() : {}).toMatchObject({
      code: "TENANT_FORBIDDEN",
    });
  });

  it("allows only founders and principals to broadcast", async () => {
    const teacher = await login(app, "physics.fen");
    const founder = await login(app, "founder.fen");
    const denied = await app.inject({
      method: "POST",
      url: "/api/v1/workspaces/current/broadcast",
      headers: { authorization: `Bearer ${teacher}` },
      payload: { message: MESSAGE },
    });
    const published = await app.inject({
      method: "POST",
      url: "/api/v1/workspaces/current/broadcast",
      headers: { authorization: `Bearer ${founder}` },
      payload: { message: MESSAGE },
    });
    expect(denied.statusCode).toBe(403);
    expect(isRecord(denied.json()) ? denied.json() : {}).toMatchObject({
      code: "TENANT_FORBIDDEN",
    });
    expect(published.statusCode).toBe(201);
    expect(isRecord(published.json()) ? published.json() : {}).toMatchObject({ message: MESSAGE });
  });
});
