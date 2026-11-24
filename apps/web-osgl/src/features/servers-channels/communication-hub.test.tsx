import { cleanup, render, screen } from "@testing-library/react";
import { ToastProvider } from "truncgil-uxigl";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ClientSession } from "../auth/auth-client.port.js";
import { useAuthStore } from "../auth/auth.store.js";
import { SimulatedWorkspaceClient } from "./simulated-workspace.client.js";
import { CommunicationHubWindow } from "./CommunicationHubWindow.js";
import { useWorkspaceStore } from "./workspace.store.js";

function session(
  role: ClientSession["systemRole"],
  branchName: string,
  fullName: string,
): ClientSession {
  return {
    accessToken: "test",
    userId: "018f0000-0000-7000-8000-000000000007",
    fullName,
    systemRole: role,
    branchName,
    title: fullName,
    institutionId: "018f0000-0000-7000-8000-000000000001",
    institutionAlias: "fen-koleji",
    institutionName: "Örnek Fen ve Teknoloji Koleji",
    primaryColor: "#002147",
  };
}

describe("communication hub", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useWorkspaceStore.setState({
      client: new SimulatedWorkspaceClient(),
      tree: null,
      roster: [],
      profileUserId: null,
      rosterOpen: true,
    });
  });

  it("hides the PDR room from teachers and shows voice occupants", async () => {
    useAuthStore.setState({
      status: "authenticated",
      session: session("TEACHER", "Fizik", "Can Fizik"),
    });
    render(
      <ToastProvider>
        <CommunicationHubWindow />
      </ToastProvider>,
    );
    expect((await screen.findAllByText("Zeynep Başaran")).length).toBeGreaterThan(0);
    expect(screen.queryByText(/pdr-vaka-odasi/)).toBeNull();
  });

  it("shows the confidential room to counselors and opens a profile card", async () => {
    useAuthStore.setState({
      status: "authenticated",
      session: session("COUNSELOR", "PDR", "Elif Rehber"),
    });
    render(
      <ToastProvider>
        <CommunicationHubWindow />
      </ToastProvider>,
    );
    expect((await screen.findAllByText(/pdr-vaka-odasi/)).length).toBeGreaterThan(0);
    const profile = screen.getAllByRole("button", { name: /Zeynep Başaran/ })[0];
    if (profile === undefined) {
      throw new Error("Missing teacher row.");
    }
    await userEvent.click(profile);
    expect(screen.getAllByRole("dialog", { name: "Zeynep Başaran" }).length).toBeGreaterThan(0);
  });
});
