export const LANDING_GEO_SHELL = {
  name: "@dijios-connect/landing-geo",
  locale: "tr-TR",
} as const;

export function readLandingLocale(): (typeof LANDING_GEO_SHELL)["locale"] {
  return LANDING_GEO_SHELL.locale;
}
