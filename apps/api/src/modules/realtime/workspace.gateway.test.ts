import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { io, type Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FEN_INSTITUTION_ID } from "../../../prisma/seed-data.js";
import { createApp } from "../../app.factory.js";
import { WorkspaceGateway } from "./workspace.gateway.js";

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

function connect(url: string, token: string): Socket {
  return io(url, { auth: { token }, transports: ["websocket"], reconnection: false });
}

describe("workspace gateway", () => {
  let app: NestFastifyApplication;
  let url = "";
  const sockets: Socket[] = [];

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AUTH_MODE = "mock";
    process.env.PORT = "3011";
    process.env.JWT_ACCESS_SECRET = "test-access-secret-value";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret-value";
    process.env.DIJIOS_API_BASE_URL = "https://app.dijios.com";
    process.env.DATABASE_URL = "postgresql://dijios:dijios@localhost:5432/dijios_connect";
    process.env.REDIS_URL = "redis://localhost:6379";
    process.env.REDIS_ADAPTER_ENABLED = "false";
    app = await createApp();
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.getHttpServer().address();
    if (typeof address === "string" || address === null) {
      throw new Error("HTTP server did not bind a port.");
    }
    url = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    for (const socket of sockets) {
      socket.close();
    }
    if (app !== undefined) {
      await app.close();
    }
  });

  it("drops an invalid token and delivers events only inside the institution room", async () => {
    const rejected = connect(url, "not-a-token");
    sockets.push(rejected);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(rejected.connected).toBe(false);
    const accepted = connect(url, await login(app));
    sockets.push(accepted);
    await new Promise<void>((resolve, reject) => {
      accepted.on("connect", () => resolve());
      accepted.on("connect_error", reject);
    });
    const heard = new Promise<unknown>((resolve) => {
      accepted.on("presence:updated", resolve);
    });
    app
      .get(WorkspaceGateway)
      .server.to(`institution:${FEN_INSTITUTION_ID}`)
      .emit("presence:updated", {
        userId: "018f0000-0000-7000-8000-000000000003",
        status: "ONLINE",
        currentLesson: null,
        observedAt: "2026-11-24T09:00:00.000Z",
      });
    await expect(heard).resolves.toMatchObject({ status: "ONLINE" });
  });
});
