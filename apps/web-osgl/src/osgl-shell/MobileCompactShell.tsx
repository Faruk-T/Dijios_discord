import { useState } from "react";
import type { JSX } from "react";
import { Button } from "truncgil-uxigl";
import { ShellWindowBody } from "../windows/FloatingWindowFrame.js";
import { windowRegistry } from "../windows/window-registry.js";
import { useWindowManager } from "../windows/window-manager.store.js";

export function MobileCompactShell(): JSX.Element {
  const [appId, setAppId] = useState("communication-hub");
  const openApp = useWindowManager((state) => state.openApp);
  const descriptor = windowRegistry.get(appId);
  return (
    <main className="osgl-mobile">
      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {windowRegistry.list().map((app) => (
          <Button
            id={`mobile-${app.appId}`}
            key={app.appId}
            type="button"
            variant={app.appId === appId ? "filled" : "tonal"}
            className="osgl-hit"
            onClick={() => {
              setAppId(app.appId);
              openApp(app.appId);
            }}
          >
            {app.title}
          </Button>
        ))}
      </div>
      <section className="osgl-content-surface">
        {descriptor === null ? null : (
          <ShellWindowBody key={descriptor.appId} render={descriptor.render} />
        )}
      </section>
    </main>
  );
}
