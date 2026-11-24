import type { AuthenticatedSession, ProblemDetails } from "@dijios-connect/contracts";

export const API_SHELL = {
  name: "@dijios-connect/api",
  layer: "backend",
} as const;

export function readApiShellName(): (typeof API_SHELL)["name"] {
  return API_SHELL.name;
}

export type ApiSessionProbe = Pick<AuthenticatedSession, "institution" | "presence">;

export type ApiProblemCodeProbe = ProblemDetails["code"];
