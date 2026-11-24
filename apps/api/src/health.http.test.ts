import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.factory.js";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

function assignTestEnv(): void {
  process.env.NODE_ENV = "test";
  process.env.AUTH_MODE = "mock";
  process.env.PORT = "3001";
  process.env.JWT_ACCESS_SECRET = "test-access-secret-value";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-value";
  process.env.DIJIOS_API_BASE_URL = "https://app.dijios.com";
  process.env.DATABASE_URL = "postgresql://dijios:dijios@localhost:5432/dijios_connect";
  process.env.REDIS_URL = "redis://localhost:6379";
}

describe("health and problem responses", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    assignTestEnv();
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns health and version", async () => {
    const health = await app.inject({ method: "GET", url: "/api/v1/health" });
    const version = await app.inject({ method: "GET", url: "/api/v1/version" });

    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ status: "ok" });
    expect(version.statusCode).toBe(200);
    expect(version.json()).toMatchObject({
      name: "@dijios-connect/api",
      version: "0.0.0",
      environment: "test",
    });
    const cors = await app.inject({
      method: "GET",
      url: "/api/v1/health",
      headers: { origin: "http://localhost:5173" },
    });
    expect(cors.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(cors.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("returns RFC 7807 problem+json for domain and http errors", async () => {
    const invalid = await app.inject({ method: "GET", url: "/api/v1/health?probe=invalid" });
    const missing = await app.inject({ method: "GET", url: "/api/v1/missing" });

    expect(invalid.statusCode).toBe(400);
    expect(invalid.headers["content-type"]).toContain("application/problem+json");
    expect(invalid.json()).toMatchObject({
      status: 400,
      code: "VALIDATION_FAILED",
      title: "Validation failed",
    });
    expect(missing.statusCode).toBe(404);
    expect(missing.headers["content-type"]).toContain("application/problem+json");
    expect(missing.json()).toMatchObject({ status: 404, instance: "/api/v1/missing" });
  });
});
