import { create } from "zustand";
import { applyInstitutionSeed } from "@dijios-connect/ui-osgl";
import type { MockPersonaSummary } from "@dijios-connect/contracts";
import type { AuthClientPort, ClientSession } from "./auth-client.port.js";
import { createAuthClient } from "./http-auth.client.js";

export interface AuthState {
  readonly client: AuthClientPort;
  readonly status: "anonymous" | "authenticating" | "authenticated";
  readonly session: ClientSession | null;
  readonly personas: readonly MockPersonaSummary[];
  readonly error: string | null;
  readonly institutionAlias: string;
  setClient: (client: AuthClientPort) => void;
  setInstitutionAlias: (alias: string) => void;
  loadPersonas: () => Promise<void>;
  login: (dijiosUserId: string) => Promise<void>;
  logout: () => Promise<void>;
}

function paintInstitution(session: ClientSession): void {
  if (typeof document === "undefined") {
    return;
  }
  applyInstitutionSeed(document.documentElement, session.primaryColor);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  client: createAuthClient(),
  status: "anonymous",
  session: null,
  personas: [],
  error: null,
  institutionAlias: "fen-koleji",
  setClient: (client) => set({ client }),
  setInstitutionAlias: (institutionAlias) => set({ institutionAlias }),
  loadPersonas: async () => {
    const personas = await get().client.listPersonas();
    set({ personas });
  },
  login: async (dijiosUserId) => {
    set({ status: "authenticating", error: null });
    try {
      const session = await get().client.login({
        institutionAlias: get().institutionAlias,
        dijiosUserId,
      });
      paintInstitution(session);
      set({ status: "authenticated", session });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Giriş tamamlanamadı.";
      set({ status: "anonymous", error: message });
    }
  },
  logout: async () => {
    await get().client.logout();
    set({ status: "anonymous", session: null });
  },
}));
