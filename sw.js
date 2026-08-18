const CACHE = "gaza-help-v3";
const ASSETS = [
  "./","./index.html","./styles.css","./app.js","./data.json",
  "./manifest.webmanifest","./privacy.html","./sources.html",
  "./icon.svg","./icon-180.png","./icon-192.png","./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return res;
    }).catch(() => caches.match(event.request).then(r => r || caches.match("./index.html")))
  );
});
