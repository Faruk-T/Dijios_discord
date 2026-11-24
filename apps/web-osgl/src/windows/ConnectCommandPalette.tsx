import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { CommandPalette, useKeyboardShortcut, type CommandActionItem } from "truncgil-uxigl";
import { useShellPreferences } from "../osgl-shell/shell-preferences.store.js";
import { useWindowManager } from "./window-manager.store.js";
import { windowRegistry } from "./window-registry.js";

export function buildPaletteActions(input: {
  readonly openApp: (appId: string) => void;
  readonly arrange: (mode: "side-by-side" | "grid" | "cascade") => void;
  readonly toggleTheme: () => void;
  readonly toggleSmartboard: () => void;
}): readonly CommandActionItem[] {
  const windows = windowRegistry.list().map((app) => ({
    id: `open-${app.appId}`,
    title: app.title,
    category: "Pencereler",
    onSelect: () => input.openApp(app.appId),
  }));
  return [
    ...windows,
    {
      id: "arrange-side",
      title: "Pencereleri yan yana diz",
      category: "Düzen",
      onSelect: () => input.arrange("side-by-side"),
    },
    {
      id: "arrange-grid",
      title: "Pencereleri ızgaraya diz",
      category: "Düzen",
      onSelect: () => input.arrange("grid"),
    },
    {
      id: "theme",
      title: "Temayı değiştir",
      category: "Görünüm",
      shortcut: "⌘K",
      onSelect: input.toggleTheme,
    },
    {
      id: "smartboard",
      title: "Akıllı Tahta modunu aç veya kapat",
      category: "Görünüm",
      onSelect: input.toggleSmartboard,
    },
  ];
}

export function ConnectCommandPalette(): JSX.Element {
  const [open, setOpen] = useState(false);
  const openApp = useWindowManager((state) => state.openApp);
  const arrange = useWindowManager((state) => state.arrange);
  const theme = useShellPreferences((state) => state.theme);
  const setTheme = useShellPreferences((state) => state.setTheme);
  const smartboard = useShellPreferences((state) => state.smartboardPerformanceMode);
  const setSmartboard = useShellPreferences((state) => state.setSmartboardPerformanceMode);
  useKeyboardShortcut("k", () => setOpen(true), { metaOrCtrl: true });
  useEffect(() => {
    const openPalette = (): void => setOpen(true);
    window.addEventListener("dijios-spotlight", openPalette);
    return () => window.removeEventListener("dijios-spotlight", openPalette);
  }, []);
  const actions = useMemo(
    () =>
      buildPaletteActions({
        openApp,
        arrange,
        toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
        toggleSmartboard: () => setSmartboard(!smartboard),
      }),
    [arrange, openApp, setSmartboard, setTheme, smartboard, theme],
  );
  return (
    <CommandPalette
      open={open}
      onClose={() => setOpen(false)}
      actions={[...actions]}
      placeholder="Komut ara"
    />
  );
}
