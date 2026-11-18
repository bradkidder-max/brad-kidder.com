// The Universal family guide has been archived (see archive/universal/).
// This stub replaces the old service worker so devices that installed the guide
// quietly unregister it the next time the browser checks for an update.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.registration.unregister());
});
