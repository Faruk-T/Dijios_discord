import { create } from "zustand";
import { useAuthStore } from "../auth/auth.store.js";

export const CAMPUS_ALERT =
  "Saat 15:30'da Genel Kurul Sahnesinde zümre değerlendirmesi yapılacaktır";

interface CampusAlertState {
  readonly message: string | null;
  show: () => void;
  dismiss: () => void;
}

export const useCampusAlertStore = create<CampusAlertState>((set) => ({
  message: null,
  show: () => set({ message: CAMPUS_ALERT }),
  dismiss: () => set({ message: null }),
}));

export async function publishOfficialAlert(): Promise<void> {
  if (import.meta.env.VITE_AUTH_CLIENT !== "simulated" && import.meta.env.MODE !== "test") {
    const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    const token = useAuthStore.getState().session?.accessToken;
    const response = await fetch(`${base}/api/v1/workspaces/current/broadcast`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token === undefined ? {} : { authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ message: CAMPUS_ALERT }),
    });
    if (!response.ok) {
      return;
    }
  }
  useCampusAlertStore.getState().show();
}
