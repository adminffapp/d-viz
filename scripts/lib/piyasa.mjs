// Saatlik piyasa kuru: Open Exchange Rates (USD tabanlı) verisinden TL çapraz kurları.
// TCMB arşivinden AYRI bir katmandır: resmî gösterge kuru değil, piyasa ortalamasıdır.
// Ücretsiz plan: saatlik güncelleme, ayda 1.000 istek. Piyasa kapalıyken istek atılmaz (ayda ~550 istek).
import { KODLAR } from './meta.mjs';

export const SAGLAYICI = 'Open Exchange Rates';
export const SERI_UZUNLUK = 25; // son 24 saat + şimdiki değer

/** Forex piyasası Cuma 22:00 UTC – Pazar 21:00 UTC arası kapalıdır (yaklaşık). */
export function piyasaKapali(t = new Date()) {
  const g = t.getUTCDay(), s = t.getUTCHours();
  return g === 6 || (g === 0 && s < 21) || (g === 5 && s >= 22);
}

const yuvarla = v => Number(v.toPrecision(6));

/** OXR latest.json yanıtını {zaman, kurlar:{KOD: 1 birim kaç TL}} yapısına çevirir. */
export function ayristir(j) {
  if (!j || typeof j !== 'object' || !j.rates) throw new Error('Yanıt tanınmadı: rates yok' + (j && j.description ? ` (${j.description})` : ''));
  if (j.base && j.base !== 'USD') throw new Error(`Beklenmeyen baz para birimi: ${j.base}`);
  const tryUsd = Number(j.rates.TRY);
  if (!Number.isFinite(tryUsd) || tryUsd <= 0) throw new Error('TRY kuru yok');
  const kurlar = {};
  for (const kod of KODLAR) {
    const x = kod === 'USD' ? 1 : Number(j.rates[kod]);
    if (Number.isFinite(x) && x > 0) kurlar[kod] = yuvarla(tryUsd / x);
  }
  if (!kurlar.USD || Object.keys(kurlar).length < 5) throw new Error('Yanıtta yeterli para birimi yok');
  const zaman = Number.isFinite(j.timestamp) ? new Date(j.timestamp * 1000).toISOString() : new Date().toISOString();
  return { zaman, kurlar };
}

/** Yeni ölçümü önceki dosyaya ekler; 24 saatlik seri ve değişimi hesaplar. Aynı zaman damgasıysa null döner. */
export function birlestir(onceki, yeni, cekildi = new Date().toISOString()) {
  if (onceki && onceki.zaman === yeni.zaman) return null;
  const saatler = [...(onceki?.saatler || []), yeni.zaman].slice(-SERI_UZUNLUK);
  const seri = {}, g24 = {};
  for (const [kod, v] of Object.entries(yeni.kurlar)) {
    const eski = onceki?.seri?.[kod] || [];
    // eski seri saat dizisiyle aynı uzunlukta tutulur; eksik değer null
    const hizali = [...Array(Math.max(0, (onceki?.saatler || []).length - eski.length)).fill(null), ...eski];
    seri[kod] = [...hizali, v].slice(-SERI_UZUNLUK);
  }
  // 24 saat önceye en yakın (ondan eski olmayan) ölçümle değişim
  const hedef = Date.parse(yeni.zaman) - 24 * 3600e3;
  const i = saatler.findIndex(s => Date.parse(s) >= hedef - 30 * 60e3);
  for (const [kod, dizi] of Object.entries(seri)) {
    const ref = i >= 0 && i < dizi.length - 1 ? dizi[i] : null;
    g24[kod] = ref ? Math.round(((dizi.at(-1) - ref) / ref) * 1e6) / 1e4 : null;
  }
  return {
    kaynak: SAGLAYICI,
    tur: 'piyasa-ortalamasi',
    aciklama: 'Saatlik piyasa ortalaması. TCMB resmî gösterge kuru ve banka işlem kuru değildir.',
    zaman: yeni.zaman,
    cekildi,
    kurlar: yeni.kurlar,
    g24,
    saatler,
    seri,
  };
}

export async function getir(appId, { deneme = 3, fetchFn = fetch } = {}) {
  if (!appId) throw new Error('OXR_APP_ID tanımlı değil. openexchangerates.org üzerinden ücretsiz anahtar alıp GitHub Secrets\'a ekleyin.');
  const url = `https://openexchangerates.org/api/latest.json?app_id=${encodeURIComponent(appId)}`;
  let son;
  for (let i = 0; i < deneme; i++) {
    try {
      const ctl = new AbortController();
      const zamanAsimi = setTimeout(() => ctl.abort(), 20000);
      const r = await fetchFn(url, { headers: { Accept: 'application/json' }, signal: ctl.signal });
      clearTimeout(zamanAsimi);
      const j = await r.json().catch(() => null);
      if (r.status === 401 || r.status === 403) throw Object.assign(new Error(`Anahtar reddedildi (HTTP ${r.status}): ${j?.description || ''}`), { kalici: true });
      if (r.status === 429) throw Object.assign(new Error('Aylık istek kotası doldu (HTTP 429)'), { kalici: true });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return ayristir(j);
    } catch (e) {
      son = e;
      if (e.kalici) break;
      await new Promise(res => setTimeout(res, 1500 * (i + 1)));
    }
  }
  throw new Error(`Piyasa kuru alınamadı: ${son && son.message}`);
}
