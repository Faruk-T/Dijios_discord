import { create } from "zustand";
import { windowRegistry } from "./window-registry.js";
import {
  clampRect,
  computeSnapRects,
  type ArrangeMode,
  type Rect,
  type Viewport,
} from "./window-layout.solver.js";

export interface ManagedWindow {
  readonly instanceId: string;
  readonly appId: string;
  readonly title: string;
  readonly rect: Rect;
  readonly zIndex: number;
  readonly minimized: boolean;
  readonly maximized: boolean;
}

interface WindowManagerState {
  readonly windows: readonly ManagedWindow[];
  readonly focusedId: string | null;
  openApp: (appId: string) => void;
  focus: (instanceId: string) => void;
  close: (instanceId: string) => void;
  toggleMinimize: (instanceId: string) => void;
  toggleMaximize: (instanceId: string) => void;
  move: (instanceId: string, x: number, y: number) => void;
  resize: (instanceId: string, width: number, height: number) => void;
  arrange: (mode: ArrangeMode) => void;
}

const VIEWPORT = (): Viewport => ({
  width: typeof window === "undefined" ? 1280 : window.innerWidth,
  height: typeof window === "undefined" ? 720 : Math.max(320, window.innerHeight - 120),
  top: 52,
  left: 16,
});

function raise(windows: readonly ManagedWindow[], instanceId: string): ManagedWindow[] {
  const nextZ = Math.max(0, ...windows.map((item) => item.zIndex)) + 1;
  return windows.map((item) =>
    item.instanceId === instanceId ? { ...item, zIndex: nextZ } : item,
  );
}

function openManaged(
  windows: readonly ManagedWindow[],
  appId: string,
): { readonly windows: ManagedWindow[]; readonly focusedId: string } | null {
  const existing = windows.find((item) => item.appId === appId);
  if (existing !== undefined) {
    return { windows: raise(windows, existing.instanceId), focusedId: existing.instanceId };
  }
  const descriptor = windowRegistry.get(appId);
  if (descriptor === null) {
    return null;
  }
  const viewport = VIEWPORT();
  const instanceId = `${appId}-1`;
  const opened: ManagedWindow = {
    instanceId,
    appId,
    title: descriptor.title,
    rect: clampRect(
      { x: viewport.left + 24, y: viewport.top + 24, ...descriptor.defaultSize },
      viewport,
    ),
    zIndex: windows.length + 1,
    minimized: false,
    maximized: false,
  };
  return { windows: [...windows, opened], focusedId: instanceId };
}

function withMaximize(windows: readonly ManagedWindow[], instanceId: string): ManagedWindow[] {
  const viewport = VIEWPORT();
  return windows.map((item) => {
    if (item.instanceId !== instanceId) {
      return item;
    }
    return item.maximized
      ? { ...item, maximized: false }
      : {
          ...item,
          maximized: true,
          rect: clampRect(
            { x: viewport.left, y: viewport.top, width: viewport.width, height: viewport.height },
            viewport,
          ),
        };
  });
}

function withArrange(windows: readonly ManagedWindow[], mode: ArrangeMode): ManagedWindow[] {
  const open = windows.filter((item) => !item.minimized);
  const rects = computeSnapRects(open.length, mode, VIEWPORT());
  return windows.map((item) => {
    const index = open.findIndex((candidate) => candidate.instanceId === item.instanceId);
    const rect = rects[index];
    return rect === undefined ? item : { ...item, rect, maximized: false };
  });
}

export const useWindowManager = create<WindowManagerState>((set, get) => ({
  windows: [],
  focusedId: null,
  openApp: (appId) => {
    const next = openManaged(get().windows, appId);
    if (next !== null) {
      set(next);
    }
  },
  focus: (instanceId) => set({ windows: raise(get().windows, instanceId), focusedId: instanceId }),
  close: (instanceId) =>
    set({
      windows: get().windows.filter((item) => item.instanceId !== instanceId),
      focusedId: get().focusedId === instanceId ? null : get().focusedId,
    }),
  toggleMinimize: (instanceId) =>
    set({
      windows: get().windows.map((item) =>
        item.instanceId === instanceId ? { ...item, minimized: !item.minimized } : item,
      ),
    }),
  toggleMaximize: (instanceId) => set({ windows: withMaximize(get().windows, instanceId) }),
  move: (instanceId, x, y) =>
    set({
      windows: get().windows.map((item) =>
        item.instanceId === instanceId
          ? { ...item, rect: clampRect({ ...item.rect, x, y }, VIEWPORT()) }
          : item,
      ),
    }),
  resize: (instanceId, width, height) =>
    set({
      windows: get().windows.map((item) =>
        item.instanceId === instanceId
          ? { ...item, rect: clampRect({ ...item.rect, width, height }, VIEWPORT()) }
          : item,
      ),
    }),
  arrange: (mode) => set({ windows: withArrange(get().windows, mode) }),
}));
