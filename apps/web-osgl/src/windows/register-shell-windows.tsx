import type { JSX } from "react";
import { CommunicationHubWindow } from "../features/servers-channels/CommunicationHubWindow.js";
import { MediaStudioWindow } from "../features/settings-studio/MediaStudioWindow.js";
import { VoiceStageWindow } from "../features/voice-video/VoiceStageWindow.js";
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
    defaultSize: { width: 1040, height: 640 },
    minSize: { width: 360, height: 240 },
    fullBleed: true,
    render: CommunicationHubWindow,
  },
  {
    appId: "voice-stage",
    title: "Görüntülü Zümre Sahnesi",
    category: "Ses",
    icon: "videocam",
    defaultSize: { width: 800, height: 520 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: VoiceStageWindow,
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
  {
    appId: "media-studio",
    title: "Ses & Görüntü Stüdyosu",
    category: "Ses",
    icon: "tune",
    defaultSize: { width: 520, height: 420 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: MediaStudioWindow,
  },
];

export function registerShellWindows(): void {
  for (const descriptor of SHELL_WINDOWS) {
    windowRegistry.register(descriptor);
  }
}
