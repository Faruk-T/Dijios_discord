import type { JSX } from "react";
import { useWindowManager } from "../../windows/window-manager.store.js";

export function SheetMessageEmbed({ title }: { readonly title: string }): JSX.Element {
  const open = useWindowManager((state) => state.openApp);
  return (
    <button className="sheet-embed" type="button" onClick={() => open("sheetgl-analysis")}>
      {title} — SheetGL&apos;de Aç
    </button>
  );
}
