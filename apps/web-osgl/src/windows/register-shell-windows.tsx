import type { JSX } from "react";
import { AcademicPreview } from "./AcademicPreview.js";
import { ThemePerformanceStudio } from "./ThemePerformanceStudio.js";
import { windowRegistry, type WindowAppDescriptor } from "./window-registry.js";

function preview(title: string, detail: string, tone: string): () => JSX.Element {
  return function PreviewWindow(): JSX.Element {
    return <AcademicPreview title={title} detail={detail} tone={tone} />;
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
    render: preview(
      "İletişim Merkezi",
      "Zümre kanalları ve öğretmenler odası tek çatıda.",
      "Zümre",
    ),
  },
  {
    appId: "voice-stage",
    title: "Görüntülü Zümre Sahnesi",
    category: "Ses",
    icon: "videocam",
    defaultSize: { width: 800, height: 520 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: preview("Görüntülü Zümre Sahnesi", "50+ kişilik ses ve HD video sahnesi hazır.", "HD"),
  },
  {
    appId: "department-files",
    title: "Zümre Arşivi",
    category: "Dosya",
    icon: "folder",
    defaultSize: { width: 680, height: 460 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: preview("Zümre Arşivi", "Branş dosyaları kurum izolasyonu ile saklanır.", "KVKK"),
  },
  {
    appId: "theme-performance-studio",
    title: "Tema & Akıllı Tahta Stüdyosu",
    category: "Görünüm",
    icon: "palette",
    defaultSize: { width: 640, height: 420 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: ThemePerformanceStudio,
  },
];

export function registerShellWindows(): void {
  for (const descriptor of SHELL_WINDOWS) {
    windowRegistry.register(descriptor);
  }
}
