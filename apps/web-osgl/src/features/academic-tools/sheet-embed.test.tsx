import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { registerShellWindows } from "../../windows/register-shell-windows.js";
import { useWindowManager } from "../../windows/window-manager.store.js";
import { DepartmentFileManWindow } from "./DepartmentFileManWindow.js";
import { SheetGlAnalysisWindow } from "./SheetGlAnalysisWindow.js";
import { SheetMessageEmbed } from "./SheetMessageEmbed.js";

describe("sheet and file windows", () => {
  it("opens SheetGL from the shared analysis card", async () => {
    registerShellWindows();
    useWindowManager.setState({ windows: [], focusedId: null });
    const user = userEvent.setup();
    render(
      <>
        <DepartmentFileManWindow />
        <SheetGlAnalysisWindow />
        <SheetMessageEmbed title="📊 11. Sınıflar Matematik Deneme Analiz Matrisi" />
      </>,
    );
    expect(screen.getByText("Matematik Zümresi Arşivi")).toBeTruthy();
    expect(screen.getByText("Dosya gezgini hazırlanıyor")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /SheetGL'de Aç/ }));
    expect(
      useWindowManager.getState().windows.some((item) => item.appId === "sheetgl-analysis"),
    ).toBe(true);
  });
});
