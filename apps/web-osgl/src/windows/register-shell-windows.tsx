import { DepartmentFileManWindow } from "../features/academic-tools/DepartmentFileManWindow.js";
import { MeetingMinutesWindow } from "../features/academic-tools/MeetingMinutesWindow.js";
import { SheetGlAnalysisWindow } from "../features/academic-tools/SheetGlAnalysisWindow.js";
import { CommunicationHubWindow } from "../features/servers-channels/CommunicationHubWindow.js";
import { MediaStudioWindow } from "../features/settings-studio/MediaStudioWindow.js";
import { VoiceStageWindow } from "../features/voice-video/VoiceStageWindow.js";
import { ThemePerformanceStudio } from "./ThemePerformanceStudio.js";
import { windowRegistry, type WindowAppDescriptor } from "./window-registry.js";

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
    appId: "meeting-minutes",
    title: "Zümre Tutanağı",
    category: "Akademik",
    icon: "description",
    defaultSize: { width: 760, height: 540 },
    minSize: { width: 360, height: 240 },
    fullBleed: false,
    render: MeetingMinutesWindow,
  },
  {
    appId: "department-files",
    title: "Zümre Arşivi",
    category: "Dosya",
    icon: "folder",
    defaultSize: { width: 880, height: 560 },
    minSize: { width: 360, height: 240 },
    fullBleed: true,
    render: DepartmentFileManWindow,
  },
  {
    appId: "sheetgl-analysis",
    title: "SheetGL Sınav & Not Analizi",
    category: "Akademik",
    icon: "table_chart",
    defaultSize: { width: 920, height: 580 },
    minSize: { width: 360, height: 240 },
    fullBleed: true,
    render: SheetGlAnalysisWindow,
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
