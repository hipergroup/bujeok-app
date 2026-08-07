/* 수호부 서비스 워커 — 재방문 로딩 가속 + 오프라인 대응
 * 정적 자산(해시된 청크·폰트·이미지): 캐시 우선
 * 페이지(HTML): 네트워크 우선, 실패 시 캐시 (배포는 즉시 반영, 오프라인은 마지막 화면)
 */
const CACHE = 'suhobu-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isStaticAsset =
    url.pathname.includes('/_next/static/') ||
    url.pathname.includes('/brand/') ||
    /\.(png|jpg|webp|svg|ico|woff2?)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  const isPage =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isPage) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});
