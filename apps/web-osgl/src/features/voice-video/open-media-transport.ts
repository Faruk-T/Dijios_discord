import { LiveKitTransportAdapter } from "./livekit-transport.adapter.js";
import type {
  MediaConnectInput,
  MediaRoomSnapshot,
  MediaTransportPort,
} from "./media-transport.port.js";
import { SimulatedMediaAdapter } from "./simulated-media.adapter.js";

export interface ConnectedMedia {
  readonly transport: MediaTransportPort;
  readonly snapshot: MediaRoomSnapshot;
}

export async function openMediaTransport(input: MediaConnectInput): Promise<ConnectedMedia> {
  if (import.meta.env.MODE === "test" || import.meta.env.VITE_MEDIA_CLIENT === "simulated") {
    return openSimulated(input);
  }
  const live = new LiveKitTransportAdapter();
  try {
    const snapshot = await Promise.race([live.connect(input), rejectAfter(250)]);
    return { transport: live, snapshot };
  } catch {
    await live.disconnect();
    return openSimulated(input);
  }
}

function openSimulated(input: MediaConnectInput): Promise<ConnectedMedia> {
  const transport = new SimulatedMediaAdapter();
  return transport.connect(input).then((snapshot) => ({ transport, snapshot }));
}

function rejectAfter(ms: number): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error("LiveKit was not reachable.")), ms);
  });
}
