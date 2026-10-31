// Saatlik piyasa kuru gösterimi. Veri: saatlik-veri.js (/data/saatlik.json).
// Sayfadaki yer tutucular:
//   [data-piyasa="liste"]                                        → popüler kurlar paneli
//   [data-piyasa="tek"][data-kod][data-birim]                    → tek para biriminin saatlik değeri (kur sayfası)
//   [data-piyasa="cevir"][data-kod][data-tutar][data-yon]        → "50 dolar kaç TL" sonucu (yon: doviz-tl | tl-doviz)
//   [data-pz-tablo][data-kod][data-yon] içindeki [data-pz-tutar] → "Diğer tutarlar" tablosunun saatlik sütunu
import { saatlikYukle, durum, kullanilabilir } from './saatlik-veri.js';

const ADLAR = { USD: 'Dolar', EUR: 'Euro', GBP: 'Sterlin', CHF: 'İsviçre frangı', JPY: 'Japon yeni', CAD: 'Kanada doları', AUD: 'Avustralya doları', SAR: 'Suudi riyali', AED: 'BAE dirhemi', CNY: 'Çin yuanı' };
const BIRIM = { JPY: 100 };
const YENILE_DK = 10;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kur = v => v == null ? '–' : v.toLocaleString('tr-TR', v >= 1 ? { minimumFractionDigits: 4, maximumFractionDigits: 4 } : { maximumSignificantDigits: 5 });
const para = v => v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bin = n => Number(n).toLocaleString('tr-TR');

