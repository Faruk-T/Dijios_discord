import type { JSX } from "react";
import { useAuthStore } from "../auth/auth.store.js";
import { useWindowManager } from "../../windows/window-manager.store.js";
import { publishOfficialAlert, useCampusAlertStore } from "./campus-alert.store.js";

export function CampusBroadcastBanner(): JSX.Element | null {
  const role = useAuthStore((state) => state.session?.systemRole);
  const message = useCampusAlertStore((state) => state.message);
  const dismiss = useCampusAlertStore((state) => state.dismiss);
  const open = useWindowManager((state) => state.openApp);
  const canPublish = role === "FOUNDER" || role === "PRINCIPAL";
  if (message === null && !canPublish) {
    return null;
  }
  if (message === null) {
    return (
      <div className="campus-alert-slot">
        <button type="button" onClick={() => void publishOfficialAlert()}>
          İdare Anonsu
        </button>
      </div>
    );
  }
  return (
    <div className="campus-alert" role="status">
      <span>📢 İdare Duyurusu: {message}</span>
      <button type="button" onClick={() => open("voice-stage")}>
        Sahneye Katıl
      </button>
      <button type="button" onClick={dismiss}>
        Kapat
      </button>
    </div>
  );
}
