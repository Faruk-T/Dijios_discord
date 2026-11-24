import type { JSX } from "react";
import { describe, expect, it } from "vitest";
import { WindowRegistry } from "./window-registry.js";

const blank = (): JSX.Element => <span>plugin</span>;

describe("window registry", () => {
  it("accepts a new app without changing the registry class", () => {
    const registry = new WindowRegistry();
    registry.register({
      appId: "communication-hub",
      title: "İletişim Merkezi",
      category: "İletişim",
      icon: "forum",
      defaultSize: { width: 100, height: 100 },
      minSize: { width: 44, height: 44 },
      fullBleed: false,
      render: blank,
    });
    registry.register({
      appId: "exam-poll",
      title: "Zümre Oylama",
      category: "Akademik",
      icon: "how_to_vote",
      defaultSize: { width: 100, height: 100 },
      minSize: { width: 44, height: 44 },
      fullBleed: false,
      render: blank,
    });
    expect(registry.list().map((item) => item.appId)).toEqual(["communication-hub", "exam-poll"]);
  });
});
