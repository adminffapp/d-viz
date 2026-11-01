// Saatlik piyasa kuru: sitedeki MEVCUT kur gösterimlerine bağlanır (ayrı panel yok).
// Statik HTML TCMB değerleriyle gelir (arama motoru ve JavaScript'siz kullanım için);
// saatlik veri kullanılabilirse aşağıdaki yerlerdeki değer, değişim ve çizgi saatlik veriyle değişir:
//   table.kur satırları (/kurlar/)            → tr[data-kod][data-birim]
//   .hero-liste (ana sayfa popüler kurlar)    → a[data-pz-kod][data-birim]
//   [data-piyasa="cevir"] (kaç TL sayfaları)  → aynı kartın .sonuc-buyuk/.sonuc-alt alanları, [data-pz-giris]
//   [data-pz-tablo] içindeki [data-pz-tutar]  → "Diğer tutarlar" tablosu
// Kur detay sayfası detay.js içinde aynı veriyi kullanır. Veri yoksa ya da bayatsa TCMB değeri kalır.
import { saatlikYukle, durum, kullanilabilir } from './saatlik-veri.js';
import { sparkYol } from './grafik-saf.js';

const YENILE_DK = 10;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kur = v => v.toLocaleString('tr-TR', v >= 1 ? { minimumFractionDigits: 4, maximumFractionDigits: 4 } : { maximumSignificantDigits: 5 });
const para = v => v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bin = n => Number(n).toLocaleString('tr-TR');
const NOT = 'Piyasa ortalaması, TCMB resmî kuru değildir.';

