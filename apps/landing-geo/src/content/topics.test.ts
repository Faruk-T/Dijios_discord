import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TOPIC_PAGES, leadWordCount } from "./topics.js";

describe("topic cluster", () => {
  it("keeps every lead inside the answer-first window", () => {
    for (const topic of TOPIC_PAGES) {
      const words = leadWordCount(topic.lead);
      expect(words).toBeGreaterThanOrEqual(45);
      expect(words).toBeLessThanOrEqual(70);
    }
  });

  it("lists every public route in the sitemap", () => {
    const xml = readFileSync(new URL("../../public/sitemap.xml", import.meta.url), "utf8");
    expect(xml).toContain("https://connect.dijios.com/</loc>");
    for (const topic of TOPIC_PAGES) {
      expect(xml).toContain(`https://connect.dijios.com${topic.path}</loc>`);
    }
    const index = readFileSync(new URL("../../public/sitemap-index.xml", import.meta.url), "utf8");
    expect(index).toContain("https://connect.dijios.com/sitemap.xml");
  });
});
