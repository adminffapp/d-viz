// Etkileşimli kur tablosu: arama, sıralama, popüler/tümü/favoriler, favori yıldızı, satır tıklama.
import { $, $$, depo, gecikme } from './ui.js';
import { ortam } from './ortak.js';
import { ozetYukle } from './veri.js';
import { favoriler } from './kisisel.js';
import { satirHTML } from './kur-satir.js';
import { tarihYaz } from './hesap.js';

export const norm = s => String(s).toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');

export async function kurTablo(kok, { gorunum = 'populer' } = {}) {
  const [o, oz] = await Promise.all([ortam(), ozetYukle()]);
  const tbody = $('tbody', kok), ara = $('[type=search]', kok);
  const gorunumDugmeleri = $$('[data-gorunum]', kok);
  let sirala = depo.oku('tablo-sirala', { alan: 'sira', yon: 1 });
  let aktif = gorunum;
  const meta = [...o.meta];

  function ciz() {
    const fav = new Set(favoriler.oku());
    tbody.innerHTML = meta.map(m => satirHTML(m, o.son.kurlar[m.kod], oz.ozet[m.kod], { fav: fav.has(m.kod) })).join('');
    tbody.insertAdjacentHTML('beforeend', `<tr class="bos-satir" hidden><td colspan="6" class="bos"><strong>Eşleşen para birimi yok</strong>Aramayı kısaltın ya da “Tümü” görünümüne geçin.</td></tr>`);
    uygula();
  }
  function uygula() {
    const q = norm(ara.value.trim());
    const fav = new Set(favoriler.oku());
    const satirlar = $$('tr[data-kod]', tbody);
    const anahtar = { ad: r => r.dataset.ad, deger: r => Number(r.dataset.deger), degisim: r => (r.dataset.degisim === '' ? -Infinity : Number(r.dataset.degisim)), sira: r => Number(r.dataset.sira) }[sirala.alan];
    satirlar.sort((a, b) => {
      const x = anahtar(a), y = anahtar(b);
      const c = typeof x === 'string' ? x.localeCompare(y, 'tr') : x - y;
      return c * sirala.yon || Number(a.dataset.sira) - Number(b.dataset.sira);
    });
    let goster = 0;
    for (const r of satirlar) {
      const m = o.birim[r.dataset.kod];
      const eslesir = !q || [m.kod, m.ad, m.kisa, m.slug].some(s => norm(s).includes(q));
      const gorunur = eslesir && (q ? true : aktif === 'tum' || (aktif === 'populer' && m.populer) || (aktif === 'favori' && fav.has(m.kod)));
      r.hidden = !gorunur; if (gorunur) goster++;
      tbody.insertBefore(r, $('.bos-satir', tbody));
    }
    const bos = $('.bos-satir', tbody);
    bos.hidden = goster > 0;
    if (!goster && aktif === 'favori' && !q) bos.innerHTML = '<td colspan="6" class="bos"><strong>Henüz favoriniz yok</strong>Yıldız simgesine basarak para birimi ekleyin.</td>';
    gorunumDugmeleri.forEach(b => b.setAttribute('aria-pressed', b.dataset.gorunum === aktif));
    $$('thead th', kok).forEach(th => { const b = $('[data-sirala]', th); if (b) th.setAttribute('aria-sort', b.dataset.sirala === sirala.alan ? (sirala.yon > 0 ? 'ascending' : 'descending') : 'none'); });
    const sayac = $('[data-sayac]', kok); if (sayac) sayac.textContent = `${goster} para birimi gösteriliyor`;
  }
  ara.addEventListener('input', gecikme(uygula, 80));
  gorunumDugmeleri.forEach(b => b.addEventListener('click', () => { aktif = b.dataset.gorunum; ara.value = ''; uygula(); }));
  kok.addEventListener('click', e => {
    const s = e.target.closest('[data-sirala]');
    if (s) { const alan = s.dataset.sirala; sirala = { alan, yon: sirala.alan === alan ? -sirala.yon : (alan === 'ad' ? 1 : -1) }; depo.yaz('tablo-sirala', sirala); uygula(); return; }
    const f = e.target.closest('[data-fav]');
    if (f) {
      const acik = favoriler.degistir(f.dataset.fav);
      f.setAttribute('aria-pressed', acik);
      f.setAttribute('aria-label', `${o.birim[f.dataset.fav].ad} favorilere ${acik ? 'çıkar' : 'ekle'}`);
      if (aktif === 'favori') uygula();
      return;
    }
    const satir = e.target.closest('tr[data-kod]');
    if (satir && !e.target.closest('a,button')) location.href = `/kur/${satir.dataset.slug}/`;
  });
  window.addEventListener('favori-degisti', () => { if (aktif === 'favori') uygula(); });
  const bilgi = $('[data-kaynak]', kok);
  if (bilgi) {
    const g = new Date(o.son.uretim);
    const yerel = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(g);
    bilgi.innerHTML = `<span>Kaynak: <a href="/veri-kaynagi/">TCMB gösterge niteliğindeki döviz kurları</a></span><span>Bülten tarihi: <b class="sayi">${tarihYaz(o.son.tarih, { gun: true })}</b></span><span>Siteye alındı: <span class="sayi">${yerel}</span></span><span>Değişim: bir önceki bültene göre</span>`;
  }
  ciz();
}
