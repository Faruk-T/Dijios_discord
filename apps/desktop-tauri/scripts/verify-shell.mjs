import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const required = [
  ["src-tauri/src/main.rs", "tray::install"],
  ["src-tauri/src/tray.rs", "TrayIconBuilder"],
  ["src-tauri/src/ptt_shortcut.rs", "desktop:ptt"],
  ["src-tauri/tauri.conf.json", "com.dijios.connect"],
];

export function assertDesktopShell(rootUrl) {
  for (const [file, marker] of required) {
    const text = readFileSync(new URL(file, rootUrl), "utf8");
    if (!text.includes(marker)) {
      throw new Error(`${file} is missing ${marker}`);
    }
  }
}

function reportToolchain() {
  const cargo = spawnSync("cargo", ["--version"], { encoding: "utf8" });
  if (cargo.status !== 0) {
    console.log("cargo is not installed; the Tauri shell source is present and was not compiled.");
  }
}

const entry = process.argv[1] ?? "";
if (entry.endsWith("verify-shell.mjs")) {
  assertDesktopShell(new URL("../", import.meta.url));
  reportToolchain();
}
