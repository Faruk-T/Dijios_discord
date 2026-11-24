import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ANADOLU_INSTITUTION_ID, FEN_INSTITUTION_ID } from "../../../prisma/seed-data.js";
import { createApp } from "../../app.factory.js";
import { DepartmentProvisionerService } from "../workspaces/department-provisioner.service.js";
import { signLiveKitWebhook } from "./livekit-jwt.signer.js";
import { VoiceRoomsService } from "./voice-rooms.service.js";

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

function claim(token: string, key: string): boolean {
  const part = token.split(".")[1];
  if (part === undefined) {
    return false;
  }
  const json: unknown = JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  if (typeof json !== "object" || json === null || !("video" in json)) {
    return false;
  }
  const video = json.video;
  return typeof video === "object" && video !== null && key in video && video[key] === true;
}

describe("livekit voice tokens", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AUTH_MODE = "mock";
    process.env.PORT = "3016";
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

  it("signs publish rights, blocks PDR and foreign rooms, and verifies webhooks", async () => {
    const founder = await login(app, "founder.fen");
    const teacher = await login(app, "physics.fen");
    const fen = app.get(DepartmentProvisionerService).ensure(FEN_INSTITUTION_ID, "Fen");
    const voice =
      fen.channels.find((channel) => channel.slug === "matematik-zumresi-ses")?.id ?? "";
    const pdr = fen.channels.find((channel) => channel.slug === "pdr-gorusme-odasi")?.id ?? "";
    const issued = await app.inject({
      method: "POST",
      url: `/api/v1/channels/${voice}/voice-token`,
      headers: { authorization: `Bearer ${founder}` },
    });
    expect(issued.statusCode).toBe(201);
    const body: unknown = issued.json();
    const token =
      typeof body === "object" && body !== null && "token" in body && typeof body.token === "string"
        ? body.token
        : "";
    const roomName =
      typeof body === "object" &&
      body !== null &&
      "roomName" in body &&
      typeof body.roomName === "string"
        ? body.roomName
        : "";
    expect(claim(token, "canPublish")).toBe(true);
    expect(claim(token, "roomAdmin")).toBe(true);
    const spoken = await app.inject({
      method: "POST",
      url: `/api/v1/channels/${voice}/voice-token`,
      headers: { authorization: `Bearer ${teacher}` },
    });
    const teacherBody: unknown = spoken.json();
    const teacherToken =
      typeof teacherBody === "object" &&
      teacherBody !== null &&
      "token" in teacherBody &&
      typeof teacherBody.token === "string"
        ? teacherBody.token
        : "";
    expect(claim(teacherToken, "canPublish")).toBe(true);
    expect(claim(teacherToken, "roomAdmin")).toBe(false);
    const denied = await app.inject({
      method: "POST",
      url: `/api/v1/channels/${pdr}/voice-token`,
      headers: { authorization: `Bearer ${teacher}` },
    });
    expect(denied.statusCode).toBe(403);
    expect(denied.json()).toMatchObject({ code: "PDR_ACCESS_DENIED" });
    await expectForeignRoom(app, founder);
    await expectWebhook(app, roomName, voice);
  });
});

async function expectForeignRoom(app: NestFastifyApplication, founder: string): Promise<void> {
  const anadolu = app.get(DepartmentProvisionerService).ensure(ANADOLU_INSTITUTION_ID, "Anadolu");
  const foreign = anadolu.channels.find((channel) => channel.slug === "matematik-zumresi-ses");
  const response = await app.inject({
    method: "POST",
    url: `/api/v1/channels/${foreign?.id ?? "missing"}/voice-token`,
    headers: { authorization: `Bearer ${founder}` },
  });
  expect(response.statusCode).toBe(403);
  expect(response.json()).toMatchObject({ code: "TENANT_FORBIDDEN" });
}

async function expectWebhook(
  app: NestFastifyApplication,
  roomName: string,
  channelId: string,
): Promise<void> {
  const event = {
    event: "participant_left",
    room: { name: roomName },
    participant: { identity: "018f0000-0000-7000-8000-000000000003", name: "Ayşe Kurucu" },
  };
  const raw = JSON.stringify(event);
  const bad = await app.inject({
    method: "POST",
    url: "/api/v1/webhooks/livekit",
    headers: { authorization: "Bearer not-a-token" },
    payload: event,
  });
  expect(bad.statusCode).toBe(401);
  const signed = signLiveKitWebhook(raw, "devkey", "dijios-connect-local-dev-secret-key");
  const ok = await app.inject({
    method: "POST",
    url: "/api/v1/webhooks/livekit",
    headers: { authorization: `Bearer ${signed}` },
    payload: event,
  });
  expect(ok.statusCode).toBe(201);
  expect(app.get(VoiceRoomsService).identities(channelId)).not.toContain(
    "018f0000-0000-7000-8000-000000000003",
  );
}
