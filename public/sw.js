// Minimal service worker — its presence (with a fetch handler) makes the site
// installable on Android Chrome and gives the app an instant, app-like launch.
// We intentionally keep caching light: a network-first passthrough so members
// always get fresh content, with no stale-cache surprises.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-first passthrough. Required so the browser treats us as installable;
  // we don't cache responses to avoid serving stale member content.
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => Response.error()));
});
