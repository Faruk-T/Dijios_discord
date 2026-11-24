import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ANADOLU_INSTITUTION_ID, FEN_INSTITUTION_ID } from "../../../prisma/seed-data.js";
import { createApp } from "../../app.factory.js";
import { DepartmentProvisionerService } from "./department-provisioner.service.js";

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

function slugs(body: unknown): string[] {
  if (typeof body !== "object" || body === null || !("categories" in body)) {
    return [];
  }
  const categories = body.categories;
  if (!Array.isArray(categories)) {
    return [];
  }
  return categories.flatMap((category: unknown) => {
    if (typeof category !== "object" || category === null || !("channels" in category)) {
      return [];
    }
    const channels = category.channels;
    if (!Array.isArray(channels)) {
      return [];
    }
    return channels.flatMap((channel: unknown) =>
      typeof channel === "object" &&
      channel !== null &&
      "slug" in channel &&
      typeof channel.slug === "string"
        ? [channel.slug]
        : [],
    );
  });
}

describe("workspace tree", () => {
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

  it("provisions once, hides PDR from founders, and isolates institutions", async () => {
    const founder = await login(app, "founder.fen");
    const counselor = await login(app, "counselor.fen");
    const first = await app.inject({
      method: "GET",
      url: "/api/v1/workspaces/current/tree",
      headers: { authorization: `Bearer ${founder}` },
    });
    const second = await app.inject({
      method: "GET",
      url: "/api/v1/workspaces/current/tree",
      headers: { authorization: `Bearer ${founder}` },
    });
    const counselorTree = await app.inject({
      method: "GET",
      url: "/api/v1/workspaces/current/tree",
      headers: { authorization: `Bearer ${counselor}` },
    });
    const anadolu = app.get(DepartmentProvisionerService).ensure(ANADOLU_INSTITUTION_ID, "Anadolu");
    const founderSlugs = slugs(first.json());
    expect(first.statusCode).toBe(200);
    expect(second.json()).toEqual(first.json());
    expect(founderSlugs).toContain("matematik-zumresi");
    expect(founderSlugs).not.toContain("pdr-vaka-odasi");
    expect(slugs(counselorTree.json())).toContain("pdr-vaka-odasi");
    const serialized = JSON.stringify(first.json());
    expect(serialized).toContain(FEN_INSTITUTION_ID);
    expect(serialized).not.toContain(anadolu.id);
    expect(serialized).not.toContain(ANADOLU_INSTITUTION_ID);
    const body: unknown = first.json();
    const categoryId =
      typeof body === "object" &&
      body !== null &&
      "categories" in body &&
      Array.isArray(body.categories)
        ? (body.categories[0] as { id?: string }).id
        : undefined;
    const blocked = await app.inject({
      method: "POST",
      url: "/api/v1/workspaces/current/channels",
      headers: { authorization: `Bearer ${await login(app, "physics.fen")}` },
      payload: { name: "Deneme", slug: "deneme", type: "TEXT", categoryId, branchName: "Fizik" },
    });
    expect(blocked.statusCode).toBe(403);
  });
});
