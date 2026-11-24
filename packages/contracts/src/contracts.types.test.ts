import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  AuthenticatedSession,
  ClientToServerEvents,
  CursorPaginatedResult,
  MessageDeletedPayload,
  ProblemCode,
  ServerToClientEvents,
  Ulid,
  UuidV7,
} from "./index.js";
import { CHANNEL_TYPES } from "./workspace-channel.contracts.js";
import { PRESENCE_STATUSES } from "./tenant-auth.contracts.js";
import { PROBLEM_CODES } from "./problem-details.contracts.js";

describe("problem and presence vocabularies", () => {
  it("keeps RFC 7807 codes stable", () => {
    expect(Object.values(PROBLEM_CODES)).toEqual([
      "TENANT_FORBIDDEN",
      "UNAUTHORIZED",
      "VALIDATION_FAILED",
      "ROOM_FULL",
      "PDR_ACCESS_DENIED",
    ]);
    expectTypeOf<ProblemCode>().toEqualTypeOf<(typeof PROBLEM_CODES)[keyof typeof PROBLEM_CODES]>();
  });

  it("lists academic presence and channel kinds", () => {
    expect(PRESENCE_STATUSES.IN_CLASS).toBe("IN_CLASS");
    expect(CHANNEL_TYPES.VIDEO_STAGE).toBe("VIDEO_STAGE");
    expect(Object.keys(CHANNEL_TYPES)).toEqual([
      "TEXT",
      "VOICE",
      "VIDEO_STAGE",
      "ANNOUNCEMENT",
      "DM",
    ]);
  });
});

describe("shared contract shapes", () => {
  it("types sessions, pages, and socket handlers", () => {
    expectTypeOf<AuthenticatedSession>().toHaveProperty("institution");
    expectTypeOf<CursorPaginatedResult<AuthenticatedSession>["nextCursor"]>().toEqualTypeOf<
      UuidV7 | Ulid | string | null
    >();
    expectTypeOf<CursorPaginatedResult<AuthenticatedSession, string>["nextCursor"]>().toEqualTypeOf<
      string | null
    >();
    expectTypeOf<MessageDeletedPayload["messageId"]>().toEqualTypeOf<UuidV7>();
    expectTypeOf<ClientToServerEvents["chat:message_send"]>().toBeFunction();
    expectTypeOf<ClientToServerEvents["voice:hand_raise"]>().toBeFunction();
    expectTypeOf<ServerToClientEvents["voice:room_state_updated"]>().toBeFunction();
    expectTypeOf<ServerToClientEvents["presence:updated"]>().toBeFunction();
  });
});
