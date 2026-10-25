// Üretilmiş sayfaları tarar: kırık iç bağlantı, eksik/yinelenen başlık-açıklama, h1 sayısı, canonical.
// Sonucu public/data/saglik.json'a yazar; sorun varsa çıkış kodu 1 (Action uyarı verir ama yayını durdurmaz).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PUB = path.join(KOK, 'public');
async function* gez(d) { for (const x of await readdir(d, { withFileTypes: true })) { const p = path.join(d, x.name); if (x.isDirectory()) yield* gez(p); else yield p; } }
const sayfalar = []; const dosyalar = new Set();
for await (const p of gez(PUB)) { const g = '/' + path.relative(PUB, p).split(path.sep).join('/'); dosyalar.add(g); if (p.endsWith('.html')) sayfalar.push([g, p]); }
const yolaCevir = g => g.endsWith('/index.html') ? g.slice(0, -10) : g;
const var_ = h => { const d = decodeURIComponent(h.split('#')[0].split('?')[0]); return dosyalar.has(d) || dosyalar.has(d + 'index.html') || dosyalar.has(d.replace(/\/$/, '') + '/index.html'); };
const sorunlar = []; const basliklar = new Map(); const aciklamalar = new Map(); let toplamBaglanti = 0;
for (const [g, p] of sayfalar) {
  const html = await readFile(p, 'utf8'); const yol = yolaCevir(g);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
  const t = html.match(/<title>([^<]*)<\/title>/)?.[1]; const a = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (!t) sorunlar.push({ yol, tur: 'başlık yok' });
  if (!noindex) {
    if (!a) sorunlar.push({ yol, tur: 'açıklama yok' });
    if (a && (a.length < 50 || a.length > 200)) sorunlar.push({ yol, tur: 'açıklama uzunluğu', ayrinti: a.length });
    if (t) basliklar.set(t, [...(basliklar.get(t) || []), yol]); if (a) aciklamalar.set(a, [...(aciklamalar.get(a) || []), yol]);
    if (!/<link rel="canonical"/.test(html)) sorunlar.push({ yol, tur: 'canonical yok' });
  }
  if (!noindex && h1 !== 1 && g !== '/404.html') sorunlar.push({ yol, tur: 'h1 sayısı', ayrinti: h1 });
  for (const m of html.matchAll(/<a\s[^>]*href="(\/[^"]*)"/g)) { toplamBaglanti++; const h = m[1].replace(/&amp;/g, '&'); if (!var_(h)) sorunlar.push({ yol, tur: 'kırık bağlantı', ayrinti: h }); }
}
for (const [t, y] of basliklar) if (y.length > 1) sorunlar.push({ yol: y[0], tur: 'yinelenen başlık', ayrinti: `${y.length} sayfa: ${t}` });
for (const [t, y] of aciklamalar) if (y.length > 1) sorunlar.push({ yol: y[0], tur: 'yinelenen açıklama', ayrinti: `${y.length} sayfa` });
const sitemap = existsSync(path.join(PUB, 'sitemap.xml')) ? (await readFile(path.join(PUB, 'sitemap.xml'), 'utf8')).match(/<loc>/g)?.length ?? 0 : 0;
const sonuc = { zaman: new Date().toISOString(), sayfa: sayfalar.length, baglanti: toplamBaglanti, sitemap, sorunSayisi: sorunlar.length, sorunlar: sorunlar.slice(0, 200) };
await writeFile(path.join(PUB, 'data/saglik.json'), JSON.stringify(sonuc, null, 1));
console.log(`${sonuc.sayfa} sayfa, ${sonuc.baglanti} iç bağlantı, sitemap ${sitemap} adres, ${sonuc.sorunSayisi} sorun`);
for (const s of sorunlar.slice(0, 40)) console.log(' -', s.yol, s.tur, s.ayrinti ?? '');
process.exit(sorunlar.length ? 1 : 0);
