import type { JSX } from "react";
import { SheetGLGridAdapter } from "truncgil-uxigl";

export function SheetGlLive(): JSX.Element {
  return (
    <SheetGLGridAdapter
      presetStyle="apple"
      locale="tr"
      showFormulaBar
      showControlBar
      height="100%"
    />
  );
}
