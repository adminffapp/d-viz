// Statik sayfa üreticisi. Kullanım:
//   npm run uret          → public/ içine sayfaları yazar (örnek veriyle de çalışır)
//   npm run yayin-uret    → ÖRNEK veri varsa durur; yalnızca gerçek TCMB verisiyle yayına hazırlar
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { KOK, VERI } from './lib/veri.mjs';
import { AYAR } from '../public/assets/js/ayar.js';

const yayin = process.argv.includes('--yayin');
const oku = async f => JSON.parse(await readFile(path.join(VERI, f), 'utf8'));
const meta = await oku('meta.json'), son = await oku('son.json'), ozet = await oku('ozet.json');
if (yayin && son.ornek) { console.error('DURDU: Arşivde ÖRNEK veri var. Gerçek veriyle yayına çıkın: npm run arsiv'); process.exit(1); }

// Varlık sürümü: css/js içeriğinden; değişince önbellek geçersiz olur.
async function surumHesapla() {
  const h = createHash('sha1');
  for (const d of ['doviz.css', 'js/app.js', 'js/hesap.js', 'js/veri.js', 'js/ui.js']) h.update(await readFile(path.join(KOK, 'public/assets', d)));
  return h.digest('hex').slice(0, 8);
}
const surum = await surumHesapla();
const arsivler = {};
const arsivAl = async kod => (arsivler[kod] ||= JSON.parse(await readFile(path.join(VERI, 'arsiv', kod + '.json'), 'utf8')));
const c = { meta, son, ozet, surum, arsivAl, yayin, birim: Object.fromEntries(meta.map(m => [m.kod, m])) };

const sayfalar = [];
const ekle = (yol, html, { sitemap = true, oncelik = 0.6, degisim = 'daily', lastmod } = {}) => sayfalar.push({ yol, html, sitemap, oncelik, degisim, lastmod: lastmod || son.tarih });

const modul = async ad => (await import(`./sablon/${ad}.mjs`));
const { anaSayfa } = await modul('ana');
ekle('/', anaSayfa(c), { oncelik: 1 });
for (const ad of ['kurlar', 'kur-detay', 'araclar', 'rehber', 'bilgi', 'seo']) {
  if (!existsSync(path.join(KOK, 'scripts/sablon', ad + '.mjs'))) continue;
  const m = await modul(ad);
  await m.uret(c, ekle);
}

const cikti = path.join(KOK, 'public');
for (const s of sayfalar) {
  const dosya = s.yol === '/404.html' ? '404.html' : path.join(s.yol.replace(/^\//, ''), 'index.html');
  const hedef = path.join(cikti, dosya);
  await mkdir(path.dirname(hedef), { recursive: true });
  await writeFile(hedef, s.html);
}
// Eski sayfaları temizle: artık üretilmeyen /kur/<slug>/ klasörlerini sil (örn. TCMB'nin bıraktığı para birimleri).
{
  const var_ = new Set(sayfalar.map(s => s.yol));
  const kurDizin = path.join(cikti, 'kur');
  if (existsSync(kurDizin)) {
    const { readdir } = await import('node:fs/promises');
    for (const ad of await readdir(kurDizin)) {
      if (!var_.has(`/kur/${ad}/`)) { await rm(path.join(kurDizin, ad), { recursive: true, force: true }); console.log('eski sayfa silindi: /kur/' + ad + '/'); }
    }
  }
}
// sitemap, robots, llms
const sm = sayfalar.filter(s => s.sitemap);
await writeFile(path.join(cikti, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm.map(s => `<url><loc>${AYAR.origin}${s.yol}</loc><lastmod>${s.lastmod}</lastmod><changefreq>${s.degisim}</changefreq><priority>${s.oncelik}</priority></url>`).join('\n')}\n</urlset>\n`);
await writeFile(path.join(cikti, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /yonetim/\nDisallow: /rapor/\n\nSitemap: ${AYAR.origin}/sitemap.xml\n`);
// llms.txt: yapay zekâ araçları için siteyi tanıtan kısa dizin (başlıklar sayfaların kendi <title> değerinden gelir)
{
  const baslikAl = yol => { const s = sayfalar.find(x => x.yol === yol); const m = s && /<title>([^<]*)<\/title>/.exec(s.html); return m ? m[1].replace(/\s*\|\s*Forex$/, '') : null; };
  const bolum = (ad, yollar) => { const l = yollar.map(y => { const b = baslikAl(y); return b ? `- [${b}](${AYAR.origin}${y})` : null; }).filter(Boolean); return l.length ? `## ${ad}\n\n${l.join('\n')}\n` : ''; };
  const kurYollari = sayfalar.filter(s => /^\/kur\/[^/]+\/$/.test(s.yol)).map(s => s.yol);
  const rehber = sayfalar.filter(s => /^\/rehber\/[^/]+\/$/.test(s.yol)).map(s => s.yol);
  const metin = `# Forex\n\n> Forex, T.C. Merkez Bankası gösterge kurlarıyla güncel ve geçmiş tarihli döviz kuru bilgisi, para birimi çevirici, grafik ve karşılaştırma araçları sunan ücretsiz bir sitedir. FF-App Labs tarafından hazırlanır. Alım satım yapmaz, yatırım tavsiyesi vermez.\n\nVeriler TCMB'nin günlük bülteninden gelir; hafta sonu ve resmî tatillerde son iş gününün bülteni geçerlidir. Kurlar anlık piyasa fiyatı değildir.\n\n` +
    bolum('Araçlar', ['/', '/cevirici/', '/karsilastir/', '/tarihe-gore-kur/', '/gecmis-kur/', '/kurlar/', '/takip/', '/uyarilar/']) + '\n' +
    bolum('Para birimi kur sayfaları', kurYollari) + '\n' +
    bolum('Rehber', ['/rehber/', ...rehber]) + '\n' +
    bolum('Veri ve yasal', ['/veri-kaynagi/', '/yasal-uyari/', '/gizlilik/', '/kullanim-sartlari/', '/hakkimizda/', '/iletisim/']) + `\n## Site haritası\n\n- [sitemap.xml](${AYAR.origin}/sitemap.xml)\n`;
  await writeFile(path.join(cikti, 'llms.txt'), metin);
}
// hizmet işçisi: sürüm gömülür
const swKaynak = await readFile(path.join(KOK, 'scripts/sablon/sw.js'), 'utf8').catch(() => null);
if (swKaynak) await writeFile(path.join(cikti, 'sw.js'), swKaynak.replace('__SURUM__', surum));
console.log(`${sayfalar.length} sayfa yazıldı · sürüm ${surum} · veri ${son.tarih}${son.ornek ? ' (ÖRNEK)' : ''}`);
