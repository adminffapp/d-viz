// Saatlik piyasa kuru katmanı. /data/saatlik.json'u okur (GitHub Actions saatte bir yazar).
// Bilerek bağımsız: başka modülden içe aktarma yapmaz, böylece tarayıcı önbelleğindeki eski modüllerle çakışmaz.
// Sayfadaki yer tutucular:
//   [data-piyasa="liste"]                     → popüler kurlar paneli
//   [data-piyasa="tek"][data-kod][data-birim] → tek para biriminin saatlik değeri (kur detay sayfası)
const ADLAR = { USD: 'Dolar', EUR: 'Euro', GBP: 'Sterlin', CHF: 'İsviçre frangı', JPY: 'Japon yeni', CAD: 'Kanada doları', AUD: 'Avustralya doları', SAR: 'Suudi riyali', AED: 'BAE dirhemi', CNY: 'Çin yuanı' };
const BIRIM = { JPY: 100 };
const BAYAT_SAAT = 3;
const YENILE_DK = 10;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kur = v => v == null ? '–' : v.toLocaleString('tr-TR', v >= 1 ? { minimumFractionDigits: 4, maximumFractionDigits: 4 } : { maximumSignificantDigits: 5 });
const IST = { timeZone: 'Europe/Istanbul' };
const gunAnahtar = d => new Intl.DateTimeFormat('en-CA', IST).format(d);
const saat = iso => {
  const d = new Date(iso), s = new Intl.DateTimeFormat('tr-TR', { ...IST, hour: '2-digit', minute: '2-digit' }).format(d);
  if (gunAnahtar(d) === gunAnahtar(new Date())) return 'bugün ' + s;
  if (gunAnahtar(d) === gunAnahtar(new Date(Date.now() - 864e5))) return 'dün ' + s;
  return new Intl.DateTimeFormat('tr-TR', { ...IST, day: 'numeric', month: 'short' }).format(d) + ' ' + s;
};
const kapali = (t = new Date()) => { const g = t.getUTCDay(), s = t.getUTCHours(); return g === 6 || (g === 0 && s < 21) || (g === 5 && s >= 22); };

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
/** Tazelik durumu: kaynak kesilirse eski değer "güncel" gibi gösterilmez. */
function durum(j) {
  const yas = (Date.now() - Date.parse(j.zaman)) / 3600e3;
  if (kapali()) return { sinif: 'kapali', metin: `Piyasa kapalı · son değer ${saat(j.zaman)}` };
  if (yas > BAYAT_SAAT) return { sinif: 'bayat', metin: `Son ${Math.floor(yas)} saattir güncellenemedi · son değer ${saat(j.zaman)}` };
  return { sinif: 'taze', metin: `Güncellendi ${saat(j.zaman)}` };
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
.pz-tek{margin-top:10px;padding-top:10px;border-top:1px dashed var(--cizgi);display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline}`;
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
<p class="pz-not">Saatte bir güncellenen piyasa ortalamasıdır (kaynak: ${esc(j.kaynak)}); değişim son 24 saate göredir. TCMB resmî gösterge kuru ve banka işlem kuru değildir. Hesaplayıcılar TCMB bültenini kullanır. <a href="/veri-kaynagi/#saatlik">Ayrıntı</a></p>
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

let sonZaman = null;
async function yukle() {
  const yerler = document.querySelectorAll('[data-piyasa]');
  if (!yerler.length) return;
  let j;
  try {
    const r = await fetch('/data/saatlik.json', { cache: 'no-cache' });
    if (!r.ok) return; // dosya henüz yoksa paneller gizli kalır
    j = await r.json();
  } catch { return; }
  if (!j || !j.kurlar || !j.zaman) return;
  if (j.zaman === sonZaman && yerler[0].hidden === false) { yerler.forEach(y => { const s = y.querySelector('.pz-durum'); if (s) { const d = durum(j); s.className = 'pz-durum ' + d.sinif; s.textContent = d.metin; } }); return; }
  sonZaman = j.zaman;
  stilEkle();
  yerler.forEach(y => (y.dataset.piyasa === 'tek' ? tekCiz : listeCiz)(y, j));
}
yukle();
setInterval(() => { if (document.visibilityState === 'visible') yukle(); }, YENILE_DK * 60e3);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') yukle(); });
