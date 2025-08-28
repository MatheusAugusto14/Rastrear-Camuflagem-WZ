
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("bo6-cache").then(cache => {
      return cache.addAll([
        "./",
        "index.html",
        "style.css",
        "script.js",
        "manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});
