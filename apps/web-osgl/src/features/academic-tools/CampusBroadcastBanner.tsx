import type { JSX } from "react";
import { useWindowManager } from "../../windows/window-manager.store.js";
import { useCampusAlertStore } from "./campus-alert.store.js";

export function CampusBroadcastBanner(): JSX.Element | null {
  const message = useCampusAlertStore((state) => state.message);
  const dismiss = useCampusAlertStore((state) => state.dismiss);
  const open = useWindowManager((state) => state.openApp);
  if (message === null) {
    return null;
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
