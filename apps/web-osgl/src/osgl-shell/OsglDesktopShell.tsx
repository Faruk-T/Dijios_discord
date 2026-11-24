import type { JSX } from "react";
import { useEffect } from "react";
import { useTheme } from "truncgil-uxigl";
import { ConnectCommandPalette } from "../windows/ConnectCommandPalette.js";
import { ConnectDock } from "../windows/ConnectDock.js";
import { FloatingWindowFrame } from "../windows/FloatingWindowFrame.js";
import { registerShellWindows } from "../windows/register-shell-windows.js";
import { useWindowManager } from "../windows/window-manager.store.js";
import { AuroraWallpaperCanvas } from "./AuroraWallpaperCanvas.js";
import { ConnectTopMenuBar } from "./ConnectTopMenuBar.js";
import { useShellPreferences } from "./shell-preferences.store.js";

let shellWindowsReady = false;

export function OsglDesktopShell(): JSX.Element {
  const windows = useWindowManager((state) => state.windows);
  const theme = useShellPreferences((state) => state.theme);
  const reduced = useShellPreferences((state) => state.reducedMotion);
  const smartboard = useShellPreferences((state) => state.smartboardPerformanceMode);
  const setMode = useTheme().setMode;
  const setWebgl = useTheme().setWebglEnabled;
  useEffect(() => {
    if (!shellWindowsReady) {
      registerShellWindows();
      shellWindowsReady = true;
    }
  }, []);
  useEffect(() => {
    setMode(theme);
    const motion = reduced || smartboard;
    document.documentElement.dataset["reducedMotion"] = motion ? "true" : "false";
    document.documentElement.dataset["webgl"] = motion ? "false" : "true";
    setWebgl(!motion);
  }, [reduced, setMode, setWebgl, smartboard, theme]);

  return (
    <div
      className="osgl-desktop"
      style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}
    >
      <AuroraWallpaperCanvas />
      <ConnectTopMenuBar />
      {windows.map((item) => (
        <FloatingWindowFrame key={item.instanceId} item={item} />
      ))}
      <ConnectDock />
      <ConnectCommandPalette />
    </div>
  );
}
