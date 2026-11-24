import { DIJIOS_OXFORD_SEED, DIJIOS_THEME_VARIABLES } from "./dijios-theme.tokens.js";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export interface InstitutionSeedSurface {
  lang: string;
  dataset: Record<string, string>;
  style: { setProperty(name: string, value: string): void };
}

export function resolveInstitutionColor(primaryColor: string): string {
  return HEX_COLOR.test(primaryColor) ? primaryColor : DIJIOS_OXFORD_SEED.oxfordNavy;
}

export function applyInstitutionSeed(
  surface: InstitutionSeedSurface,
  primaryColor: string,
): string {
  const primary = resolveInstitutionColor(primaryColor);
  surface.lang = "tr";
  surface.dataset["seed"] = DIJIOS_OXFORD_SEED.id;
  surface.style.setProperty(DIJIOS_THEME_VARIABLES.primary, primary);
  surface.style.setProperty(DIJIOS_THEME_VARIABLES.oxfordNavy, DIJIOS_OXFORD_SEED.oxfordNavy);
  surface.style.setProperty(DIJIOS_THEME_VARIABLES.prussianNavy, DIJIOS_OXFORD_SEED.prussianNavy);
  surface.style.setProperty(DIJIOS_THEME_VARIABLES.steelCerulean, DIJIOS_OXFORD_SEED.steelCerulean);
  surface.style.setProperty(DIJIOS_THEME_VARIABLES.uxuPrimary, primary);
  return primary;
}
