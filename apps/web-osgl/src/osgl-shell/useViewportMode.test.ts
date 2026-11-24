import { describe, expect, it } from "vitest";
import { viewportModeFor } from "./useViewportMode.js";

describe("viewport mode", () => {
  it("uses the compact shell below 768px", () => {
    expect(viewportModeFor(767)).toBe("compact");
    expect(viewportModeFor(768)).toBe("desktop");
  });
});
