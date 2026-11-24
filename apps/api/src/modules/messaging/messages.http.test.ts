import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../app.factory.js";

async function login(app: NestFastifyApplication, dijiosUserId: string): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { institutionAlias: "fen-koleji", dijiosUserId },
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function channelId(body: unknown, slug: string): string {
  if (!isRecord(body) || !Array.isArray(body.categories)) {
    return "";
  }
  const categories: unknown[] = body.categories;
  for (const category of categories) {
    if (!isRecord(category) || !Array.isArray(category.channels)) {
      continue;
    }
    const channels: unknown[] = category.channels;
    for (const channel of channels) {
      if (isRecord(channel) && channel.slug === slug && typeof channel.id === "string") {
        return channel.id;
      }
    }
  }
  return "";
}

describe("channel messages", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AUTH_MODE = "mock";
    process.env.PORT = "3014";
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

  it("pages messages, blocks announcement teachers and PDR readers, and toggles reactions", async () => {
    const founder = await login(app, "founder.fen");
    const teacher = await login(app, "physics.fen");
    const tree = await app.inject({
      method: "GET",
      url: "/api/v1/workspaces/current/tree",
      headers: { authorization: `Bearer ${founder}` },
    });
    const math = channelId(tree.json(), "matematik-zumresi");
    const news = channelId(tree.json(), "duyurular");
    const counselorTree = await app.inject({
      method: "GET",
      url: "/api/v1/workspaces/current/tree",
      headers: { authorization: `Bearer ${await login(app, "counselor.fen")}` },
    });
    const pdr = channelId(counselorTree.json(), "pdr-vaka-odasi");
    const listed = await app.inject({
      method: "GET",
      url: `/api/v1/channels/${math}/messages?limit=1`,
      headers: { authorization: `Bearer ${founder}` },
    });
    expect(listed.statusCode).toBe(200);
    expect(Array.isArray(listed.json())).toBe(true);
    const denied = await app.inject({
      method: "POST",
      url: `/api/v1/channels/${news}/messages`,
      headers: { authorization: `Bearer ${teacher}` },
      payload: { content: "Öğretmen duyurusu" },
    });
    expect(denied.statusCode).toBe(403);
    const hidden = await app.inject({
      method: "GET",
      url: `/api/v1/channels/${pdr}/messages`,
      headers: { authorization: `Bearer ${teacher}` },
    });
    expect(hidden.statusCode).toBe(403);
    expect(hidden.json()).toMatchObject({ code: "PDR_ACCESS_DENIED" });
    const created = await app.inject({
      method: "POST",
      url: `/api/v1/channels/${math}/messages`,
      headers: { authorization: `Bearer ${founder}` },
      payload: { content: "Türev sınavı yarına kaldı." },
    });
    const message: unknown = created.json();
    const messageId =
      typeof message === "object" &&
      message !== null &&
      "id" in message &&
      typeof message.id === "string"
        ? message.id
        : "";
    const reacted = await app.inject({
      method: "POST",
      url: `/api/v1/messages/${messageId}/reactions`,
      headers: { authorization: `Bearer ${founder}` },
      payload: { emoji: "👍" },
    });
    expect(reacted.json()).toMatchObject({
      reactions: [{ emoji: "👍", count: 1, reactedByMe: true }],
    });
    const cleared = await app.inject({
      method: "POST",
      url: `/api/v1/messages/${messageId}/reactions`,
      headers: { authorization: `Bearer ${founder}` },
      payload: { emoji: "👍" },
    });
    expect(cleared.json()).toMatchObject({ reactions: [] });
  });
});
