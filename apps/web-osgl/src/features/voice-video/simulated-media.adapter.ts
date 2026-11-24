import { shapeTeacherNoise, teacherNoiseConstraints } from "./audio-noise-processor.js";
import type {
  MediaConnectInput,
  MediaParticipant,
  MediaRoomSnapshot,
  MediaTransportPort,
} from "./media-transport.port.js";

const QUIET: MediaParticipant = {
  id: "mehmet",
  name: "Mehmet Müdür",
  branch: "İdare",
  speaking: false,
  micEnabled: false,
  cameraEnabled: false,
  screenSharing: false,
  handRaised: false,
};

export class SimulatedMediaAdapter implements MediaTransportPort {
  private snapshot: MediaRoomSnapshot = { channelId: "", channelName: "", participants: [] };
  private readonly listeners = new Set<(snapshot: MediaRoomSnapshot) => void>();
  private noise = true;

  connect(input: MediaConnectInput): Promise<MediaRoomSnapshot> {
    const self: MediaParticipant = {
      id: "self",
      name: input.displayName,
      branch: "Zümre",
      speaking: false,
      micEnabled: true,
      cameraEnabled: false,
      screenSharing: false,
      handRaised: false,
    };
    const seeded = input.channelName.toLocaleLowerCase("tr-TR").includes("matematik")
      ? [
          {
            id: "zeynep",
            name: "Zeynep Başaran",
            branch: "Matematik",
            speaking: true,
            micEnabled: true,
            cameraEnabled: true,
            screenSharing: false,
            handRaised: false,
          },
          QUIET,
        ]
      : [];
    this.snapshot = { ...input, participants: [...seeded, self] };
    this.publish();
    return Promise.resolve(this.snapshot);
  }

  disconnect(): Promise<void> {
    this.snapshot = { channelId: "", channelName: "", participants: [] };
    this.publish();
    return Promise.resolve();
  }

  setMicEnabled(enabled: boolean): void {
    this.patch("self", { micEnabled: enabled, speaking: enabled });
  }

  setDeafened(enabled: boolean): void {
    if (enabled) {
      this.patch("self", { micEnabled: false, speaking: false });
    }
  }

  setCameraEnabled(enabled: boolean): void {
    this.patch("self", { cameraEnabled: enabled });
  }

  setScreenShareEnabled(enabled: boolean): void {
    this.patch("self", { screenSharing: enabled });
  }

  setNoiseSuppression(enabled: boolean): void {
    this.noise = enabled;
    teacherNoiseConstraints(enabled);
    shapeTeacherNoise(null, enabled);
  }

  setHandRaised(raised: boolean): void {
    this.patch("self", { handRaised: raised });
  }

  subscribe(listener: (snapshot: MediaRoomSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private patch(id: string, next: Partial<MediaParticipant>): void {
    this.snapshot = {
      ...this.snapshot,
      participants: this.snapshot.participants.map((item) =>
        item.id === id ? { ...item, ...next } : item,
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
