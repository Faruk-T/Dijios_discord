import { useEffect, useState } from "react";
import { Avatar, GoogleIcon, Switch } from "truncgil-uxigl";
import { useAuthStore } from "../features/auth/auth.store.js";
import { useWindowManager } from "../windows/window-manager.store.js";
import { ActiveVoiceMenuPill } from "./ActiveVoiceMenuPill.js";
import { LessonBellBadge } from "./LessonBellBadge.js";
import { useShellPreferences, watchReducedMotion } from "./shell-preferences.store.js";

function MenuButton({
  id,
  label,
  onClick,
}: {
  readonly id: string;
  readonly label: string;
  readonly onClick?: () => void;
}): React.JSX.Element {
  return (
    <button id={id} className="osgl-menu-button" type="button" onClick={onClick}>
      {label}
    </button>
  );
}

export function ConnectTopMenuBar(): React.JSX.Element {
  const institution = useAuthStore((state) => state.session?.institutionName ?? "Kurum");
  const fullName = useAuthStore((state) => state.session?.fullName ?? "Öğretmen");
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
    <header className="osgl-menubar">
      <div className="osgl-menu-left">
        <span className="osgl-brand">
          <span className="osgl-logo">d</span>
          <strong>dijiOS Connect</strong>
        </span>
        <span className="osgl-school-pill">{institution}</span>
        <i className="osgl-rule" />
        <MenuButton id="menu-rooms" label="Odalar" />
        <MenuButton id="menu-departments" label="Zümreler" />
        <MenuButton id="arrange-side" label="Yan Yana" onClick={() => arrange("side-by-side")} />
        <MenuButton id="arrange-grid" label="Izgara" onClick={() => arrange("grid")} />
        <MenuButton id="arrange-cascade" label="Kademeli" onClick={() => arrange("cascade")} />
        <MenuButton
          id="menu-view"
          label="Görünüm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      </div>
      <div className="osgl-menu-right">
        <ActiveVoiceMenuPill />
        <LessonBellBadge />
        <button
          id="spotlight"
          className="osgl-spotlight"
          type="button"
          onClick={() => window.dispatchEvent(new Event("dijios-spotlight"))}
        >
          <GoogleIcon name="search" size="sm" />
          Ara...
          <kbd>⌘K</kbd>
        </button>
        <Switch
          id="smartboard"
          label="Tahta"
          size="sm"
          value={smartboard}
          onChange={setSmartboard}
        />
        <time className="osgl-clock">{clock}</time>
        <button id="logout" className="osgl-logout" type="button" onClick={() => void logout()}>
          <Avatar shape="squircle" size="xs" name={fullName} />
          Çıkış
        </button>
      </div>
    </header>
  );
}
