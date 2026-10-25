// Servis çalışanı: kabuk önbelleği + son bilinen veri. Sürüm her üretimde değişir.
const SURUM = 'c89deef6';
const KABUK = 'kabuk-' + SURUM, VERI = 'veri-v1';
const ON = ['/', '/kurlar/', '/cevirici/', '/gecmis-kur/', '/takip/', '/assets/doviz.css', '/data/son.json', '/data/meta.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(KABUK).then(c => c.addAll(ON).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(a => Promise.all(a.filter(k => k.startsWith('kabuk-') && k !== KABUK).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  if (u.pathname.startsWith('/data/')) {
    // veri: önce ağ yeniden doğrulanır, çevrimdışıysa son bilinen kopya
    e.respondWith(fetch(r).then(y => { if (y.ok) { const k = y.clone(); caches.open(VERI).then(c => c.put(r, k)); } return y; }).catch(() => caches.match(r)));
    return;
  }
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(y => { const k = y.clone(); caches.open(KABUK).then(c => c.put(r, k)); return y; }).catch(() => caches.match(r).then(m => m || caches.match('/'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => { const a = fetch(r).then(y => { if (y.ok) { const k = y.clone(); caches.open(KABUK).then(c => c.put(r, k)); } return y; }).catch(() => m); return m || a; }));
});
