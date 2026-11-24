import { useEffect, useState } from "react";
import { Button, Switch } from "truncgil-uxigl";
import { useAuthStore } from "../features/auth/auth.store.js";
import { useWindowManager } from "../windows/window-manager.store.js";
import { ActiveVoiceMenuPill } from "./ActiveVoiceMenuPill.js";
import { LessonBellBadge } from "./LessonBellBadge.js";
import { useShellPreferences, watchReducedMotion } from "./shell-preferences.store.js";

export function ConnectTopMenuBar(): React.JSX.Element {
  const institution = useAuthStore((state) => state.session?.institutionName ?? "Kurum");
  const logout = useAuthStore((state) => state.logout);
  const arrange = useWindowManager((state) => state.arrange);
  const theme = useShellPreferences((state) => state.theme);
  const setTheme = useShellPreferences((state) => state.setTheme);
  const smartboard = useShellPreferences((state) => state.smartboardPerformanceMode);
  const setSmartboard = useShellPreferences((state) => state.setSmartboardPerformanceMode);
  const setReduced = useShellPreferences((state) => state.setReducedMotion);
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  );

  useEffect(() => watchReducedMotion(setReduced), [setReduced]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header
      className="osgl-liquid"
      style={{ height: 44, display: "flex", alignItems: "center", gap: 8 }}
    >
      <strong>dijiOS Connect</strong>
      <span>{institution}</span>
      <Button id="menu-rooms" type="button" variant="ghost" size="sm">
        Odalar
      </Button>
      <Button id="menu-departments" type="button" variant="ghost" size="sm">
        Zümreler
      </Button>
      <Button
        id="arrange-side"
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => arrange("side-by-side")}
      >
        Yan Yana
      </Button>
      <Button
        id="arrange-grid"
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => arrange("grid")}
      >
        Izgara
      </Button>
      <Button
        id="arrange-cascade"
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => arrange("cascade")}
      >
        Kademeli
      </Button>
      <Button
        id="menu-view"
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        Görünüm
      </Button>
      <ActiveVoiceMenuPill />
      <LessonBellBadge />
      <Button
        id="spotlight"
        type="button"
        variant="tonal"
        size="sm"
        onClick={() => window.dispatchEvent(new Event("dijios-spotlight"))}
      >
        ⌘K
      </Button>
      <Switch id="smartboard" label="Akıllı Tahta" value={smartboard} onChange={setSmartboard} />
      <time>{clock}</time>
      <Button id="logout" type="button" variant="outlined" size="sm" onClick={() => void logout()}>
        Çıkış
      </Button>
    </header>
  );
}
