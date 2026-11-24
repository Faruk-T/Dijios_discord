import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppProviders } from "../app/AppProviders.js";
import { registerShellWindows } from "./register-shell-windows.js";
import { ConnectCommandPalette } from "./ConnectCommandPalette.js";

describe("command palette", () => {
  it("opens with Ctrl+K", async () => {
    registerShellWindows();
    render(
      <AppProviders>
        <ConnectCommandPalette />
      </AppProviders>,
    );
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    expect(await screen.findByPlaceholderText("Komut ara")).toBeTruthy();
  });
});
