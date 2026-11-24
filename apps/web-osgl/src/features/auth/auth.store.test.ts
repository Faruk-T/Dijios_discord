import { beforeEach, describe, expect, it } from "vitest";
import { SimulatedAuthClient } from "./simulated-auth.client.js";
import { useAuthStore } from "./auth.store.js";

describe("auth store", () => {
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

  it("signs in a founder persona and keeps the institution color", async () => {
    await useAuthStore.getState().loadPersonas();
    await useAuthStore.getState().login("founder.fen");
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(useAuthStore.getState().session?.fullName).toBe("Ayşe Kurucu");
    expect(useAuthStore.getState().session?.primaryColor).toBe("#002147");
    expect(useAuthStore.getState().personas).toHaveLength(6);
  });
});
