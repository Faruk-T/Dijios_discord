import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildSchemaGraph } from "./schema-graph.js";

describe("schema graph", () => {
  it("publishes organization, software, faq, and howto nodes", () => {
    const graph = buildSchemaGraph();
    const types = graph["@graph"].map((node) => node["@type"]);
    expect(types).toEqual([
      "Organization",
      "Organization",
      "SoftwareApplication",
      "FAQPage",
      "HowTo",
    ]);
    const software = graph["@graph"][2];
    if (software === undefined || software["@type"] !== "SoftwareApplication") {
      throw new Error("software node missing");
    }
    expect(software.applicationCategory).toBe("EducationalApplication");
    expect(software.operatingSystem).toBe("Web, Windows, macOS, iOS, Android");
    expect(software.featureList.join(" ")).toContain("LiveKit");
  });
});

describe("public geo files", () => {
  it("keeps the teacher app out of the crawler allow list", () => {
    const robots = readFileSync(new URL("../../public/robots.txt", import.meta.url), "utf8");
    for (const agent of [
      "GPTBot",
      "OAI-SearchBot",
      "Google-Extended",
      "ClaudeBot",
      "PerplexityBot",
      "*",
    ]) {
      expect(robots).toContain(`User-agent: ${agent}`);
    }
    expect(robots).toContain("Disallow: /app/");
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toContain("Sitemap: https://connect.dijios.com/sitemap.xml");
    const llms = readFileSync(new URL("../../public/llms.txt", import.meta.url), "utf8");
    expect(llms.startsWith("# dijiOS Connect")).toBe(true);
    expect(llms).toContain("gerçek zamanlı sesli, görüntülü ve zümre işbirliği katmanı");
  });
});