function degisim(p) {
  if (p == null) return '<span class="degisim sabit sayi">–</span>';
  const s = Math.abs(p) < 0.005 ? 0 : Math.sign(p);
  const sinif = s > 0 ? 'yuk' : s < 0 ? 'dus' : 'sabit';
  const ok = s > 0 ? 'M5 1l4.5 8h-9z' : s < 0 ? 'M5 9L.5 1h9z' : 'M1 4.5h8v1H1z';
  const ad = s > 0 ? 'yükseldi' : s < 0 ? 'düştü' : 'değişmedi';
  const metin = (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  return `<span class="degisim ${sinif} sayi"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="${ok}"/></svg><span class="gizli-okur">24 saatte ${ad} </span>${metin}</span>`;
}
function cizgi(dizi) {
  const d = (dizi || []).filter(v => v != null);
  if (d.length < 2) return '';
  const min = Math.min(...d), max = Math.max(...d), a = max - min || 1;
  const yol = d.map((v, i) => `${i ? 'L' : 'M'}${(1 + (i / (d.length - 1)) * 62).toFixed(1)},${(18 - ((v - min) / a) * 16).toFixed(1)}`).join('');
  const renk = d.at(-1) > d[0] ? 'var(--yuk)' : d.at(-1) < d[0] ? 'var(--dus)' : 'var(--soluk)';
  return `<svg class="pz-cizgi" viewBox="0 0 64 20" aria-hidden="true"><path d="${yol}" style="stroke:${renk}"/></svg>`;
}

function stilEkle() {
  if (document.getElementById('piyasa-stil')) return;
  const s = document.createElement('style');
  s.id = 'piyasa-stil';
  s.textContent = `[data-piyasa] .parca-baslik{flex-wrap:wrap}
.pz-izgara{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));list-style:none;margin:0;padding:0;overflow:hidden}
.pz-izgara li{padding:12px 16px;display:grid;grid-template-columns:1fr auto;gap:4px 8px;align-items:center;min-width:0;box-shadow:1px 0 0 var(--cizgi),0 1px 0 var(--cizgi)}
.pz-izgara .pz-ad{grid-column:1/-1;font-size:var(--t-kucuk);color:var(--soluk);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pz-izgara .pz-ad b{color:var(--yazi);margin-right:4px}
.pz-izgara .pz-deger{grid-column:1/-1;font-weight:600;font-size:1.125rem;white-space:nowrap}
.pz-cizgi{width:64px;height:20px}
.pz-cizgi path{fill:none;stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round}
.pz-durum{display:inline-flex;align-items:center;gap:6px;font-size:var(--t-kucuk);color:var(--soluk)}
.pz-durum::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--soluk)}
.pz-durum.taze::before{background:var(--yuk)}
.pz-durum.bayat{color:var(--uyari)}.pz-durum.bayat::before{background:var(--uyari)}
.pz-not{padding:12px 18px;font-size:var(--t-kucuk);color:var(--soluk);border-top:1px solid var(--cizgi)}
.pz-tek{margin-top:10px;padding-top:10px;border-top:1px dashed var(--cizgi);display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline}
.pz-cevir{margin-top:14px;padding-top:14px;border-top:1px dashed var(--cizgi)}
.pz-cevir .pz-buyuk{font-size:clamp(1.5rem,1.2rem + 1.4vw,2.25rem);font-weight:600;line-height:1.15;margin:4px 0 6px}
.pz-cevir .pz-alt{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;font-size:var(--t-kucuk);color:var(--soluk)}`;
  document.head.appendChild(s);
}

function listeCiz(kap, j) {
  const d = durum(j);
  const ogeler = Object.keys(ADLAR).filter(k => j.kurlar[k]).map(k => {
    const b = BIRIM[k] || 1;
    return `<li><span class="pz-ad"><b class="sayi">${b > 1 ? b + ' ' : ''}${k}</b>${esc(ADLAR[k])}</span><span class="pz-deger sayi">${kur(j.kurlar[k] * b)} ₺</span><span>${degisim(j.g24?.[k])}</span>${cizgi((j.seri?.[k] || []).map(v => v == null ? null : v * b))}</li>`;
  }).join('');
  kap.innerHTML = `<div class="parca">
<div class="parca-baslik"><h2 id="piyasa-b" style="font-size:var(--t-ust)">Saatlik piyasa kurları</h2><span class="pz-durum ${d.sinif}" role="status">${esc(d.metin)}</span></div>
<ul class="pz-izgara" aria-label="Saatlik piyasa kurları">${ogeler}</ul>
<p class="pz-not">Saatte bir güncellenen piyasa ortalamasıdır (kaynak: ${esc(j.kaynak)}); değişim son 24 saate göredir. TCMB resmî gösterge kuru ve banka işlem kuru değildir. Çevirici ve kur uyarıları bu kuru kullanır; geçmiş tarihli hesaplar ve grafikler TCMB bültenini kullanır. <a href="/veri-kaynagi/#saatlik">Ayrıntı</a></p>
</div>`;
  kap.hidden = false;
}

function tekCiz(kap, j) {
  const k = kap.dataset.kod, b = Number(kap.dataset.birim) || 1;
  const v = j.kurlar[k];
  if (v == null) { kap.hidden = true; return; }
  const d = durum(j);
  kap.classList.add('pz-tek');
  kap.innerHTML = `<span class="kucuk soluk">Saatlik piyasa kuru</span><b class="sayi">${b > 1 ? b + ' ' + k + ' = ' : ''}${kur(v * b)} ₺</b>${degisim(j.g24?.[k])}<span class="pz-durum ${d.sinif}">${esc(d.metin)}</span><a class="kucuk" href="/veri-kaynagi/#saatlik">TCMB kurundan farkı</a>`;
  kap.hidden = false;
}

function cevirCiz(kap, j) {
  const k = kap.dataset.kod, n = Number(kap.dataset.tutar), tl = j.kurlar[k];
  if (tl == null || !Number.isFinite(n) || !kullanilabilir(j)) { kap.hidden = true; return; }
  const d = durum(j);
  const dovizTl = kap.dataset.yon !== 'tl-doviz';
  const sonuc = dovizTl ? `${bin(n)} ${k} = ${para(n * tl)} ₺` : `${bin(n)} ₺ = ${para(n / tl)} ${k}`;
  kap.classList.add('pz-cevir');
  kap.innerHTML = `<span class="kucuk soluk">Şu an, saatlik piyasa kuruyla</span><p class="pz-buyuk sayi">${sonuc}</p><span class="pz-alt"><span class="sayi">1 ${k} = ${kur(tl)} ₺</span>${degisim(j.g24?.[k])}<span class="pz-durum ${d.sinif}">${esc(d.metin)}</span><a href="/veri-kaynagi/#saatlik">TCMB kurundan farkı</a></span>`;
  kap.hidden = false;
}

function tabloCiz(tablo, j) {
  const k = tablo.dataset.kod, tl = j.kurlar[k];
  if (tl == null || !kullanilabilir(j)) { tablo.querySelectorAll('[data-pz-baslik],[data-pz-tutar]').forEach(h => { h.hidden = true; }); return; }
  const dovizTl = tablo.dataset.yon !== 'tl-doviz';
  tablo.querySelectorAll('[data-pz-tutar]').forEach(h => {
    const n = Number(h.dataset.pzTutar);
    h.textContent = dovizTl ? `${para(n * tl)} ₺` : `${para(n / tl)} ${k}`;
  });
  tablo.querySelectorAll('[data-pz-baslik]').forEach(h => { h.hidden = false; });
  tablo.querySelectorAll('[data-pz-tutar]').forEach(h => { h.hidden = false; });
}

let sonZaman = null;
async function yukle(yenile = false) {
  const yerler = document.querySelectorAll('[data-piyasa]');
  const tablolar = document.querySelectorAll('[data-pz-tablo]');
  if (!yerler.length && !tablolar.length) return;
  const j = await saatlikYukle({ yenile });
  if (!j) return; // dosya yoksa yer tutucular gizli kalır
  if (j.zaman === sonZaman) { yerler.forEach(y => { const s = y.querySelector('.pz-durum'); if (s) { const d = durum(j); s.className = 'pz-durum ' + d.sinif; s.textContent = d.metin; } }); return; }
  sonZaman = j.zaman;
  stilEkle();
  const ciz = { liste: listeCiz, tek: tekCiz, cevir: cevirCiz };
  yerler.forEach(y => (ciz[y.dataset.piyasa] || listeCiz)(y, j));
  tablolar.forEach(t => tabloCiz(t, j));
}
yukle();
setInterval(() => { if (document.visibilityState === 'visible') yukle(true); }, YENILE_DK * 60e3);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') yukle(true); });
