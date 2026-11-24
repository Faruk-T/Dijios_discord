export const UI_OSGL_PACKAGE = "@dijios-connect/ui-osgl" as const;

export const DIJIOS_BRAND_SEEDS = {
  oxfordNavy: "#002147",
  prussianNavy: "#1D3557",
  steelCerulean: "#457B9D",
} as const;

export { DIJIOS_OXFORD_SEED, DIJIOS_THEME_VARIABLES } from "./theme/dijios-theme.tokens.js";
export {
  applyInstitutionSeed,
  resolveInstitutionColor,
  type InstitutionSeedSurface,
} from "./theme/apply-institution-seed.js";
