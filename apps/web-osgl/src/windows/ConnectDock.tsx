import type { JSX } from "react";
import { GoogleIcon } from "truncgil-uxigl";
import { useWindowManager } from "./window-manager.store.js";
import { windowRegistry } from "./window-registry.js";

export function ConnectDock(): JSX.Element {
  const windows = useWindowManager((state) => state.windows);
  const openApp = useWindowManager((state) => state.openApp);
  const arrange = useWindowManager((state) => state.arrange);
  return (
    <nav className="osgl-dock" aria-label="Dock">
      {windowRegistry.list().map((app) => {
        const open = windows.some((item) => item.appId === app.appId && !item.minimized);
        return (
          <button
            id={`dock-${app.appId}`}
            key={app.appId}
            className="osgl-dock-app"
            type="button"
            title={app.title}
            aria-label={app.title}
            onClick={() => openApp(app.appId)}
          >
            <GoogleIcon name={app.icon} />
            {open ? <i className="osgl-dock-dot" /> : null}
          </button>
        );
      })}
      <i className="osgl-dock-rule" />
      <button
        id="dock-side"
        className="osgl-dock-tool"
        type="button"
        title="Yan Yana Diz"
        aria-label="Yan Yana Diz"
        onClick={() => arrange("side-by-side")}
      >
        <GoogleIcon name="view_column" />
      </button>
      <button
        id="dock-grid"
        className="osgl-dock-tool"
        type="button"
        title="Izgara Diz"
        aria-label="Izgara Diz"
        onClick={() => arrange("grid")}
      >
        <GoogleIcon name="grid_view" />
      </button>
    </nav>
  );
}
