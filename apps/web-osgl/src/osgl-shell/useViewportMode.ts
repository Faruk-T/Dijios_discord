import { useEffect, useState } from "react";

export type ViewportMode = "desktop" | "compact";

export function viewportModeFor(width: number): ViewportMode {
  return width < 768 ? "compact" : "desktop";
}

export function useViewportMode(): ViewportMode {
  const [mode, setMode] = useState<ViewportMode>(() =>
    viewportModeFor(typeof window === "undefined" ? 1280 : window.innerWidth),
  );
  useEffect(() => {
    const update = (): void => setMode(viewportModeFor(window.innerWidth));
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return mode;
}
