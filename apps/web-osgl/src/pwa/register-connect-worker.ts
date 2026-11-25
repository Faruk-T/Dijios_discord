export function registerConnectWorker(): void {
  if (import.meta.env.MODE === "test" || !import.meta.env.PROD) {
    return;
  }
  if (!("serviceWorker" in navigator)) {
    return;
  }
  void navigator.serviceWorker.register("/connect-sw.js");
}
