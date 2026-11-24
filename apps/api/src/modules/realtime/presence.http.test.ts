import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../app.factory.js";

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
    throw new Error("Login response is missing an access token.");
  }
  return body.accessToken;
}

describe("presence roster", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AUTH_MODE = "mock";
    process.env.PORT = "3012";
    process.env.JWT_ACCESS_SECRET = "test-access-secret-value";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret-value";
    process.env.DIJIOS_API_BASE_URL = "https://app.dijios.com";
    process.env.DATABASE_URL = "postgresql://dijios:dijios@localhost:5432/dijios_connect";
    process.env.REDIS_URL = "redis://localhost:6379";
    process.env.REDIS_ADAPTER_ENABLED = "false";
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("lists the fen roster and publishes a manual status", async () => {
    const token = await login(app);
    const events: unknown[] = [];
    const roster = await app.inject({
      method: "GET",
      url: "/api/v1/workspaces/current/roster",
      headers: { authorization: `Bearer ${token}` },
    });
    const body: unknown = roster.json();
    expect(roster.statusCode).toBe(200);
    expect(Array.isArray(body) ? body.length : 0).toBe(6);
    const presence = app.get((await import("./presence.service.js")).PresenceService);
    presence.bind({
      presence: (_institutionId, payload) => events.push(payload),
      voice: () => undefined,
    });
    const updated = await app.inject({
      method: "PATCH",
      url: "/api/v1/workspaces/current/presence",
      headers: { authorization: `Bearer ${token}` },
      payload: { status: "DND" },
    });
    expect(updated.statusCode).toBe(200);
    expect(events[0]).toMatchObject({ status: "DND" });
  });
});
