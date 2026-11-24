export function useActiveVoiceRoom(now = Date.now()): { readonly elapsed: string } {
  const startedAt = now - 4 * 60 * 1000 - 12 * 1000;
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  return { elapsed: `${minutes}:${seconds}` };
}
