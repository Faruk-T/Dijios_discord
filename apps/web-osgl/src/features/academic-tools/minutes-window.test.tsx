import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MeetingMinutesWindow } from "./MeetingMinutesWindow.js";

describe("meeting minutes window", () => {
  it("adds a decision and reveals the official markdown", async () => {
    const user = userEvent.setup();
    render(<MeetingMinutesWindow />);
    await user.click(screen.getByRole("button", { name: "Karar ekle" }));
    await user.click(screen.getByRole("button", { name: "📄 Resmi Tutanak İndir / Kopyala" }));
    const official = screen.getByLabelText("Resmi tutanak").textContent ?? "";
    expect(official).toContain("# Örnek Fen ve Teknoloji Koleji — Matematik Toplantı Tutanağı");
    expect(official).toContain("Sorumlu: Zeynep Başaran");
  });
});
