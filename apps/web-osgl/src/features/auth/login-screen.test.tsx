import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProviders } from "../../app/AppProviders.js";
import { SimulatedAuthClient } from "./simulated-auth.client.js";
import { LoginScreen } from "./LoginScreen.js";
import { useAuthStore } from "./auth.store.js";

describe("login screen", () => {
  beforeEach(() => {
    useAuthStore.setState({
      client: new SimulatedAuthClient(),
      status: "anonymous",
      session: null,
      personas: [],
      error: null,
      institutionAlias: "fen-koleji",
    });
  });

  it("signs in from the developer persona bar", async () => {
    render(
      <AppProviders>
        <LoginScreen />
      </AppProviders>,
    );
    expect(await screen.findByRole("button", { name: /Ayşe Kurucu/ })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: /Ayşe Kurucu/ }));
    expect(useAuthStore.getState().session?.title).toBe("Kurucu");
  });
});
