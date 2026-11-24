import type { JSX } from "react";
import { Button } from "truncgil-uxigl";
import { useWindowManager } from "./window-manager.store.js";
import { windowRegistry } from "./window-registry.js";

export function ConnectDock(): JSX.Element {
  const windows = useWindowManager((state) => state.windows);
  const openApp = useWindowManager((state) => state.openApp);
  const arrange = useWindowManager((state) => state.arrange);
  return (
    <nav
      className="osgl-liquid"
      aria-label="Dock"
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        padding: 8,
      }}
    >
      {windowRegistry.list().map((app) => {
        const open = windows.some((item) => item.appId === app.appId && !item.minimized);
        return (
          <Button
            id={`dock-${app.appId}`}
            key={app.appId}
            type="button"
            variant="glass"
            className="osgl-hit"
            onClick={() => openApp(app.appId)}
          >
            {app.title}
            {open ? <span aria-hidden="true">•</span> : null}
          </Button>
        );
      })}
      <Button id="dock-side" type="button" variant="tonal" onClick={() => arrange("side-by-side")}>
        Yan yana
      </Button>
      <Button id="dock-grid" type="button" variant="tonal" onClick={() => arrange("grid")}>
        Izgara
      </Button>
    </nav>
  );
}
