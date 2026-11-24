import type { JSX } from "react";
import { GoogleIcon } from "truncgil-uxigl";
import { useWindowManager } from "../windows/window-manager.store.js";
import { windowRegistry } from "../windows/window-registry.js";

export function DesktopShortcutGrid(): JSX.Element {
  const openApp = useWindowManager((state) => state.openApp);
  return (
    <div className="osgl-shortcuts" aria-label="Masaüstü kısayolları">
      {windowRegistry.list().map((app) => (
        <button
          key={app.appId}
          className="osgl-shortcut"
          type="button"
          onClick={() => openApp(app.appId)}
          onDoubleClick={() => openApp(app.appId)}
        >
          <span className="osgl-shortcut-icon">
            <GoogleIcon name={app.icon} />
          </span>
          <span>{app.title}</span>
        </button>
      ))}
    </div>
  );
}
