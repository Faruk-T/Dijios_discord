import type { JSX } from "react";
import { LoginScreen } from "../features/auth/LoginScreen.js";
import { useAuthStore } from "../features/auth/auth.store.js";
import { MobileCompactShell } from "../osgl-shell/MobileCompactShell.js";
import { OsglDesktopShell } from "../osgl-shell/OsglDesktopShell.js";
import { useViewportMode } from "../osgl-shell/useViewportMode.js";
import { registerShellWindows } from "../windows/register-shell-windows.js";

registerShellWindows();

export function ConnectApp(): JSX.Element {
  const status = useAuthStore((state) => state.status);
  const mode = useViewportMode();
  if (status !== "authenticated") {
    return <LoginScreen />;
  }
  return mode === "compact" ? <MobileCompactShell /> : <OsglDesktopShell />;
}
