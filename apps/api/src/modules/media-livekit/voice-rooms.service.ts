import type { VoiceRoomStatePayload, VoiceTokenResponse } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  TenantForbiddenException,
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { parseUuidV7 } from "../../common/ids/id-generator.js";
import { EnvService } from "../../config/env.service.js";
import {
  SCHOOL_DIRECTORY_PORT,
  type SchoolDirectoryPort,
} from "../directory/school-directory.port.js";
import { ChannelAccessService } from "../messaging/channel-access.service.js";
import { PresenceService } from "../realtime/presence.service.js";
import type { StoredChannel } from "../workspaces/workspace-store.port.js";
import {
  WORKSPACE_STORE_PORT,
  type WorkspaceStorePort,
} from "../workspaces/workspace-store.port.js";
import { DepartmentProvisionerService } from "../workspaces/department-provisioner.service.js";
import { signLiveKitAccessToken, verifyLiveKitWebhook } from "./livekit-jwt.signer.js";
import { InMemoryVoiceRooms, type VoiceMember, type VoiceRoomRecord } from "./voice-room.memory.js";

@Injectable()
export class VoiceRoomsService {
  private readonly book = new InMemoryVoiceRooms();

  constructor(
    @Inject(WORKSPACE_STORE_PORT) private readonly workspaces: WorkspaceStorePort,
    @Inject(DepartmentProvisionerService)
    private readonly provisioner: DepartmentProvisionerService,
    @Inject(ChannelAccessService) private readonly access: ChannelAccessService,
    @Inject(SCHOOL_DIRECTORY_PORT) private readonly directory: SchoolDirectoryPort,
    @Inject(PresenceService) private readonly presence: PresenceService,
    @Inject(EnvService) private readonly env: EnvService,
  ) {}

  issue(auth: AuthContext, channelId: string): VoiceTokenResponse {
    const channel = this.locate(auth, channelId);
    const flags = this.access.flags(auth, channel);
    if (!flags.canConnectVoice) {
      throw new TenantForbiddenException("This role cannot join the voice room.");
    }
    const teacher = this.directory.findTeacherById(auth.userId);
    const roomName = `institution:${auth.institutionId}:channel:${channel.id}`;
    const room = this.book.ensure(auth.institutionId, channel.id, roomName);
    const member: VoiceMember = {
      userId: auth.userId,
      displayName: teacher?.fullName ?? auth.userId,
      speaking: false,
      selfMuted: !flags.canSpeak,
      cameraEnabled: false,
      screenSharing: false,
      handRaised: false,
    };
    this.book.join(room, member);
    this.emit(room);
    const permissions = {
      canPublish: flags.canSpeak,
      canSubscribe: flags.canView,
      canPublishData: true,
      roomAdmin: flags.canManageChannel,
    };
    return {
      livekitUrl: this.env.config.LIVEKIT_URL,
      token: signLiveKitAccessToken({
        apiKey: this.env.config.LIVEKIT_API_KEY,
        apiSecret: this.env.config.LIVEKIT_API_SECRET,
        identity: auth.userId,
        name: member.displayName,
        roomName,
        canPublish: permissions.canPublish,
        canSubscribe: permissions.canSubscribe,
        roomAdmin: permissions.roomAdmin,
      }),
      roomName,
      participantIdentity: auth.userId,
      permissions,
    };
  }

  leave(auth: AuthContext, channelId: string): { ok: true } {
    const channel = this.locate(auth, channelId);
    const room = this.book.ensure(
      auth.institutionId,
      channel.id,
      `institution:${auth.institutionId}:channel:${channel.id}`,
    );
    this.book.leave(room, auth.userId);
    this.emit(room);
    return { ok: true };
  }

  applyWebhook(authorization: string | undefined, rawBody: string, body: unknown): { ok: true } {
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : (authorization ?? "");
    if (!verifyLiveKitWebhook(token, rawBody, this.env.config.LIVEKIT_API_SECRET)) {
      throw new UnauthorizedDomainException("LiveKit webhook signature is invalid.");
    }
    const event = readEvent(body);
    const room = this.book.byRoomName(event.roomName);
    if (room === null) {
      throw new ValidationDomainException("Voice room was not found.");
    }
    if (event.event === "participant_left") {
      this.book.leave(room, event.participantIdentity);
    } else {
      this.book.join(room, {
        userId: event.participantIdentity,
        displayName: event.participantName,
        speaking: false,
        selfMuted: false,
        cameraEnabled: false,
        screenSharing: false,
        handRaised: false,
      });
    }
    this.emit(room);
    return { ok: true };
  }

  identities(channelId: string): readonly string[] {
    return this.book.identities(channelId);
  }

  activeNames(institutionId: string): readonly string[] {
    return this.book.activeNames(institutionId);
  }

  private locate(auth: AuthContext, channelId: string): StoredChannel {
    const foreign = this.workspaces
      .list()
      .find(
        (workspace) =>
          workspace.institutionId !== auth.institutionId &&
          workspace.channels.some((channel) => channel.id === channelId),
      );
    if (foreign !== undefined) {
      throw new TenantForbiddenException();
    }
    this.provisioner.ensure(auth.institutionId, "Kurum");
    const channel = this.access.require(auth, channelId, false);
    if (channel.type !== "VOICE" && channel.type !== "VIDEO_STAGE") {
      throw new ValidationDomainException("Voice tokens are issued only for voice rooms.");
    }
    return channel;
  }

  private emit(room: VoiceRoomRecord): void {
    const payload: VoiceRoomStatePayload = {
      channelId: parseUuidV7(room.channelId),
      participants: room.members.map((member) => ({
        userId: parseUuidV7(member.userId),
        displayName: member.displayName,
        livekitIdentity: member.userId,
        speaking: member.speaking,
        flags: {
          selfMuted: member.selfMuted,
          selfDeafened: false,
          cameraEnabled: member.cameraEnabled,
          screenSharing: member.screenSharing,
          handRaised: member.handRaised,
        },
      })),
    };
    this.presence.publishRoom(room.institutionId, payload);
  }
}

function readEvent(body: unknown): {
  readonly event: "participant_joined" | "participant_left";
  readonly roomName: string;
  readonly participantIdentity: string;
  readonly participantName: string;
} {
  if (typeof body !== "object" || body === null) {
    throw new ValidationDomainException("LiveKit webhook payload is invalid.");
  }
  const event = "event" in body ? body.event : null;
  const room =
    "room" in body && typeof body.room === "object" && body.room !== null ? body.room : null;
  const participant =
    "participant" in body && typeof body.participant === "object" && body.participant !== null
      ? body.participant
      : null;
  const roomName =
    room !== null && "name" in room && typeof room.name === "string" ? room.name : "";
  const identity =
    participant !== null && "identity" in participant && typeof participant.identity === "string"
      ? participant.identity
      : "";
  const name =
    participant !== null && "name" in participant && typeof participant.name === "string"
      ? participant.name
      : "";
  if (
    (event !== "participant_joined" && event !== "participant_left") ||
    roomName === "" ||
    identity === ""
  ) {
    throw new ValidationDomainException("LiveKit webhook payload is invalid.");
  }
  return { event, roomName, participantIdentity: identity, participantName: name || identity };
}
