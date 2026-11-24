import type { JSX } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Button } from "truncgil-uxigl";
import { windowRegistry } from "./window-registry.js";
import { useWindowManager, type ManagedWindow } from "./window-manager.store.js";

function WindowChrome({ item }: { readonly item: ManagedWindow }): JSX.Element {
  const focus = useWindowManager((state) => state.focus);
  const close = useWindowManager((state) => state.close);
  const toggleMinimize = useWindowManager((state) => state.toggleMinimize);
  const toggleMaximize = useWindowManager((state) => state.toggleMaximize);
  const move = useWindowManager((state) => state.move);

  const onDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const originX = event.clientX - item.rect.x;
    const originY = event.clientY - item.rect.y;
    const drag = (moveEvent: PointerEvent): void => {
      move(item.instanceId, moveEvent.clientX - originX, moveEvent.clientY - originY);
    };
    const stop = (): void => {
      handle.removeEventListener("pointermove", drag);
      handle.removeEventListener("pointerup", stop);
    };
    handle.addEventListener("pointermove", drag);
    handle.addEventListener("pointerup", stop);
    focus(item.instanceId);
  };

  return (
    <header className="osgl-liquid" style={{ height: 44, display: "flex" }} onPointerDown={onDrag}>
      <Button
        id={`close-${item.instanceId}`}
        type="button"
        variant="danger"
        size="xs"
        aria-label="Kapat"
        onClick={() => close(item.instanceId)}
      >
        Kapat
      </Button>
      <Button
        id={`min-${item.instanceId}`}
        type="button"
        variant="ghost"
        size="xs"
        aria-label="Küçült"
        onClick={() => toggleMinimize(item.instanceId)}
      >
        Küçült
      </Button>
      <Button
        id={`max-${item.instanceId}`}
        type="button"
        variant="ghost"
        size="xs"
        aria-label="Büyüt"
        onClick={() => toggleMaximize(item.instanceId)}
      >
        Büyüt
      </Button>
      <strong>{item.title}</strong>
    </header>
  );
}

export function FloatingWindowFrame({
  item,
}: {
  readonly item: ManagedWindow;
}): JSX.Element | null {
  const descriptor = windowRegistry.get(item.appId);
  const resize = useWindowManager((state) => state.resize);
  if (item.minimized || descriptor === null) {
    return null;
  }
  const onResize = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const originX = event.clientX;
    const originY = event.clientY;
    const start = item.rect;
    const drag = (moveEvent: PointerEvent): void => {
      resize(
        item.instanceId,
        Math.max(descriptor.minSize.width, start.width + moveEvent.clientX - originX),
        Math.max(descriptor.minSize.height, start.height + moveEvent.clientY - originY),
      );
    };
    const stop = (): void => {
      handle.removeEventListener("pointermove", drag);
      handle.removeEventListener("pointerup", stop);
    };
    handle.addEventListener("pointermove", drag);
    handle.addEventListener("pointerup", stop);
  };
  return (
    <section
      className="osgl-content-surface"
      style={{
        position: "absolute",
        transform: `translate3d(${item.rect.x}px, ${item.rect.y}px, 0)`,
        width: item.rect.width,
        height: item.rect.height,
        zIndex: item.zIndex,
      }}
    >
      <WindowChrome item={item} />
      <div style={{ height: "calc(100% - 44px)", overflow: "auto" }}>{descriptor.render()}</div>
      <button
        type="button"
        aria-label="Boyutlandır"
        onPointerDown={onResize}
        style={{ position: "absolute", right: 0, bottom: 0, width: 44, height: 44 }}
      />
    </section>
  );
}
