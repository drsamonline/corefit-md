/* CoreFit MD — service worker.
   HTML is network-first so a shipped update is visible on the next load; assets
   are cache-first with a background refresh so the app opens instantly. The
   cache name is bumped on every release, and registration.update() is called by
   the page — a cache-first HTML response is how releases go missing. */

const CACHE = 'corefit-v2.3.0';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/fonts/fonts.css',
  './assets/fonts/bricolage-grotesque.woff2',
  './assets/fonts/plus-jakarta-sans.woff2',
  './assets/fonts/azeret-mono.woff2',
  './assets/i18n/strings.js',
  './assets/js/config.js',
  './assets/js/data.js',
  './assets/js/store.js',
  './assets/js/i18n.js',
  './assets/js/video.js',
  './assets/js/session.js',
  './assets/js/ui.js',
  './assets/js/main.js',
  './assets/demo/plank.svg',
  './assets/demo/deadbug.svg',
  './assets/demo/birddog.svg',
  './assets/demo/bicycle.svg',
  './assets/demo/hollow.svg',
  './assets/demo/warmup.svg',
  './assets/demo/cooldown.svg',
  './assets/demo/sideplank.svg',
  './assets/demo/glutebridge.svg',
  './assets/demo/superman.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;          // never intercept YouTube or thumbnails

  const isDocument = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isDocument) {
    // network-first: the reader always gets the release that is actually live
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // stale-while-revalidate for everything else
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('./index.html'));
});
