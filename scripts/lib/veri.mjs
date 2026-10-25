// Arşiv dosyaları (public/data/arsiv/KOD.json) ve türev dosyalar (son.json, ozet.json, meta.json).
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BIRIMLER, KODLAR } from './meta.mjs';

export const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const VERI = path.join(KOK, 'public', 'data');
export const ARSIV = path.join(VERI, 'arsiv');

export async function arsivOku(kod) {
  const f = path.join(ARSIV, `${kod}.json`);
  if (!existsSync(f)) return null;
  return JSON.parse(await readFile(f, 'utf8'));
}
export async function arsivYaz(kod, obj) {
  await mkdir(ARSIV, { recursive: true });
  const s = JSON.stringify(obj);
  // her gün bir satır: elle incelenebilsin, git diff'i küçük kalsın
  const satirlar = obj.gunler.map(g => JSON.stringify(g)).join(',\n');
  const baslik = JSON.stringify({ ...obj, gunler: undefined }).slice(0, -1);
  await writeFile(path.join(ARSIV, `${kod}.json`), `${baslik},"gunler":[\n${satirlar}\n]}\n`);
  return s.length;
}
export async function tumArsiv() {
  const out = {};
  for (const k of KODLAR) { const a = await arsivOku(k); if (a) out[k] = a; }
  return out;
}

/** Bir bülteni arşive ekler. Aynı tarih varsa üzerine yazmaz (değişmezlik); farklıysa uyarı döner. */
export function bultenEkle(arsiv, kod, tarih, k) {
  const a = arsiv[kod] || { kod, birim: k.birim, ornek: false, gunler: [] };
  if (a.birim !== k.birim) throw new Error(`${kod}: birim değişmiş (${a.birim} → ${k.birim}); arşiv elle gözden geçirilmeli`);
  const son = a.gunler[a.gunler.length - 1];
  const satir = [tarih, k.db, k.ds, k.eb, k.es];
  if (son && son[0] === tarih) {
    const ayni = son.slice(1).every((v, i) => v === satir[i + 1]);
    return { arsiv: a, durum: ayni ? 'ayni' : 'celisiyor' };
  }
  if (son && son[0] > tarih) return { arsiv: a, durum: 'eski' };
  a.gunler.push(satir);
  a.ilk = a.gunler[0][0];
  a.son = tarih;
  return { arsiv: a, durum: 'eklendi' };
}

export const yuzde = (yeni, eski) => (eski ? Math.round(((yeni - eski) / eski) * 1e6) / 1e4 : null);

/** ≤ tarih olan son satırı döndürür (ikili arama). */
export function satirBul(gunler, iso) {
  let lo = 0, hi = gunler.length - 1, bul = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (gunler[m][0] <= iso) { bul = m; lo = m + 1; } else hi = m - 1;
  }
  return bul;
}
const gunEkle = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/** son.json ve ozet.json üretimi. */
export async function turevleriYaz({ simdi = new Date() } = {}) {
  const arsiv = await tumArsiv();
  const usd = arsiv.USD;
  if (!usd || !usd.gunler.length) throw new Error('USD arşivi boş: önce `npm run arsiv` (gerçek veri) ya da `npm run ornek` çalıştırın.');
  const tarih = usd.gunler[usd.gunler.length - 1][0];
  const onceki = usd.gunler.length > 1 ? usd.gunler[usd.gunler.length - 2][0] : null;
  const ornek = Object.values(arsiv).some(a => a.ornek);
  const kurlar = {}, oncekiKurlar = {};
  const ozet = {};
  for (const b of BIRIMLER) {
    const a = arsiv[b.kod];
    if (!a || !a.gunler.length) continue;
    const g = a.gunler;
    const iSon = satirBul(g, tarih);
    if (iSon < 0 || g[iSon][0] !== tarih) continue; // o gün yayımlanmamışsa güncel tabloya girmez
    kurlar[b.kod] = g[iSon].slice(1);
    if (iSon > 0) oncekiKurlar[b.kod] = g[iSon - 1].slice(1);
    const db = g[iSon][1];
    const dec = n => { const i = satirBul(g, gunEkle(tarih, -n)); return i >= 0 && g[i][1] ? yuzde(db, g[i][1]) : null; };
    const son30 = g.slice(-30).map(r => r[1]);
    const yil = g.filter(r => r[0] > gunEkle(tarih, -365)).map(r => r[1]).filter(Boolean);
    ozet[b.kod] = {
      g1: iSon > 0 ? yuzde(db, g[iSon - 1][1]) : null,
      g7: dec(7), g30: dec(30), g90: dec(90), g365: dec(365),
      spark: son30,
      yuksek365: yil.length ? Math.max(...yil) : null,
      dusuk365: yil.length ? Math.min(...yil) : null,
    };
  }
  const uretim = simdi.toISOString();
  await mkdir(VERI, { recursive: true });
  await writeFile(path.join(VERI, 'son.json'), JSON.stringify({ kaynak: 'TCMB', tarih, onceki, uretim, ornek, kurlar, oncekiKurlar }) + '\n');
  await writeFile(path.join(VERI, 'ozet.json'), JSON.stringify({ tarih, ornek, ozet }) + '\n');
  await writeFile(path.join(VERI, 'meta.json'), JSON.stringify(BIRIMLER.map(({ kod, ad, kisa, slug, sembol, populer, sira }) => ({ kod, ad, kisa, slug, sembol, populer, sira, birim: (arsiv[kod] && arsiv[kod].birim) || 1 }))) + '\n');
  // Borsa sitesinin alt bölümde göstereceği 3 anahtar değer (sözleşme: docs/05-borsa-capraz-baglanti.md)
  const dis = ['USD', 'EUR', 'GBP'].filter(k => kurlar[k]).map(k => ({
    kod: `${k}/TRY`, ad: BIRIMLER.find(b => b.kod === k).kisa, deger: kurlar[k][0] / (arsiv[k].birim || 1), degisim: ozet[k].g1,
  }));
  await writeFile(path.join(VERI, 'ozet-dis.json'), JSON.stringify({ site: 'doviz', kaynak: 'TCMB', tarih, ornek, degerler: dis }) + '\n');
  return { tarih, onceki, ornek, paraSayisi: Object.keys(kurlar).length };
}
