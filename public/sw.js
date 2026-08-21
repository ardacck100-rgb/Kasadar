/*
 * Kasadar service worker.
 *
 * Amaç: uygulama internet olmadan da açılsın. Veri zaten localStorage'da,
 * yani çevrimdışıyken de tam işlevli çalışır.
 *
 * Strateji:
 *  - Uygulama kabuğu kurulumda önbelleğe alınır.
 *  - Diğer aynı-kaynak GET istekleri "önce önbellek, arkada tazele"
 *    (stale-while-revalidate) ile servis edilir. Vite'ın hash'li dosya
 *    adları bilinemeyeceği için ön yükleme listesine yazılamaz; ilk
 *    ziyarette çalışma anında önbelleğe girerler.
 */

const VERSION = 'kasadar-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Sayfa açılışı: ağ varsa taze sürüm, yoksa önbellekteki kabuk.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached ?? caches.match('./'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached ?? network;
    }),
  );
});
