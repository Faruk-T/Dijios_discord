export const WEB_OSGL_SHELL = {
  name: "@dijios-connect/web-osgl",
  designSystem: "truncgil-uxigl",
  seed: "#002147",
} as const;

export function readWebShellSeed(): (typeof WEB_OSGL_SHELL)["seed"] {
  return WEB_OSGL_SHELL.seed;
}
