"use client";

import { useEffect } from "react";

/** Enregistre le service worker en production ; le purge en développement. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // En développement : ne jamais servir depuis un cache. On désenregistre
    // tout SW (souvent laissé par une build de prod lancée sur le même port)
    // et on vide les caches, pour toujours voir le dernier code à chaque build.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silencieux : l'app reste fonctionnelle sans SW.
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
