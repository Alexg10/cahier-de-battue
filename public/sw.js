/* Service worker « cahier de battue » — cache l'app pour l'usage hors-ligne.
 * Stratégies :
 *  - navigations : réseau d'abord, repli sur le cache, puis page /hors-ligne
 *  - assets statiques (_next/static, icônes) : cache d'abord
 *  - le reste en GET : réseau d'abord avec repli cache
 * Les requêtes POST (server actions), l'auth et les exports ne sont jamais mis en cache.
 */
const VERSION = "v2";
const SHELL_CACHE = `shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;
const OFFLINE_URL = "/hors-ligne";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/api/icon") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(?:css|js|woff2?|png|jpg|jpeg|svg|ico)$/.test(url.pathname)
  );
}

// Chemins jamais mis en cache (auth, exports, sync éventuelle).
function isBypass(url) {
  return (
    url.pathname.startsWith("/api/auth") ||
    url.pathname.includes("/export") ||
    url.pathname.startsWith("/api/sync")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isBypass(url)) return;

  // Navigations : réseau d'abord, repli cache puis page hors-ligne.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL));
        }
      })(),
    );
    return;
  }

  // Assets statiques : « stale-while-revalidate ». On sert le cache tout de
  // suite (rapide, hors-ligne) mais on rafraîchit en arrière-plan, de sorte
  // que le rechargement suivant serve toujours la dernière version.
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((fresh) => {
            cache.put(request, fresh.clone());
            return fresh;
          })
          .catch(() => null);
        return cached || (await network) || fetch(request);
      })(),
    );
    return;
  }

  // Autres GET (données RSC, etc.) : réseau d'abord, repli cache.
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error("Offline and not cached");
      }
    })(),
  );
});
