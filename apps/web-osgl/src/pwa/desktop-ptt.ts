export function desktopPttPressed(payload: unknown): boolean | null {
  if (payload === "down") {
    return true;
  }
  if (payload === "up") {
    return false;
  }
  return null;
}

interface TauriListen {
  (name: string, handler: (event: { readonly payload: unknown }) => void): Promise<unknown>;
}

function readListen(host: Window): TauriListen | null {
  const root: unknown = Reflect.get(host, "__TAURI__");
  if (typeof root !== "object" || root === null) {
    return null;
  }
  const eventApi: unknown = Reflect.get(root, "event");
  if (typeof eventApi !== "object" || eventApi === null) {
    return null;
  }
  const listen: unknown = Reflect.get(eventApi, "listen");
  if (typeof listen !== "function") {
    return null;
  }
  return (name, handler) => {
    const result: unknown = listen.call(eventApi, name, handler);
    return result instanceof Promise ? result : Promise.resolve(result);
  };
}

export function installDesktopPttBridge(host: Window = window): void {
  const listen = readListen(host);
  if (listen === null) {
    return;
  }
  void listen("desktop:ptt", (event) => {
    const pressed = desktopPttPressed(event.payload);
    if (pressed === null) {
      return;
    }
    host.dispatchEvent(new CustomEvent("dijios-desktop-ptt", { detail: pressed }));
  });
}
