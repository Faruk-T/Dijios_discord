import type { Ulid, UuidV7 } from "@dijios-connect/contracts";
import { describe, expect, expectTypeOf, it } from "vitest";
import { createUlid, createUuidV7, parseUlid, parseUuidV7 } from "./id-generator.js";

describe("uuid v7 and ulid", () => {
  it("returns branded time-ordered identifiers", () => {
    const earlier = createUuidV7(1_700_000_000_000);
    const later = createUuidV7(1_700_000_000_100);
    expect(earlier < later).toBe(true);
    expect(earlier[14]).toBe("7");
    expect(createUlid(1_700_000_000_000)).toHaveLength(26);
    expectTypeOf(createUuidV7()).toEqualTypeOf<UuidV7>();
    expectTypeOf(createUlid()).toEqualTypeOf<Ulid>();
  });

  it("rejects malformed identifiers", () => {
    expect(parseUuidV7("018f0000-0000-7000-8000-000000000001")[14]).toBe("7");
    expect(() => parseUuidV7("018f0000-0000-4000-8000-000000000001")).toThrow(/UUIDv7/);
    expect(() => parseUlid("01JFEN0000000000000000000I")).toThrow(/ULID/);
  });
});
