import { useAuthStore } from "../auth/auth.store.js";
import type { LocalDecision } from "./minutes-markdown.js";

export async function syncMinutes(input: {
  readonly channelId: string;
  readonly title: string;
  readonly markdownBody: string;
  readonly decisions: readonly LocalDecision[];
}): Promise<void> {
  if (input.channelId.length === 0) {
    return;
  }
  try {
    const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    const token = useAuthStore.getState().session?.accessToken;
    await fetch(`${base}/api/v1/channels/${input.channelId}/minutes`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token === undefined ? {} : { authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        title: input.title,
        markdownBody: input.markdownBody,
        decisions: input.decisions,
      }),
    });
  } catch {
    return;
  }
}
