import type { ReactNode } from "react";
import type { IThemeStorageAdapter } from "truncgil-uxigl";
import { ThemeProvider, ToastProvider } from "truncgil-uxigl";

const memoryThemeStorage: IThemeStorageAdapter = {
  loadPreferences: () => null,
  savePreferences: () => undefined,
  clearPreferences: () => undefined,
};

export function AppProviders({ children }: { readonly children: ReactNode }): React.JSX.Element {
  return (
    <ThemeProvider
      storageAdapter={memoryThemeStorage}
      initialPreferences={{
        mode: "dark",
        customPrimaryHex: "#002147",
        radiusScale: "squircle",
        fontFamilyPreset: "inter-jakarta",
      }}
    >
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
