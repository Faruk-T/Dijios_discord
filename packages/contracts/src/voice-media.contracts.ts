import type { UuidV7 } from "./primitives.contracts.js";

export interface VoiceTokenPermissions {
  readonly canPublish: boolean;
  readonly canSubscribe: boolean;
  readonly canPublishData: boolean;
  readonly roomAdmin: boolean;
}

export interface VoiceTokenResponse {
  readonly livekitUrl: string;
  readonly token: string;
  readonly roomName: string;
  readonly participantIdentity: string;
  readonly permissions: VoiceTokenPermissions;
}

export interface LiveKitWebhookEventDto {
  readonly event: "participant_joined" | "participant_left";
  readonly roomName: string;
  readonly participantIdentity: string;
  readonly participantName: string;
}

export interface StageControlRequestDto {
  readonly channelId: UuidV7;
  readonly handRaised: boolean;
  readonly screenSharing: boolean;
}
