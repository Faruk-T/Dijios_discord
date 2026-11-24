import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../app.factory.js";
import { PERMISSION_BITS } from "./permissions.bitfield.js";

async function login(app: NestFastifyApplication, dijiosUserId: string): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { institutionAlias: "fen-koleji", dijiosUserId },
  });
  const body: unknown = response.json();
  if (typeof body !== "object" || body === null || !("accessToken" in body)) {
    throw new Error("Login response is missing an access token.");
  }
  if (typeof body.accessToken !== "string") {
    throw new Error("Access token is not a string.");
  }
  return body.accessToken;
}

describe("channel permission guard", () => {
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

  it("blocks announcement sends, PDR walls, and honors an explicit allow bit", async () => {
    const teacher = await login(app, "physics.fen");
    const founder = await login(app, "founder.fen");
    const counselor = await login(app, "counselor.fen");
    const announcement = {
      channelType: "ANNOUNCEMENT",
      channelBranchName: null,
      isPdrConfidential: false,
      allowBits: "0",
      denyBits: "0",
    };
    const pdr = {
      channelType: "TEXT",
      channelBranchName: "PDR",
      isPdrConfidential: true,
      allowBits: "0",
      denyBits: "0",
    };
    const blockedSend = await app.inject({
      method: "POST",
      url: "/api/v1/rbac/send",
      headers: { authorization: `Bearer ${teacher}` },
      payload: announcement,
    });
    const founderPdr = await app.inject({
      method: "POST",
      url: "/api/v1/rbac/view",
      headers: { authorization: `Bearer ${founder}` },
      payload: pdr,
    });
    const counselorPdr = await app.inject({
      method: "POST",
      url: "/api/v1/rbac/view",
      headers: { authorization: `Bearer ${counselor}` },
      payload: pdr,
    });
    const explicit = await app.inject({
      method: "POST",
      url: "/api/v1/rbac/view",
      headers: { authorization: `Bearer ${founder}` },
      payload: { ...pdr, allowBits: PERMISSION_BITS.VIEW_CHANNEL.toString() },
    });

    expect(blockedSend.statusCode).toBe(403);
    expect(blockedSend.json()).toMatchObject({ code: "TENANT_FORBIDDEN" });
    expect(founderPdr.json()).toMatchObject({ code: "PDR_ACCESS_DENIED", status: 403 });
    expect(counselorPdr.statusCode).toBe(201);
    expect(explicit.statusCode).toBe(201);
  });
});
