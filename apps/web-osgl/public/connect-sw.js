/* global self, caches */
const SHELL = "dijios-connect-shell-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(["/", "/manifest.webmanifest"])));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== SHELL).map((key) => caches.delete(key))),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/app/")) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(async () => {
      const hit = await caches.match(event.request);
      return hit ?? (await caches.match("/"));
    }),
  );
});