function degisim(p) {
  const s = Math.abs(p) < 0.005 ? 0 : Math.sign(p);
  const sinif = s > 0 ? 'yuk' : s < 0 ? 'dus' : 'sabit';
  const ok = s > 0 ? 'M5 1l4.5 8h-9z' : s < 0 ? 'M5 9L.5 1h9z' : 'M1 4.5h8v1H1z';
  const ad = s > 0 ? 'yükseldi' : s < 0 ? 'düştü' : 'değişmedi';
  const metin = (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  return `<span class="degisim ${sinif} sayi"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="${ok}"/></svg><span class="gizli-okur">24 saatte ${ad} </span>${metin}</span>`;
}

function stilEkle() {
  if (document.getElementById('piyasa-stil')) return;
  const s = document.createElement('style');
  s.id = 'piyasa-stil';
  s.textContent = `.pz-not{margin:10px 2px 0;font-size:var(--t-kucuk);color:var(--soluk)}
.pz-not .pz-nokta{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--soluk);margin-right:6px}
.pz-not.taze .pz-nokta{background:var(--yuk)}.pz-not.bayat{color:var(--uyari)}.pz-not.bayat .pz-nokta{background:var(--uyari)}
table.kur.pz-aktif .pz-satis{display:none}
.hero-liste.pz-aktif a,.hero-liste.pz-aktif .hero-liste-baslik{grid-template-columns:3.2rem 1fr 7.4rem 5rem}
.hero-liste.pz-aktif .pz-satis,.hero-liste.pz-aktif .pz-satis-b{display:none}
@media (max-width:520px){.hero-liste.pz-aktif a,.hero-liste.pz-aktif .hero-liste-baslik{grid-template-columns:2.6rem minmax(0,1fr) auto}}`;
  document.head.appendChild(s);
}

const g24Var = j => Object.values(j.g24 || {}).some(v => v != null);
function notYaz(yer, j, sinif, metin) {
  let p = yer.querySelector(':scope > .pz-not');
  if (!p) { p = document.createElement('p'); p.className = 'pz-not'; yer.appendChild(p); }
  p.className = 'pz-not ' + sinif;
  p.innerHTML = `<span class="pz-nokta" aria-hidden="true"></span>${esc(metin)} · Saatte bir güncellenen piyasa ortalaması (kaynak: ${esc(j.kaynak)}); ${g24Var(j) ? 'değişim son 24 saate göredir' : '24 saatlik değişim birikiyor; şimdilik değişim son TCMB bültenine göredir'}. TCMB resmî kuru değildir. <a href="/veri-kaynagi/">Veri kaynağı</a>`;
}

/* /kurlar/ tablosu */
function tabloUygula(tablo, j) {
  const d = durum(j);
  tablo.classList.add('pz-aktif');
  const bas = tablo.querySelector('[data-sirala="deger"]'); if (bas) bas.textContent = 'Kur (₺)';
  const sb = tablo.querySelector('.pz-spark-baslik'); if (sb && Object.values(j.seri || {}).some(a => a?.filter(x => x != null).length > 1)) sb.textContent = 'Son 24 saat';
  tablo.querySelectorAll('tbody tr[data-kod]').forEach(tr => {
    const k = tr.dataset.kod, v = j.kurlar[k], b = Number(tr.dataset.birim) || 1;
    if (v == null) return;
    const alis = tr.querySelector('.pz-alis'); if (alis) alis.textContent = kur(v * b);
    tr.dataset.deger = String(v);
    const g = j.g24?.[k], dc = tr.querySelector('.pz-degisim');
    if (dc) { dc._o ??= dc.innerHTML; if (g != null) { dc.innerHTML = degisim(g); tr.dataset.degisim = String(g); } else dc.innerHTML = dc._o; }
    const seri = (j.seri?.[k] || []).filter(x => x != null), sp = tr.querySelector('.pz-spark svg');
    if (sp && seri.length > 1) {
      sp.querySelector('path').setAttribute('d', sparkYol(seri));
      sp.querySelector('path').style.stroke = seri.at(-1) > seri[0] ? 'var(--yuk)' : seri.at(-1) < seri[0] ? 'var(--dus)' : 'var(--soluk)';
      sp.setAttribute('aria-label', 'Son 24 saat çizgisi');
    }
  });
  const kap = tablo.closest('.kur-tablo-kap') || tablo.parentElement;
  notYaz(kap.parentElement, j, d.sinif, d.metin);
  const eski = kap.parentElement.querySelectorAll(':scope > .pz-not'); // tek not
  if (eski.length > 1) [...eski].slice(0, -1).forEach(x => x.remove());
}
const gozlenen = new WeakSet();
function tabloKur(tablo) {
  if (gozlenen.has(tablo)) return; gozlenen.add(tablo);
  const tb = tablo.querySelector('tbody'); if (!tb) return;
  let kilit = false;
  new MutationObserver(() => { if (kilit || !SON || !kullanilabilir(SON)) return; kilit = true; try { tabloUygula(tablo, SON); } finally { setTimeout(() => { kilit = false; }, 0); } }).observe(tb, { childList: true });
}

/* ana sayfa popüler kurlar */
function heroUygula(liste, j) {
  const d = durum(j);
  liste.classList.add('pz-aktif');
  const ab = liste.querySelector('.pz-alis-b'); if (ab) ab.textContent = 'Kur ₺';
  const gb = liste.querySelector('.pz-gun-b'); if (gb && g24Var(j)) gb.textContent = '24 saat';
  liste.querySelectorAll('a[data-pz-kod]').forEach(a => {
    const k = a.dataset.pzKod, v = j.kurlar[k], b = Number(a.dataset.birim) || 1;
    if (v == null) return;
    const alis = a.querySelector('.pz-alis'); if (alis) alis.textContent = kur(v * b);
    const g = j.g24?.[k], dc = a.querySelector('.pz-degisim');
    if (dc) { dc._o ??= dc.innerHTML; dc.innerHTML = g != null ? degisim(g) : dc._o; }
  });
  notYaz(liste.parentElement, j, d.sinif, d.metin);
}

/* "kaç TL" sonucu: aynı kartın büyük tutarı ve alt satırı saatlik kurla yazılır */
function cevirUygula(kap, j) {
  const k = kap.dataset.kod, n = Number(kap.dataset.tutar), tl = j.kurlar[k];
  if (tl == null || !Number.isFinite(n)) return;
  const d = durum(j), parca = kap.closest('.parca-ic') || kap.parentElement;
  const sonuc = kap.dataset.yon !== 'tl-doviz' ? `${bin(n)} ${k} = ${para(n * tl)} ₺` : `${bin(n)} ₺ = ${para(n / tl)} ${k}`;
  const buyuk = parca.querySelector('.sonuc-buyuk'), alt = parca.querySelector('.sonuc-alt');
  if (buyuk) buyuk.textContent = sonuc;
  if (alt) alt.innerHTML = `1 ${k} = ${esc(kur(tl))} ₺ · ${esc(d.metin)} · ${NOT}`;
  document.querySelectorAll('[data-pz-giris]').forEach(g => { g.textContent = `${sonuc} (saatlik piyasa kuru · ${d.metin}).`; });
}
function tutarTablo(tablo, j) {
  const k = tablo.dataset.kod, tl = j.kurlar[k];
  if (tl == null) return;
  const dovizTl = tablo.dataset.yon !== 'tl-doviz';
  tablo.querySelectorAll('[data-pz-tutar]').forEach(h => {
    const n = Number(h.dataset.pzTutar);
    h.textContent = dovizTl ? `${para(n * tl)} ₺` : `${para(n / tl)} ${k}`;
  });
}

let SON = null;
function hepsiniUygula(j) {
  if (!kullanilabilir(j)) return;
  stilEkle();
  document.querySelectorAll('table.kur').forEach(t => { tabloUygula(t, j); tabloKur(t); });
  document.querySelectorAll('.hero-liste').forEach(l => heroUygula(l, j));
  document.querySelectorAll('[data-piyasa="cevir"]').forEach(c => cevirUygula(c, j));
  document.querySelectorAll('[data-pz-tablo]').forEach(t => tutarTablo(t, j));
}
async function yukle(yenile = false) {
  const j = await saatlikYukle({ yenile });
  if (!j) return; // dosya yoksa TCMB değerleri kalır
  SON = j;
  hepsiniUygula(j);
}
yukle();
setInterval(() => { if (document.visibilityState === 'visible') yukle(true); }, YENILE_DK * 60e3);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') yukle(true); });
