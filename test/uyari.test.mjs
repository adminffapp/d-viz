import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';

// Sahte Upstash ve Resend: gerçek ağ ya da gizli anahtar gerekmez.
const kv = new Map(), ttl = new Map(), sets = new Map(), epostalar = [];
globalThis.fetch = async (url, init) => {
  const body = JSON.parse(init.body);
  if (String(url).includes('resend')) { epostalar.push(body); return { ok: true, json: async () => ({}) }; }
  const [c, ...a] = body; let r = null;
  if (c === 'GET') r = kv.get(a[0]) ?? null;
  else if (c === 'SET') { kv.set(a[0], a[1]); r = 'OK'; }
  else if (c === 'DEL') { r = kv.delete(a[0]) ? 1 : 0; }
  else if (c === 'INCR') { const n = Number(kv.get(a[0]) || 0) + 1; kv.set(a[0], String(n)); r = n; }
  else if (c === 'DECR') { const n = Number(kv.get(a[0]) || 0) - 1; kv.set(a[0], String(n)); r = n; }
  else if (c === 'EXPIRE') r = 1;
  else if (c === 'TTL') r = 1000;
  else if (c === 'SADD') { (sets.get(a[0]) || sets.set(a[0], new Set()).get(a[0])).add(a[1]); r = 1; }
  else if (c === 'SREM') { sets.get(a[0])?.delete(a[1]); r = 1; }
  else if (c === 'SMEMBERS') r = [...(sets.get(a[0]) || [])];
  return { ok: true, json: async () => ({ result: r }) };
};
Object.assign(process.env, { UPSTASH_REDIS_REST_URL: 'https://kv.test', UPSTASH_REDIS_REST_TOKEN: 'x', RESEND_API_KEY: 'x', RESEND_FROM: 'a@b.c', SITE_ORIGIN: 'https://t.example' });

const yanit = () => { const r = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; } }; return r; };
const istek = (govde, extra = {}) => ({ method: 'POST', body: govde, headers: {}, socket: { remoteAddress: '1.2.3.4' }, query: {}, ...extra });
const { default: uyari } = await import('../api/uyari.js');
const { default: onay } = await import('../api/onay.js');
const { default: cikis } = await import('../api/cikis.js');

const gecerli = { eposta: 'a@example.com', kod: 'USD', tur: 'hedef', yon: 'ustu', deger: 40, onay: true };

test('doğrulama: bozuk girdiler reddedilir', async () => {
  for (const kotu of [{ ...gecerli, eposta: 'x' }, { ...gecerli, kod: 'XXX' }, { ...gecerli, deger: -1 }, { ...gecerli, onay: false }, { ...gecerli, tur: 'yuzde', deger: 500, baz: 40 }]) {
    const r = yanit(); await uyari(istek(kotu), r); assert.equal(r.statusCode, 400, JSON.stringify(kotu));
  }
});
test('bot tuzağı sessizce yutulur ve kayıt oluşmaz', async () => {
  const once = kv.size; const r = yanit(); await uyari(istek({ ...gecerli, web: 'spam' }), r);
  assert.equal(r.statusCode, 200); assert.equal(kv.size, once);
});
let id, cikisT;
test('uyarı oluşur, onay e-postası gider, onaylanmadan tetiklenmez', async () => {
  const r = yanit(); await uyari(istek(gecerli), r);
  assert.equal(r.statusCode, 200); assert.equal(epostalar.length, 1);
  assert.match(epostalar[0].text, /api\/onay\?id=/);
  const kayit = [...kv.entries()].find(([k]) => k.startsWith('uyari:'));
  const k = JSON.parse(kayit[1]); id = k.id; cikisT = k.cikisToken;
  assert.equal(k.durum, 'bekliyor');
});
test('yanlış onay kodu reddedilir, doğrusu kabul edilir', async () => {
  let r = yanit(); await onay({ query: { id, t: 'yanlis' } }, r); assert.equal(r.statusCode, 403);
  const k = JSON.parse(kv.get('uyari:' + id));
  r = yanit(); await onay({ query: { id, t: k.onayToken } }, r); assert.equal(r.statusCode, 200);
  assert.equal(JSON.parse(kv.get('uyari:' + id)).durum, 'onayli');
});
test('günlük gönderici: koşul sağlanınca tek e-posta, kayıt silinir', async () => {
  mkdirSync('public/data', { recursive: true });
  const sonVar = existsSync('public/data/son.json'); if (sonVar) copyFileSync('public/data/son.json', '/tmp/son.yedek.json');
  writeFileSync('public/data/son.json', JSON.stringify({ tarih: '2026-10-23', ornek: false, kurlar: { USD: [41, 41.1, null, null] }, oncekiKurlar: {} }));
  const { calistir } = await import('../scripts/uyari-gonder.mjs');
  const once = epostalar.length;
  const s = await calistir();
  if (sonVar) copyFileSync('/tmp/son.yedek.json', 'public/data/son.json');
  assert.equal(s.gonderilen, 1); assert.equal(epostalar.length, once + 1);
  assert.equal(kv.get('uyari:' + id), undefined);
  const s2 = await calistir(); assert.equal(s2.gonderilen, 0); // ikinci kez gönderilmez
});
test('iptal bağlantısı kaydı siler', async () => {
  const r0 = yanit(); await uyari(istek({ ...gecerli, eposta: 'b@example.com' }), r0);
  const k = JSON.parse([...kv.entries()].filter(([x]) => x.startsWith('uyari:')).at(-1)[1]);
  let r = yanit(); await cikis({ query: { id: k.id, t: 'yanlis' } }, r); assert.equal(r.statusCode, 403);
  r = yanit(); await cikis({ query: { id: k.id, t: k.cikisToken } }, r); assert.equal(r.statusCode, 200);
  assert.equal(kv.get('uyari:' + k.id), undefined);
});
