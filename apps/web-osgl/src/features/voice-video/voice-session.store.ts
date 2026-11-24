import { create } from "zustand";
import type { MediaParticipant, MediaTransportPort } from "./media-transport.port.js";
import { openMediaTransport } from "./open-media-transport.js";

export interface VoiceSessionState {
  readonly connectedChannelId: string | null;
  readonly connectedChannelName: string | null;
  readonly connectedAt: number | null;
  readonly participants: readonly MediaParticipant[];
  readonly micEnabled: boolean;
  readonly deafened: boolean;
  readonly cameraEnabled: boolean;
  readonly screenShareEnabled: boolean;
  readonly noiseSuppression: boolean;
  readonly handRaised: boolean;
  readonly screenZoom: 1 | 1.5 | 2;
  readonly pttEnabled: boolean;
  readonly pttCode: string;
  joinChannel: (channelId: string, channelName: string, displayName: string) => Promise<void>;
  leave: () => Promise<void>;
  setMicEnabled: (enabled: boolean) => void;
  setDeafened: (enabled: boolean) => void;
  setCameraEnabled: (enabled: boolean) => void;
  setScreenShareEnabled: (enabled: boolean) => void;
  setNoiseSuppression: (enabled: boolean) => void;
  setHandRaised: (raised: boolean) => void;
  setScreenZoom: (zoom: 1 | 1.5 | 2) => void;
  lowerHand: (participantId: string) => void;
  setPttEnabled: (enabled: boolean) => void;
  setPttCode: (code: string) => void;
}

let transport: MediaTransportPort | null = null;

const idle = {
  connectedChannelId: null,
  connectedChannelName: null,
  connectedAt: null,
  participants: [],
  micEnabled: true,
  deafened: false,
  cameraEnabled: false,
  screenShareEnabled: false,
  noiseSuppression: true,
  handRaised: false,
  screenZoom: 1 as const,
  pttEnabled: false,
  pttCode: "Space",
};

export const useVoiceSessionStore = create<VoiceSessionState>((set, get) => ({
  ...idle,
  joinChannel: async (channelId, channelName, displayName) => {
    await transport?.disconnect();
    const opened = await openMediaTransport({ channelId, channelName, displayName });
    transport = opened.transport;
    transport.subscribe((snapshot) => set({ participants: snapshot.participants }));
    transport.setNoiseSuppression(get().noiseSuppression);
    set({
      connectedChannelId: channelId,
      connectedChannelName: channelName,
      connectedAt: Date.now(),
      participants: opened.snapshot.participants,
      handRaised: false,
      screenShareEnabled: false,
    });
  },
  leave: async () => {
    await transport?.disconnect();
    transport = null;
    set({ ...idle, pttEnabled: get().pttEnabled, pttCode: get().pttCode });
  },
  setMicEnabled: (enabled) => {
    transport?.setMicEnabled(enabled);
    set({ micEnabled: enabled });
  },
  setDeafened: (enabled) => {
    transport?.setDeafened(enabled);
    set({ deafened: enabled, micEnabled: enabled ? false : get().micEnabled });
  },
  setCameraEnabled: (enabled) => {
    transport?.setCameraEnabled(enabled);
    set({ cameraEnabled: enabled });
  },
  setScreenShareEnabled: (enabled) => {
    transport?.setScreenShareEnabled(enabled);
    set({ screenShareEnabled: enabled });
  },
  setNoiseSuppression: (enabled) => {
    transport?.setNoiseSuppression(enabled);
    set({ noiseSuppression: enabled });
  },
  setHandRaised: (raised) => {
    transport?.setHandRaised(raised);
    set({ handRaised: raised });
  },
  setScreenZoom: (screenZoom) => set({ screenZoom }),
  lowerHand: (participantId) => {
    transport?.setHandRaised(false);
    set({
      handRaised: participantId === "self" ? false : get().handRaised,
      participants: get().participants.map((item) =>
        item.id === participantId ? { ...item, handRaised: false } : item,
      ),
    });
  },
  setPttEnabled: (pttEnabled) => set({ pttEnabled }),
  setPttCode: (pttCode) => set({ pttCode }),
}));
