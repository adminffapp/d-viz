// Kur tablosu satırı: hem derleme sırasında (Node) hem tarayıcıda aynı HTML'i üretir. DOM kullanmaz.
import { kurYaz, yuzdeYaz, isaret } from './hesap.js';
import { sparkYol } from './grafik-saf.js';

const k = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const OK = { yuk: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1l4.5 8h-9z"/></svg>', dus: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 9L.5 1h9z"/></svg>', sabit: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 4.5h8v1H1z"/></svg>' };
export const degisimHTML = p => {
  const s = isaret(p);
  const sinif = s > 0 ? 'yuk' : s < 0 ? 'dus' : 'sabit';
  const ad = s > 0 ? 'yükseldi' : s < 0 ? 'düştü' : 'değişmedi';
  return `<span class="degisim ${sinif} sayi">${OK[sinif]}<span class="gizli-okur">${ad} </span>${k(yuzdeYaz(p))}</span>`;
};
const FAV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.9l6-.9z"/></svg>';

/** m: meta satırı, r: son.kurlar[kod] = [db,ds,eb,es], oz: ozet[kod] */
export function satirHTML(m, r, oz, { fav = false } = {}) {
  if (!r) return '';
  const p = oz ? oz.g1 : null;
  const sinif = isaret(oz?.g30) > 0 ? 'yuk' : isaret(oz?.g30) < 0 ? 'dus' : 'sabit';
  const renk = sinif === 'yuk' ? 'var(--yuk)' : sinif === 'dus' ? 'var(--dus)' : 'var(--soluk)';
  const birimNot = m.birim > 1 ? `${m.birim} ${m.kod} için` : m.kisa;
  return `<tr data-kod="${m.kod}" data-ad="${k(m.ad)}" data-slug="${m.slug}" data-deger="${r[0] / m.birim}" data-degisim="${p ?? ''}" data-sira="${m.sira}">
<td><span class="kur-ad"><span class="kod">${m.kod}</span><span class="metin"><a class="ad" href="/kur/${m.slug}/">${k(m.ad)}</a><small>${k(birimNot)}</small></span></span></td>
<td class="sayi">${k(kurYaz(r[0]))}</td>
<td class="sayi gizle-mobil">${k(kurYaz(r[1]))}</td>
<td>${degisimHTML(p)}</td>
<td class="gizle-mobil"><svg class="spark" viewBox="0 0 96 28" role="img" aria-label="Son 30 bülten çizgisi"><path d="${sparkYol(oz ? oz.spark : [])}" style="stroke:${renk}"/></svg></td>
<td><button class="fav" type="button" aria-pressed="${fav}" aria-label="${k(m.ad)} favorilere ${fav ? 'çıkar' : 'ekle'}" data-fav="${m.kod}">${FAV}</button></td>
</tr>`;
}
export const TABLO_BASLIK = `<thead><tr>
<th scope="col" aria-sort="none"><button type="button" data-sirala="ad">Para birimi</button></th>
<th scope="col" aria-sort="none"><button type="button" data-sirala="deger">Alış (₺)</button></th>
<th scope="col" class="gizle-mobil">Satış (₺)</th>
<th scope="col" aria-sort="none"><button type="button" data-sirala="degisim">Değişim</button></th>
<th scope="col" class="gizle-mobil">30 bülten</th>
<th scope="col"><span class="gizli-okur">Favori</span></th></tr></thead>`;
