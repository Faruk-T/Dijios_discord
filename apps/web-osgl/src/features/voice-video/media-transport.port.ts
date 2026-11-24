export interface MediaParticipant {
  readonly id: string;
  readonly name: string;
  readonly branch: string;
  readonly speaking: boolean;
  readonly micEnabled: boolean;
  readonly cameraEnabled: boolean;
  readonly screenSharing: boolean;
  readonly handRaised: boolean;
}

export interface MediaConnectInput {
  readonly channelId: string;
  readonly channelName: string;
  readonly displayName: string;
}

export interface MediaRoomSnapshot {
  readonly channelId: string;
  readonly channelName: string;
  readonly participants: readonly MediaParticipant[];
}

export interface MediaTransportPort {
  connect(input: MediaConnectInput): Promise<MediaRoomSnapshot>;
  disconnect(): Promise<void>;
  setMicEnabled(enabled: boolean): void;
  setDeafened(enabled: boolean): void;
  setCameraEnabled(enabled: boolean): void;
  setScreenShareEnabled(enabled: boolean): void;
  setNoiseSuppression(enabled: boolean): void;
  setHandRaised(raised: boolean): void;
  subscribe(listener: (snapshot: MediaRoomSnapshot) => void): () => void;
}
