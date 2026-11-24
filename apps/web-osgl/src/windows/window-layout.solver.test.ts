import { describe, expect, it } from "vitest";
import { clampRect, computeSnapRects } from "./window-layout.solver.js";

const viewport = { width: 1000, height: 600, top: 40, left: 10 };

describe("window layout solver", () => {
  it("splits the viewport side by side and into a grid", () => {
    const side = computeSnapRects(2, "side-by-side", viewport);
    const grid = computeSnapRects(4, "grid", viewport);
    expect(side).toHaveLength(2);
    expect(side[0]?.width).toBe(500);
    expect(side[1]?.x).toBe(510);
    expect(grid).toHaveLength(4);
    expect(grid[3]?.y).toBe(340);
  });

  it("cascades inside the viewport and clamps oversized rects", () => {
    const cascade = computeSnapRects(3, "cascade", viewport);
    expect(cascade[1]?.x).toBe(38);
    expect(cascade[2]?.y).toBe(96);
    expect(clampRect({ x: -40, y: 900, width: 2000, height: 100 }, viewport)).toEqual({
      x: 10,
      y: 540,
      width: 1000,
      height: 100,
    });
  });
});
