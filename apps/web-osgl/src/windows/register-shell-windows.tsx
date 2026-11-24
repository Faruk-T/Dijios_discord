import type { JSX } from "react";
import { windowRegistry, type WindowAppDescriptor } from "./window-registry.js";

function placeholder(title: string, detail: string): () => JSX.Element {
  return function PlaceholderWindow(): JSX.Element {
    return (
      <article>
        <h2>{title}</h2>
        <p>{detail}</p>
      </article>
    );
  };
}

const SHELL_WINDOWS: readonly WindowAppDescriptor[] = [
  {
    appId: "communication-hub",
    title: "İletişim Merkezi",
    category: "İletişim",
    icon: "forum",
    defaultSize: { width: 720, height: 480 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: placeholder("İletişim Merkezi", "Zümre kanalları Faz 3 ile açılır."),
  },
  {
    appId: "voice-stage",
    title: "Görüntülü Zümre Sahnesi",
    category: "Ses",
    icon: "videocam",
    defaultSize: { width: 800, height: 520 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: placeholder("Görüntülü Zümre Sahnesi", "Canlı sahne Faz 5 ile açılır."),
  },
  {
    appId: "department-files",
    title: "Zümre Arşivi",
    category: "Dosya",
    icon: "folder",
    defaultSize: { width: 680, height: 460 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: placeholder("Zümre Arşivi", "Dosya gezgini sonraki fazda açılır."),
  },
  {
    appId: "theme-performance-studio",
    title: "Tema & Akıllı Tahta Stüdyosu",
    category: "Görünüm",
    icon: "palette",
    defaultSize: { width: 640, height: 420 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: placeholder(
      "Tema & Akıllı Tahta Stüdyosu",
      "Performans tercihleri bu pencerede toplanır.",
    ),
  },
];

export function registerShellWindows(): void {
  for (const descriptor of SHELL_WINDOWS) {
    windowRegistry.register(descriptor);
  }
}
