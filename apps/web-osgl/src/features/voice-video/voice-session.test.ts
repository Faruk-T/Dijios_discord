import { beforeEach, describe, expect, it } from "vitest";
import { microphoneForKey, shouldShowPip } from "./voice-session.logic.js";
import { useVoiceSessionStore } from "./voice-session.store.js";

describe("voice session", () => {
  beforeEach(async () => {
    await useVoiceSessionStore.getState().leave();
    useVoiceSessionStore.setState({ screenZoom: 1, pttEnabled: false, pttCode: "Space" });
  });

  it("joins a room, switches quickly, and tracks hands and zoom", async () => {
    await useVoiceSessionStore
      .getState()
      .joinChannel("math", "Matematik Zümresi", "Zeynep Başaran");
    expect(useVoiceSessionStore.getState().connectedChannelName).toBe("Matematik Zümresi");
    expect(useVoiceSessionStore.getState().participants.some((item) => item.speaking)).toBe(true);
    const started = Date.now();
    await useVoiceSessionStore.getState().joinChannel("physics", "Fizik Zümresi", "Can Fizik");
    expect(Date.now() - started).toBeLessThan(300);
    expect(useVoiceSessionStore.getState().connectedChannelId).toBe("physics");
    useVoiceSessionStore.getState().setHandRaised(true);
    useVoiceSessionStore.getState().setScreenShareEnabled(true);
    useVoiceSessionStore.getState().setScreenZoom(2);
    const self = useVoiceSessionStore.getState().participants.find((item) => item.id === "self");
    expect(self?.handRaised).toBe(true);
    expect(self?.screenSharing).toBe(true);
    expect(useVoiceSessionStore.getState().screenZoom).toBe(2);
  });

  it("shows the floating card only while the stage is hidden and quiets push-to-talk", () => {
    expect(shouldShowPip(true, true)).toBe(true);
    expect(shouldShowPip(true, false)).toBe(false);
    expect(shouldShowPip(false, true)).toBe(false);
    expect(
      microphoneForKey({
        pttEnabled: true,
        pttCode: "Space",
        code: "Space",
        pressed: false,
        micEnabled: true,
      }),
    ).toBe(false);
    expect(
      microphoneForKey({
        pttEnabled: true,
        pttCode: "Space",
        code: "Space",
        pressed: true,
        micEnabled: false,
      }),
    ).toBe(true);
  });
});
