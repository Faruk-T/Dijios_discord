export function formatElapsed(connectedAt: number | null, now: number): string {
  if (connectedAt === null) {
    return "00:00";
  }
  const total = Math.max(0, Math.floor((now - connectedAt) / 1000));
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function shouldShowPip(connected: boolean, stageClosedOrMinimized: boolean): boolean {
  return connected && stageClosedOrMinimized;
}

export function microphoneForKey(input: {
  readonly pttEnabled: boolean;
  readonly pttCode: string;
  readonly code: string;
  readonly pressed: boolean;
  readonly micEnabled: boolean;
}): boolean {
  if (!input.pttEnabled) {
    return input.micEnabled;
  }
  return input.pressed && input.code === input.pttCode;
}
