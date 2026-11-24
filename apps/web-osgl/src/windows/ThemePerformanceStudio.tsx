import type { JSX } from "react";
import { Card, SegmentedControl, Switch } from "truncgil-uxigl";
import { useShellPreferences, type ShellTheme } from "../osgl-shell/shell-preferences.store.js";

export function ThemePerformanceStudio(): JSX.Element {
  const theme = useShellPreferences((state) => state.theme);
  const setTheme = useShellPreferences((state) => state.setTheme);
  const smartboard = useShellPreferences((state) => state.smartboardPerformanceMode);
  const setSmartboard = useShellPreferences((state) => state.setSmartboardPerformanceMode);
  return (
    <div className="osgl-theme-panel">
      <Card padding="md">
        <SegmentedControl<ShellTheme>
          label="Tema"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "dark", label: "Koyu" },
            { value: "light", label: "Açık" },
          ]}
        />
      </Card>
      <Card padding="md">
        <strong>Kurum rengi</strong>
        <div className="osgl-color-preview" aria-label="Oxford Navy kurum rengi" />
      </Card>
      <Card padding="md">
        <Switch
          label="Akıllı Tahta 60fps Performans Modu"
          value={smartboard}
          onChange={setSmartboard}
        />
      </Card>
    </div>
  );
}
