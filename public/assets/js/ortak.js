// Araç sayfalarının ortak yardımcıları: ortam yükleme, kur sorgusu, seçenek listeleri.
import { temel, arsivYukle } from './veri.js';
import { kurBul, tarihYaz, TURLER } from './hesap.js';
import { kacis } from './ui.js';

let ortamSozu;
/** {meta, birim:{KOD:meta}, son, ilkTarih, sonTarih} */
export function ortam() {
  ortamSozu ||= (async () => {
    const t = await temel();
    const usd = await arsivYukle('USD');
    return { ...t, ilkTarih: usd.gunler[0][0], sonTarih: t.son.tarih };
  })();
  return ortamSozu;
}

export function paraSecenekleri(o, secili, { tl = true, yalnizPopuler = false } = {}) {
  const l = [...o.meta].sort((a, b) => a.sira - b.sira).filter(m => !yalnizPopuler || m.populer);
  const secenek = (kod, ad) => `<option value="${kod}"${kod === secili ? ' selected' : ''}>${kod} · ${kacis(ad)}</option>`;
  return (tl ? secenek('TRY', 'Türk Lirası') : '') + l.map(m => secenek(m.kod, m.ad)).join('');
}

/**
 * 1 birim para biriminin TL karşılığı, istenen tarihte (tarih boşsa son bülten).
 * Dönüş: {tl, bilgi} — bilgi: kurBul sonucu (neden, tarih, turDegisti...) ya da {hata}.
 */
export async function tlKuru(o, kod, iso, turIdx = 1) {
  if (kod === 'TRY') return { tl: 1, bilgi: { tarih: iso || o.sonTarih, istenen: iso || o.sonTarih, kur: 1, birim: 1, tam: true, neden: 'tam', tur: turIdx } };
  const a = await arsivYukle(kod);
  const hedef = iso || o.sonTarih;
  const b = kurBul(a, hedef, turIdx);
  if (b.hata) return { tl: null, bilgi: b };
  return { tl: b.kur / (a.birim || 1), bilgi: b, arsiv: a };
}

export const turAdi = idx => (TURLER.find(t => t.idx === idx) || TURLER[0]).ad;
export function turSecenekleri(secili = 1) {
  return TURLER.map(t => `<option value="${t.idx}"${t.idx === secili ? ' selected' : ''}>${t.ad}</option>`).join('');
}
export const tarihAraligi = o => ({ min: o.ilkTarih, max: o.sonTarih });

export function kaynakSatiri(bilgi, o) {
  if (!bilgi || bilgi.hata) return '';
  return `Kaynak: TCMB ${turAdi(bilgi.tur).toLowerCase()} · bülten ${tarihYaz(bilgi.tarih)}`;
}
export const turetim = o => o.son.uretim;
