import type { JSX } from "react";
import { FileManGLExplorerAdapter } from "truncgil-uxigl";

export function FileManLive(): JSX.Element {
  return (
    <FileManGLExplorerAdapter
      locale="tr"
      driverType="vfs_memory"
      enableDetailsInspector
      showQuickToolbar
      height="100%"
    />
  );
}
