import type { Room } from "livekit-client";
import { useAuthStore } from "../auth/auth.store.js";
import type {
  MediaConnectInput,
  MediaParticipant,
  MediaRoomSnapshot,
  MediaTransportPort,
} from "./media-transport.port.js";

export interface PreparedVoiceJoin {
  readonly url: string;
  readonly token: string;
}

export class LiveKitTransportAdapter implements MediaTransportPort {
  private room: Room | null = null;
  private channelId = "";
  private snapshot: MediaRoomSnapshot = { channelId: "", channelName: "", participants: [] };
  private readonly listeners = new Set<(snapshot: MediaRoomSnapshot) => void>();

  prepare(input: MediaConnectInput): Promise<PreparedVoiceJoin> {
    this.channelId = input.channelId;
    return requestVoiceToken(input.channelId);
  }

  async joinPrepared(
    input: MediaConnectInput,
    granted: PreparedVoiceJoin,
  ): Promise<MediaRoomSnapshot> {
    const livekit = await import("livekit-client");
    const room = new livekit.Room({ adaptiveStream: true, dynacast: true });
    await room.connect(granted.url, granted.token);
    this.room = room;
    this.channelId = input.channelId;
    this.snapshot = {
      channelId: input.channelId,
      channelName: input.channelName,
      participants: [selfParticipant(input.displayName)],
    };
    const refresh = (): void => this.syncRemotes(input.displayName);
    room.on(livekit.RoomEvent.ParticipantConnected, refresh);
    room.on(livekit.RoomEvent.ParticipantDisconnected, refresh);
    room.on(livekit.RoomEvent.ActiveSpeakersChanged, refresh);
    this.syncRemotes(input.displayName);
    return this.snapshot;
  }

  async connect(input: MediaConnectInput): Promise<MediaRoomSnapshot> {
    const granted = await this.prepare(input);
    return this.joinPrepared(input, granted);
  }

  async disconnect(): Promise<void> {
    const channelId = this.channelId;
    await this.room?.disconnect();
    this.room = null;
    this.channelId = "";
    if (channelId !== "") {
      await notifyLeave(channelId);
    }
  }

  setMicEnabled(enabled: boolean): void {
    void this.room?.localParticipant.setMicrophoneEnabled(enabled);
    this.patch({ micEnabled: enabled, speaking: enabled });
  }

  setDeafened(enabled: boolean): void {
    void this.room?.localParticipant.setMicrophoneEnabled(!enabled);
  }

  setCameraEnabled(enabled: boolean): void {
    void this.room?.localParticipant.setCameraEnabled(enabled);
    this.patch({ cameraEnabled: enabled });
  }

  setScreenShareEnabled(enabled: boolean): void {
    void this.room?.localParticipant.setScreenShareEnabled(enabled, { contentHint: "detail" });
    this.patch({ screenSharing: enabled });
  }

  setNoiseSuppression(): void {
    return undefined;
  }

  setHandRaised(raised: boolean): void {
    this.patch({ handRaised: raised });
  }

  subscribe(listener: (snapshot: MediaRoomSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private syncRemotes(displayName: string): void {
    const room = this.room;
    if (room === null) {
      return;
    }
    const speaking = new Set(room.activeSpeakers.map((peer) => peer.identity));
    const self =
      this.snapshot.participants.find((item) => item.id === "self") ?? selfParticipant(displayName);
    const remotes = [...room.remoteParticipants.values()].map((peer) =>
      remoteParticipant(peer.identity, peer.name, peer, speaking.has(peer.identity)),
    );
    this.snapshot = {
      ...this.snapshot,
      participants: [
        ...remotes,
        { ...self, speaking: speaking.has(room.localParticipant.identity) },
      ],
    };
    this.publish();
  }

  private patch(next: Partial<MediaParticipant>): void {
    this.snapshot = {
      ...this.snapshot,
      participants: this.snapshot.participants.map((item) =>
        item.id === "self" ? { ...item, ...next } : item,
      ),
    };
    this.publish();
  }

  private publish(): void {
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}

function remoteParticipant(
  identity: string,
  name: string | undefined,
  peer: {
    readonly isMicrophoneEnabled: boolean;
    readonly isCameraEnabled: boolean;
    readonly isScreenShareEnabled: boolean;
  },
  speaking: boolean,
): MediaParticipant {
  return {
    id: identity,
    name: name !== undefined && name.length > 0 ? name : identity,
    branch: "",
    speaking,
    micEnabled: peer.isMicrophoneEnabled,
    cameraEnabled: peer.isCameraEnabled,
    screenSharing: peer.isScreenShareEnabled,
    handRaised: false,
  };
}

async function requestVoiceToken(channelId: string): Promise<PreparedVoiceJoin> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
  const access = useAuthStore.getState().session?.accessToken;
  const response = await fetch(`${base}/api/v1/channels/${channelId}/voice-token`, {
    method: "POST",
    headers: bearer(access),
  });
  const body: unknown = await response.json();
  if (!response.ok || !isToken(body)) {
    throw new Error("Voice token was refused.");
  }
  return { url: body.livekitUrl, token: body.token };
}

async function notifyLeave(channelId: string): Promise<void> {
  try {
    const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    const access = useAuthStore.getState().session?.accessToken;
    await fetch(`${base}/api/v1/channels/${channelId}/voice-leave`, {
      method: "POST",
      headers: bearer(access),
    });
  } catch {
    return;
  }
}

function bearer(access: string | undefined): HeadersInit {
  return {
    "content-type": "application/json",
    ...(access === undefined ? {} : { authorization: `Bearer ${access}` }),
  };
}

function isToken(value: unknown): value is { livekitUrl: string; token: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "livekitUrl" in value &&
    typeof value.livekitUrl === "string" &&
    "token" in value &&
    typeof value.token === "string"
  );
}

function selfParticipant(name: string): MediaParticipant {
  return {
    id: "self",
    name,
    branch: "Zümre",
    speaking: false,
    micEnabled: true,
    cameraEnabled: false,
    screenSharing: false,
    handRaised: false,
  };
}
