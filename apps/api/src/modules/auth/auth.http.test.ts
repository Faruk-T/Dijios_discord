import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../app.factory.js";

describe("auth http", () => {
  let app: NestFastifyApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it("logs in, refreshes, lists personas, and logs out", async () => {
    const personas = await app.inject({ method: "GET", url: "/api/v1/auth/personas" });
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { institutionAlias: "fen-koleji", dijiosUserId: "founder.fen" },
    });
    const cookie = login.headers["set-cookie"];
    const refresh = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      headers: { cookie: Array.isArray(cookie) ? cookie.join("; ") : String(cookie) },
    });
    const logout = await app.inject({ method: "POST", url: "/api/v1/auth/logout" });

    expect(personas.json()).toHaveLength(6);
    expect(login.statusCode).toBe(201);
    expect(login.json()).toMatchObject({ tokenType: "Bearer", user: { fullName: "Ayşe Kurucu" } });
    expect(String(cookie)).toContain("dijios_refresh=");
    expect(String(cookie).toLowerCase()).toContain("httponly");
    expect(String(cookie).toLowerCase()).toContain("samesite=lax");
    expect(refresh.statusCode).toBe(201);
    expect(logout.json()).toEqual({ status: "ok" });
  });
});
