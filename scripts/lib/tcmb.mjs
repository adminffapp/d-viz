// TCMB gösterge kuru bültenlerini indirir ve ayrıştırır.
// Kurlar BÜLTENDE YAYIMLANDIĞI GİBİ saklanır (ör. 100 JPY = 34,0096 TL): 'birim' ayrı alandır; bölme yapılmaz.
// Güncel:  https://www.tcmb.gov.tr/kurlar/today.xml
// Arşiv:   https://www.tcmb.gov.tr/kurlar/YYYYMM/DDMMYYYY.xml  (hafta sonu / tatil / yayım yok → 404)
import { KODLAR } from './meta.mjs';

const TABAN = 'https://www.tcmb.gov.tr/kurlar';
const UA = 'FF-Doviz/1.0 (+https://doviz.ffapplabs.com; veri arsivi)';

export const iki = n => String(n).padStart(2, '0');
export const isoTarih = d => `${d.getUTCFullYear()}-${iki(d.getUTCMonth() + 1)}-${iki(d.getUTCDate())}`;
export function arsivUrl(iso) {
  const [y, m, g] = iso.split('-');
  return `${TABAN}/${y}${m}/${g}${m}${y}.xml`;
}
export const guncelUrl = () => `${TABAN}/today.xml`;

const sayi = s => {
  if (s == null) return null;
  const t = String(s).trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** XML metnini {tarih, bulten, kurlar:{KOD:{db,ds,eb,es}}} yapısına çevirir (kurlar 1 BİRİM başına TL). */
export function ayristir(xml) {
  const baslik = xml.match(/<Tarih_Date\b([^>]*)>/);
  if (!baslik) throw new Error('TCMB bülteni tanınmadı: <Tarih_Date> yok');
  const dateAttr = baslik[1].match(/\bDate="(\d{2})\/(\d{2})\/(\d{4})"/);
  const tarihAttr = baslik[1].match(/\bTarih="(\d{2})\.(\d{2})\.(\d{4})"/);
  let tarih = null;
  if (dateAttr) tarih = `${dateAttr[3]}-${dateAttr[1]}-${dateAttr[2]}`;
  else if (tarihAttr) tarih = `${tarihAttr[3]}-${tarihAttr[2]}-${tarihAttr[1]}`;
  if (!tarih) throw new Error('Bülten tarihi okunamadı');
  const bulten = (baslik[1].match(/\bBulten_No="([^"]+)"/) || [])[1] || null;
  const kurlar = {};
  const bloklar = xml.match(/<Currency\b[\s\S]*?<\/Currency>/g) || [];
  for (const b of bloklar) {
    const kod = (b.match(/\bKod="([A-Z]{3})"/) || b.match(/\bCurrencyCode="([A-Z]{3})"/) || [])[1];
    if (!kod || !KODLAR.includes(kod)) continue;
    const al = etiket => (b.match(new RegExp(`<${etiket}>([^<]*)</${etiket}>`)) || [])[1];
    const birim = sayi(al('Unit')) || 1;
    kurlar[kod] = {
      birim,
      db: sayi(al('ForexBuying')),
      ds: sayi(al('ForexSelling')),
      eb: sayi(al('BanknoteBuying')),
      es: sayi(al('BanknoteSelling')),
    };
  }
  if (!Object.keys(kurlar).length) throw new Error('Bültende tanımlı para birimi yok');
  return { tarih, bulten, kurlar };
}

async function getir(url, deneme = 3) {
  let son;
  for (let i = 0; i < deneme; i++) {
    try {
      const ctl = new AbortController();
      const zaman = setTimeout(() => ctl.abort(), 20000);
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/xml,text/xml' }, signal: ctl.signal });
      clearTimeout(zaman);
      if (r.status === 404) return null; // yayım yok (hafta sonu, tatil)
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } catch (e) {
      son = e;
      await new Promise(res => setTimeout(res, 800 * (i + 1)));
    }
  }
  throw new Error(`${url} alınamadı: ${son && son.message}`);
}

/** Belirli bir günün bülteni; yayım yoksa null. */
export async function gunBulteni(iso) {
  const xml = await getir(arsivUrl(iso));
  return xml ? ayristir(xml) : null;
}
/** Güncel bülten (today.xml). */
export async function guncelBulten() {
  const xml = await getir(guncelUrl());
  if (!xml) throw new Error('today.xml bulunamadı');
  return ayristir(xml);
}
