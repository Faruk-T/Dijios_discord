import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import type { ClientSession } from "../auth/auth-client.port.js";
import { useAuthStore } from "../auth/auth.store.js";
import { ChannelPollCard } from "./ChannelPollCard.js";
import { CampusBroadcastBanner } from "./CampusBroadcastBanner.js";
import { CampusBroadcastTrigger } from "./CampusBroadcastTrigger.js";
import { useCampusAlertStore } from "./campus-alert.store.js";
import { Student360QuickWindow } from "./Student360QuickWindow.js";

function session(role: ClientSession["systemRole"], fullName: string): ClientSession {
  return {
    accessToken: "test",
    userId: "018f0000-0000-7000-8000-000000000006",
    fullName,
    systemRole: role,
    branchName: role === "COUNSELOR" ? "PDR" : "Fizik",
    title: fullName,
    institutionId: "018f0000-0000-7000-8000-000000000001",
    institutionAlias: "fen-koleji",
    institutionName: "Örnek Fen ve Teknoloji Koleji",
    primaryColor: "#002147",
  };
}

describe("academic bridge surfaces", () => {
  afterEach(() => {
    cleanup();
    useAuthStore.setState({ session: null, status: "anonymous" });
    useCampusAlertStore.setState({ message: null });
  });

  it("hides the counseling note from teachers and shows it to counselors", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({ session: session("TEACHER", "Can Fizik"), status: "authenticated" });
    const teacher = render(<Student360QuickWindow />);
    await user.click(screen.getByRole("button", { name: "Ara" }));
    expect(screen.getByText("Kerem Yılmaz · 11/A Fen")).toBeTruthy();
    expect(screen.getByText("PDR notu bu rol için gizli.")).toBeTruthy();
    teacher.unmount();
    useAuthStore.setState({
      session: session("COUNSELOR", "Elif Rehber"),
      status: "authenticated",
    });
    render(<Student360QuickWindow />);
    await user.click(screen.getByRole("button", { name: "Ara" }));
    expect(screen.getByText("Sınav kaygısı için haftalık PDR görüşmesi sürüyor.")).toBeTruthy();
  });

  it("updates the quick poll percentages", async () => {
    const user = userEvent.setup();
    render(<ChannelPollCard title="Ortak Sınav Günü Seçimi" />);
    expect(screen.getByRole("button", { name: /Cuma %50/ })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Cuma/ }));
    expect(screen.getByRole("button", { name: /Cuma %56/ })).toBeTruthy();
  });

  it("shows a campus alert only after leadership publishes it", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({ session: session("TEACHER", "Can Fizik"), status: "authenticated" });
    const teacher = render(
      <>
        <CampusBroadcastTrigger />
        <CampusBroadcastBanner />
      </>,
    );
    expect(screen.queryByRole("button", { name: "📢 Anons" })).toBeNull();
    teacher.unmount();
    useAuthStore.setState({ session: session("FOUNDER", "Ayşe Kurucu"), status: "authenticated" });
    render(
      <>
        <CampusBroadcastTrigger />
        <CampusBroadcastBanner />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "📢 Anons" }));
    expect(screen.getByRole("status").textContent ?? "").toContain(
      "Saat 15:30'da Genel Kurul Sahnesinde zümre değerlendirmesi yapılacaktır",
    );
    await user.click(screen.getByRole("button", { name: "Kapat" }));
    expect(screen.queryByRole("status")).toBeNull();
  });
});
