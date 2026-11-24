import type { JSX, PointerEvent as ReactPointerEvent } from "react";
import { Badge, GoogleIcon } from "truncgil-uxigl";
import { windowRegistry } from "./window-registry.js";
import { useWindowManager, type ManagedWindow } from "./window-manager.store.js";

function WindowChrome({ item }: { readonly item: ManagedWindow }): JSX.Element {
  const descriptor = windowRegistry.get(item.appId);
  const focus = useWindowManager((state) => state.focus);
  const close = useWindowManager((state) => state.close);
  const toggleMinimize = useWindowManager((state) => state.toggleMinimize);
  const toggleMaximize = useWindowManager((state) => state.toggleMaximize);
  const move = useWindowManager((state) => state.move);

  const onDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const target = event.target;
    if (target instanceof Element && target.closest(".osgl-traffic") !== null) {
      return;
    }
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
    <header
      className="osgl-window-title"
      onPointerDown={onDrag}
      onDoubleClick={() => toggleMaximize(item.instanceId)}
    >
      <span className="osgl-traffic-row">
        <button
          id={`close-${item.instanceId}`}
          className="osgl-traffic osgl-traffic-close"
          type="button"
          aria-label="Kapat"
          onClick={() => close(item.instanceId)}
        />
        <button
          id={`min-${item.instanceId}`}
          className="osgl-traffic osgl-traffic-min"
          type="button"
          aria-label="Küçült"
          onClick={() => toggleMinimize(item.instanceId)}
        />
        <button
          id={`max-${item.instanceId}`}
          className="osgl-traffic osgl-traffic-max"
          type="button"
          aria-label="Büyüt"
          onClick={() => toggleMaximize(item.instanceId)}
        />
      </span>
      <span className="osgl-window-heading">
        <GoogleIcon name={descriptor?.icon ?? "widgets"} />
        <strong>{item.title}</strong>
      </span>
      <Badge size="sm" variant="tonal">
        {descriptor?.category ?? "Pencere"}
      </Badge>
    </header>
  );
}

export function FloatingWindowFrame({
  item,
}: {
  readonly item: ManagedWindow;
}): JSX.Element | null {
  const focusedId = useWindowManager((state) => state.focusedId);
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
      className={focusedId === item.instanceId ? "osgl-window is-focused" : "osgl-window"}
      style={{
        transform: `translate3d(${item.rect.x}px, ${item.rect.y}px, 0)`,
        width: item.rect.width,
        height: item.rect.height,
        zIndex: item.zIndex,
      }}
    >
      <WindowChrome item={item} />
      <div className={descriptor.fullBleed ? "osgl-window-body is-bleed" : "osgl-window-body"}>
        {descriptor.render()}
      </div>
      <button
        className="osgl-resize"
        type="button"
        aria-label="Boyutlandır"
        onPointerDown={onResize}
      />
    </section>
  );
}
