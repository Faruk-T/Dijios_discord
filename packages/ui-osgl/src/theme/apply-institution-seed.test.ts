import { describe, expect, it } from "vitest";
import { applyInstitutionSeed } from "./apply-institution-seed.js";
import { DIJIOS_OXFORD_SEED } from "./dijios-theme.tokens.js";

function surface(): {
  lang: string;
  dataset: Record<string, string | undefined>;
  style: { setProperty(name: string, value: string): void };
  values: Map<string, string>;
} {
  const values = new Map<string, string>();
  return {
    lang: "en",
    dataset: {},
    values,
    style: {
      setProperty(name: string, value: string): void {
        values.set(name, value);
      },
    },
  };
}

describe("institution seed", () => {
  it("applies the oxford seed and a safe school color", () => {
    const target = surface();
    const applied = applyInstitutionSeed(target, "#1D3557");
    expect(applied).toBe("#1D3557");
    expect(target.lang).toBe("tr");
    expect(target.dataset["seed"]).toBe("dijios-oxford");
    expect(target.values.get("--djs-primary")).toBe("#1D3557");
    expect(target.values.get("--uxu-primary")).toBe("#1D3557");
    expect(target.values.get("--djs-oxford-navy")).toBe(DIJIOS_OXFORD_SEED.oxfordNavy);
    expect(target.values.get("--djs-steel-cerulean")).toBe(DIJIOS_OXFORD_SEED.steelCerulean);
  });

  it("falls back to oxford navy when the color is not a hex seed", () => {
    const target = surface();
    expect(applyInstitutionSeed(target, "navy")).toBe("#002147");
  });
});
