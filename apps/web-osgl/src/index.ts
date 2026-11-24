import type { ChannelSummary, ServerToClientEvents } from "@dijios-connect/contracts";

export const WEB_OSGL_SHELL = {
  name: "@dijios-connect/web-osgl",
  designSystem: "truncgil-uxigl",
  seed: "#002147",
} as const;

export function readWebShellSeed(): (typeof WEB_OSGL_SHELL)["seed"] {
  return WEB_OSGL_SHELL.seed;
}

export type WebChannelProbe = Pick<ChannelSummary, "type" | "slug">;

export type WebVoiceEventProbe = ServerToClientEvents["voice:room_state_updated"];
