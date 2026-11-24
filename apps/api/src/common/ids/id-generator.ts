import { randomBytes } from "node:crypto";
import type { Ulid, UuidV7 } from "@dijios-connect/contracts";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

function byteAt(bytes: Uint8Array, index: number): number {
  const value = bytes[index];
  if (value === undefined) {
    throw new Error(`Missing byte ${index}`);
  }
  return value;
}

function formatUuid(bytes: Uint8Array): string {
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createUuidV7(timestamp = Date.now()): UuidV7 {
  const bytes = randomBytes(16);
  const time = BigInt(timestamp);
  bytes[0] = Number((time >> 40n) & 0xffn);
  bytes[1] = Number((time >> 32n) & 0xffn);
  bytes[2] = Number((time >> 24n) & 0xffn);
  bytes[3] = Number((time >> 16n) & 0xffn);
  bytes[4] = Number((time >> 8n) & 0xffn);
  bytes[5] = Number(time & 0xffn);
  bytes[6] = (byteAt(bytes, 6) & 0x0f) | 0x70;
  bytes[8] = (byteAt(bytes, 8) & 0x3f) | 0x80;
  return parseUuidV7(formatUuid(bytes));
}

export function parseUuidV7(value: string): UuidV7 {
  const normalized = value.toLowerCase();
  if (!UUID_V7.test(normalized)) {
    throw new Error("Invalid UUIDv7");
  }
  return normalized as UuidV7;
}

function encodeTime(timestamp: number): string {
  let remaining = timestamp;
  let encoded = "";
  for (let index = 0; index < 10; index += 1) {
    encoded = `${CROCKFORD[remaining % 32] ?? "0"}${encoded}`;
    remaining = Math.floor(remaining / 32);
  }
  return encoded;
}

function encodeRandom(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let encoded = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      encoded += CROCKFORD[(value >> bits) & 31] ?? "0";
    }
  }
  return encoded;
}

export function createUlid(timestamp = Date.now()): Ulid {
  return parseUlid(`${encodeTime(timestamp)}${encodeRandom(randomBytes(10))}`);
}

export function parseUlid(value: string): Ulid {
  const normalized = value.toUpperCase();
  if (!ULID_PATTERN.test(normalized)) {
    throw new Error("Invalid ULID");
  }
  return normalized as Ulid;
}
