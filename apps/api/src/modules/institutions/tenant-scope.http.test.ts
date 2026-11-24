import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ANADOLU_INSTITUTION_ID, FEN_INSTITUTION_ID } from "../../../prisma/seed-data.js";
import { createApp } from "../../app.factory.js";

describe("tenant isolation", () => {
  let app: NestFastifyApplication;
  let accessToken = "";

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AUTH_MODE = "mock";
    process.env.PORT = "3001";
    process.env.JWT_ACCESS_SECRET = "test-access-secret-value";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret-value";
    process.env.DIJIOS_API_BASE_URL = "https://app.dijios.com";
    process.env.DATABASE_URL = "postgresql://dijios:dijios@localhost:5432/dijios_connect";
    process.env.REDIS_URL = "redis://localhost:6379";
    app = await createApp();
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { institutionAlias: "fen-koleji", dijiosUserId: "founder.fen" },
    });
    const body: unknown = login.json();
    if (typeof body !== "object" || body === null || !("accessToken" in body)) {
      throw new Error("Login response is missing an access token.");
    }
    const token = body.accessToken;
    if (typeof token !== "string") {
      throw new Error("Access token is not a string.");
    }
    accessToken = token;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the signed-in teacher and their own institution", async () => {
    const me = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const summary = await app.inject({
      method: "GET",
      url: `/api/v1/institutions/${FEN_INSTITUTION_ID}/summary`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(me.statusCode).toBe(200);
    expect(me.json()).toMatchObject({
      institutionId: FEN_INSTITUTION_ID,
      systemRole: "FOUNDER",
      fullName: "Ayşe Kurucu",
    });
    expect(summary.statusCode).toBe(200);
    expect(summary.json()).toMatchObject({ alias: "fen-koleji", primaryColor: "#002147" });
  });

  it("rejects a Fen teacher reading the Anadolu institution", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/v1/institutions/${ANADOLU_INSTITUTION_ID}/summary`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-institution-id": ANADOLU_INSTITUTION_ID,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.headers["content-type"]).toContain("application/problem+json");
    expect(response.json()).toMatchObject({ status: 403, code: "TENANT_FORBIDDEN" });
  });

  it("rejects a mismatched institution header on the session profile", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-institution-id": ANADOLU_INSTITUTION_ID,
      },
    });

    expect(response.json()).toMatchObject({ status: 403, code: "TENANT_FORBIDDEN" });
  });
});
