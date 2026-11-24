import type { Room } from "livekit-client";
import { useAuthStore } from "../auth/auth.store.js";
import type {
  MediaConnectInput,
  MediaParticipant,
  MediaRoomSnapshot,
  MediaTransportPort,
} from "./media-transport.port.js";

export class LiveKitTransportAdapter implements MediaTransportPort {
  private room: Room | null = null;
  private snapshot: MediaRoomSnapshot = { channelId: "", channelName: "", participants: [] };
  private readonly listeners = new Set<(snapshot: MediaRoomSnapshot) => void>();

  async connect(input: MediaConnectInput): Promise<MediaRoomSnapshot> {
    const token = await requestVoiceToken(input.channelId);
    const livekit = await import("livekit-client");
    const room = new livekit.Room({ adaptiveStream: true, dynacast: true });
    await room.connect(token.url, token.token);
    this.room = room;
    this.snapshot = {
      channelId: input.channelId,
      channelName: input.channelName,
      participants: [selfParticipant(input.displayName)],
    };
    this.publish();
    return this.snapshot;
  }

  async disconnect(): Promise<void> {
    await this.room?.disconnect();
    this.room = null;
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
    void this.room?.localParticipant.setScreenShareEnabled(enabled);
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

async function requestVoiceToken(channelId: string): Promise<{ url: string; token: string }> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
  const access = useAuthStore.getState().session?.accessToken;
  const response = await fetch(`${base}/api/v1/channels/${channelId}/voice-token`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(access === undefined ? {} : { authorization: `Bearer ${access}` }),
    },
  });
  const body: unknown = await response.json();
  if (!response.ok || !isToken(body)) {
    throw new Error("Voice token was refused.");
  }
  return { url: body.livekitUrl, token: body.token };
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
