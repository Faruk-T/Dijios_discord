import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface LiveKitAccessInput {
  readonly apiKey: string;
  readonly apiSecret: string;
  readonly identity: string;
  readonly name: string;
  readonly roomName: string;
  readonly canPublish: boolean;
  readonly canSubscribe: boolean;
  readonly roomAdmin: boolean;
  readonly nowSeconds?: number;
}

export function signLiveKitAccessToken(input: LiveKitAccessInput): string {
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    iss: input.apiKey,
    sub: input.identity,
    name: input.name,
    nbf: now,
    exp: now + 3600,
    video: {
      roomJoin: true,
      room: input.roomName,
      canPublish: input.canPublish,
      canSubscribe: input.canSubscribe,
      canPublishData: true,
      roomAdmin: input.roomAdmin,
    },
  });
  return `${header}.${payload}.${mac(header, payload, input.apiSecret)}`;
}

export function signLiveKitWebhook(rawBody: string, apiKey: string, apiSecret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    iss: apiKey,
    nbf: now,
    exp: now + 60,
    sha256: createHash("sha256").update(rawBody).digest("base64"),
  });
  return `${header}.${payload}.${mac(header, payload, apiSecret)}`;
}

export function verifyLiveKitWebhook(token: string, rawBody: string, apiSecret: string): boolean {
  const parts = token.split(".");
  const header = parts[0];
  const payload = parts[1];
  const signature = parts[2];
  if (
    header === undefined ||
    payload === undefined ||
    signature === undefined ||
    parts.length !== 3
  ) {
    return false;
  }
  const expected = mac(header, payload, apiSecret);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return false;
  }
  const digest = readSha(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
  return digest === createHash("sha256").update(rawBody).digest("base64");
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function mac(header: string, payload: string, secret: string): string {
  return createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
}

function readSha(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("sha256" in value)) {
    return null;
  }
  const digest = value.sha256;
  return typeof digest === "string" ? digest : null;
}
