import { create } from "zustand";

export type ShellTheme = "dark" | "light";

export interface ShellPreferences {
  readonly theme: ShellTheme;
  readonly reducedMotion: boolean;
  readonly smartboardPerformanceMode: boolean;
  setTheme: (theme: ShellTheme) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setSmartboardPerformanceMode: (enabled: boolean) => void;
}

function systemReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const useShellPreferences = create<ShellPreferences>((set) => ({
  theme: "dark",
  reducedMotion: systemReducedMotion(),
  smartboardPerformanceMode: false,
  setTheme: (theme) => set({ theme }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setSmartboardPerformanceMode: (smartboardPerformanceMode) => set({ smartboardPerformanceMode }),
}));

export function watchReducedMotion(onChange: (reduced: boolean) => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const listener = (): void => onChange(query.matches);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
