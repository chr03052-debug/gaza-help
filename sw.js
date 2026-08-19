くconst CACHE_NAME = "gaza-help-v8";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data.json",
  "./manifest.webmanifest",
  "./privacy.html",
  "./sources.html",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

// インストール
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1ファイルの失敗で全部失敗しないように個別に保存
      await Promise.allSettled(
        STATIC_FILES.map((file) =>
          cache.add(new Request(file, { cache: "reload" }))
        )
      );
    })
  );

  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

// 通信処理
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // 外部サイトはService Workerで処理しない
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTMLページ
  // オンライン時は必ず最新を確認
  // 通信失敗時だけ保存済みページを表示
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request, {
            cache: "no-store"
          });

          if (response && response.ok) {
            const copy = response.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, copy);
          }

          return response;
        } catch (error) {
          const cachedPage = await caches.match(request);

          if (cachedPage) {
            return cachedPage;
          }

          const fallback = await caches.match("./index.html");

          if (fallback) {
            return fallback;
          }

          return new Response(
            "Offline",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        }
      })()
    );

    return;
  }

 // data.json
// オンライン時だけ取得する。
// オフライン時は失敗させ、app.js 側の保存済みデータを使用する。
if (url.pathname.endsWith("/data.json")) {
  event.respondWith(
    fetch(request, {
      cache: "no-store"
    }).catch(() =>
      new Response("Offline", {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      })
    )
  );

  return;
}
  // CSS・JS・画像など
  // すぐキャッシュを表示しつつ、裏で最新版に更新
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      const networkPromise = fetch(request, {
        cache: "no-cache"
      })
        .then(async (response) => {
          if (response && response.ok) {
            const copy = response.clone();
            const cache = await caches.open(CACHE_NAME);

            await cache.put(request, copy);
          }

          return response;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(networkPromise);
        return cached;
      }

      const networkResponse = await networkPromise;

      if (networkResponse) {
        return networkResponse;
      }

      return new Response("", {
        status: 503
      });
    })()
  );
});
