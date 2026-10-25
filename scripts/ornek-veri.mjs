// YALNIZCA GELİŞTİRME İÇİN: gerçek olmayan, rastgele yürüyüşle üretilmiş örnek arşiv.
// Dosyalar "ornek": true taşır; site üstte kalıcı uyarı gösterir; `uret --yayin` bunları reddeder.
// Gerçek veri için: npm run arsiv
import { rmSync } from 'node:fs';
import { BIRIMLER } from './lib/meta.mjs';
import { arsivYaz, turevleriYaz, ARSIV } from './lib/veri.mjs';
import { isoTarih } from './lib/tcmb.mjs';

let tohum = 20260101;
const rnd = () => { tohum = (tohum * 1664525 + 1013904223) >>> 0; return tohum / 4294967296; };
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
const BAZ = { USD: 5.3, EUR: 6.05, GBP: 6.7, CHF: 5.35, JPY: 0.048, CAD: 3.9, AUD: 3.75, SAR: 1.41, AED: 1.44, CNY: 0.77, AZN: 3.1, KWD: 17.4, QAR: 1.45, NOK: 0.61, SEK: 0.59, DKK: 0.81, RUB: 0.076, RON: 1.3, KRW: 0.0047, PKR: 0.038 };
const bitis = new Date(isoTarih(new Date(Date.now() + 3 * 3600e3)) + 'T00:00:00Z');
rmSync(ARSIV, { recursive: true, force: true });

const BIRIM_ORNEK = { JPY: 100, KRW: 100 };
const gunler = [];
for (let d = new Date('2019-01-02T00:00:00Z'); d <= bitis; d.setUTCDate(d.getUTCDate() + 1)) {
  const h = d.getUTCDay();
  if (h === 0 || h === 6) continue;
  if (rnd() < 0.025) continue; // sözde tatil
  gunler.push(isoTarih(d));
}
let tl = 0; // ortak TL değer kaybı faktörü (log)
const ortak = gunler.map(() => (tl += 0.00115 + 0.0045 * gauss()));
for (const b of BIRIMLER) {
  let ozel = 0; const vol = 0.0035;
  const satirlar = gunler.map((g, i) => {
    ozel += (b.kod === 'USD' ? 0 : vol * gauss());
    const v = BAZ[b.kod] * Math.exp(ortak[i] + ozel);
    const u = BIRIM_ORNEK[b.kod] || 1;
    const r = n => Math.round(n * u * 1e4) / 1e4;
    const db = r(v * 0.9985), ds = r(v * 1.0015);
    const ef = !['PKR', 'KRW', 'RON', 'QAR', 'AZN', 'KWD', 'DKK'].includes(b.kod) || b.kod === 'DKK';
    return [g, db, ds, ef ? r(v * 0.9935) : null, ef ? r(v * 1.0065) : null];
  });
  await arsivYaz(b.kod, { kod: b.kod, birim: BIRIM_ORNEK[b.kod] || 1, ornek: true, ilk: satirlar[0][0], son: satirlar.at(-1)[0], gunler: satirlar });
}
const t = await turevleriYaz();
console.log('ÖRNEK veri üretildi (gerçek değil). Son gün:', t.tarih, '· para birimi:', t.paraSayisi);
