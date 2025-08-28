self.addEventListener('install', (event) => {
      event.waitUntil(caches.open('pwa-cache-v1').then(cache => cache.addAll([
  "/index.html",
  "/manifest.json",
  "/script.js",
  "/style.css",
  "/sw.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/favicon.png",
  "/manifest.webmanifest"
])));
      self.skipWaiting();
    });

    self.addEventListener('activate', (event) => {
      event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => k !== 'pwa-cache-v1' && caches.delete(k))))
      );
      self.clients.claim();
    });

    // Network-first for navigations (so pages update)
    self.addEventListener('fetch', (event) => {
      const req = event.request;
      const url = new URL(req.url);

      if (req.mode === 'navigate') {
        event.respondWith(
          fetch(req).then(res => {
            const copy = res.clone();
            caches.open('pwa-cache-v1').then(cache => cache.put(req, copy));
            return res;
          }).catch(() => caches.match(req))
        );
        return;
      }

      // Cache-first for static assets
      if (['style', 'script', 'image', 'font'].includes(req.destination)) {
        event.respondWith(
          caches.match(req).then(cached => {
            return cached || fetch(req).then(res => {
              const copy = res.clone();
              caches.open('pwa-cache-v1').then(cache => cache.put(req, copy));
              return res;
            });
          })
        );
        return;
      }
    });