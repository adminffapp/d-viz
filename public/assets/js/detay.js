// Kur detay sayfası: grafik, istatistik, geçmiş tablo, mini çevirici, favori, CSV, rapor.
import { $, $$, kacis, indir, depo, toast, olay } from './ui.js';
import { ortam } from './ortak.js';
import { arsivYukle } from './veri.js';
import { grafik } from './grafik.js';
import { degisimHTML } from './kur-satir.js';
import { favoriler } from './kisisel.js';
import { sayiYaz, sayiSerbest, kurYaz, yuzdeYaz, tarihYaz, aralikBaslangic, aralikSatirlari, indirge, istatistik, csvUret, tutarOku, yuzdeDegisim, isaret, TURLER } from './hesap.js';

export async function detay(kok) {
  const kod = kok.dataset.kod;
  const [o, arsiv] = await Promise.all([ortam(), arsivYukle(kod)]);
  const m = o.birim[kod], birim = arsiv.birim || 1;
  const son = o.son.kurlar[kod], onceki = o.son.oncekiKurlar[kod];

  // güncel değer paneli
  const ad = ['Döviz alış', 'Döviz satış', 'Efektif alış', 'Efektif satış'];
  $('.guncel-tablo', kok).innerHTML = ad.map((a, i) => {
    const d = son?.[i], p = onceki?.[i];
    return `<tr><th scope="row">${a}</th><td class="sayi">${d == null ? '—' : kurYaz(d)}</td><td class="sayi gizle-mobil">${p == null ? '—' : kurYaz(p)}</td><td>${d == null || p == null ? '—' : degisimHTML(yuzdeDegisim(d, p))}</td></tr>`;
  }).join('');
  $('.guncel-buyuk', kok).textContent = son ? kurYaz(son[0]) + ' ₺' : '—';
  $('.guncel-not', kok).textContent = `${birim > 1 ? birim + ' ' + kod : '1 ' + kod} · TCMB döviz alış · bülten ${tarihYaz(o.son.tarih, { gun: true })}`;
  if (son && onceki) $('.guncel-degisim', kok).innerHTML = degisimHTML(yuzdeDegisim(son[0], onceki[0])) + `<span class="kucuk soluk">önceki bülten ${tarihYaz(o.son.onceki, { kisa: true })}</span>`;

  // favori
  const fav = $('[data-fav]', kok);
  const favGuncelle = () => { const a = favoriler.var(kod); fav.setAttribute('aria-pressed', a); fav.querySelector('.metin').textContent = a ? 'Favorilerde' : 'Favorilere ekle'; };
  fav.addEventListener('click', () => { favoriler.degistir(kod); favGuncelle(); });
  favGuncelle();

  // grafik
  let aralik = '90g', seriSecim = { alis: true, satis: false };
  const g = grafik($('.g', kok), { seriler: [], yaz: v => sayiYaz(v, birim > 1 ? 4 : 4), yEksenYaz: v => sayiYaz(v, v < 1 ? 4 : 2), yukseklik: 320 });
  let aktifSatirlar = [];
  function ciz() {
    const bas = aralikBaslangic(aralik, o.sonTarih, arsiv.ilk || arsiv.gunler[0][0]);
    const satirlar = aralikSatirlari(arsiv.gunler, bas, o.sonTarih);
    aktifSatirlar = satirlar;
    const n = indirge(satirlar, 1, 420);
    const seriler = [];
    if (seriSecim.alis) seriler.push({ ad: 'Alış', renk: 'var(--seri1)', noktalar: n.filter(r => r[1] != null).map(r => [r[0], r[1]]) });
    if (seriSecim.satis) seriler.push({ ad: 'Satış', renk: 'var(--seri2)', noktalar: n.filter(r => r[2] != null).map(r => [r[0], r[2]]) });
    if (!seriler.length) { seriSecim.alis = true; $('[data-seri=alis]', kok).checked = true; return ciz(); }
    g.guncelle(seriler, m.ad);
    const s = istatistik(satirlar, 1);
    if (s) {
      const yuk = isaret(s.yuzde);
      $('.istat', kok).innerHTML = `
        <div><dt>Dönem değişimi</dt><dd class="sayi">${degisimHTML(s.yuzde)}<small>${s.fark >= 0 ? '+' : '−'}${sayiYaz(Math.abs(s.fark), 4)} ₺</small></dd></div>
        <div><dt>En yüksek</dt><dd class="sayi">${kurYaz(s.max)}<small>${tarihYaz(s.maxTarih)}</small></dd></div>
        <div><dt>En düşük</dt><dd class="sayi">${kurYaz(s.min)}<small>${tarihYaz(s.minTarih)}</small></dd></div>
        <div><dt>Dönem ortalaması</dt><dd class="sayi">${kurYaz(s.ortalama)}<small>${s.n} bülten</small></dd></div>
        <div><dt>İlk → son</dt><dd class="sayi" style="font-size:1rem">${kurYaz(s.ilk)} → ${kurYaz(s.son)}<small>${tarihYaz(s.ilkTarih, { kisa: true })} – ${tarihYaz(s.sonTarih, { kisa: true })}</small></dd></div>`;
    }
    tabloSifirla();
  }
  $$('[data-aralik]', kok).forEach(b => b.addEventListener('click', () => { aralik = b.dataset.aralik; $$('[data-aralik]', kok).forEach(x => x.setAttribute('aria-pressed', x === b)); ciz(); }));
  $$('[data-seri]', kok).forEach(c => c.addEventListener('change', () => { seriSecim[c.dataset.seri] = c.checked; ciz(); }));

  // tablo
  let gosterilen = 0;
  const tbody = $('.tablo-govde', kok), daha = $('[data-daha]', kok);
  function tabloSifirla() { tbody.innerHTML = ''; gosterilen = 0; tabloEkle(30); }
  function tabloEkle(n) {
    const rows = [...aktifSatirlar].reverse();
    const parca = rows.slice(gosterilen, gosterilen + n);
    tbody.insertAdjacentHTML('beforeend', parca.map((r, i) => {
      const onc = rows[gosterilen + i + 1];
      const d = onc && onc[1] ? yuzdeDegisim(r[1], onc[1]) : null;
      return `<tr><td>${tarihYaz(r[0], { gun: true })}</td>${[1, 2, 3, 4].map(k => `<td class="sayi${k > 2 ? ' gizle-mobil' : ''}">${r[k] == null ? '—' : kurYaz(r[k])}</td>`).join('')}<td class="sayi">${d == null ? '—' : yuzdeYaz(d)}</td></tr>`;
    }).join(''));
    gosterilen += parca.length;
    daha.hidden = gosterilen >= rows.length;
    $('.tablo-bilgi', kok).textContent = `${Math.min(gosterilen, rows.length)} / ${rows.length} bülten`;
  }
  daha.addEventListener('click', () => tabloEkle(90));

  // CSV + rapor
  $('[data-csv]', kok).addEventListener('click', () => {
    indir(`kur-${kod}-${aktifSatirlar[0][0]}_${aktifSatirlar.at(-1)[0]}.csv`, csvUret(['Tarih', 'Döviz alış', 'Döviz satış', 'Efektif alış', 'Efektif satış', 'Birim', 'Kaynak'], aktifSatirlar.map(r => [r[0], r[1], r[2], r[3], r[4], birim, 'TCMB'])));
    olay('csv', { kod });
  });
  $('[data-rapor]', kok).addEventListener('click', () => {
    const s = istatistik(aktifSatirlar, 1);
    depo.yaz('rapor', { tur: 'kur', baslik: `${m.ad} (${kod}/TL) kur raporu`, veriTarihi: o.sonTarih, uretim: o.son.uretim, ornek: !!o.son.ornek,
      ozet: [['Para birimi', `${m.ad} · ${kod}`], ['Güncel döviz alış', `${kurYaz(son[0])} ₺${birim > 1 ? ` (${birim} ${kod})` : ''}`], ['Dönem', `${tarihYaz(s.ilkTarih)} – ${tarihYaz(s.sonTarih)}`], ['Dönem değişimi', yuzdeYaz(s.yuzde)], ['En yüksek', `${kurYaz(s.max)} (${tarihYaz(s.maxTarih, { kisa: true })})`], ['En düşük', `${kurYaz(s.min)} (${tarihYaz(s.minTarih, { kisa: true })})`], ['Ortalama', kurYaz(s.ortalama)]],
      grafik: { baslik: `${kod}/TL döviz alış`, noktalar: indirge(aktifSatirlar, 1, 120).filter(r => r[1] != null).map(r => [r[0], r[1]]) },
      tablo: { baslik: ['Tarih', 'Döviz alış', 'Döviz satış'], satirlar: [...aktifSatirlar].reverse().slice(0, 15).map(r => [tarihYaz(r[0], { kisa: true }), r[1] == null ? '—' : kurYaz(r[1]), r[2] == null ? '—' : kurYaz(r[2])]) } });
    location.href = '/rapor/';
  });

  // mini çevirici
  const mt = $('[name=mt]', kok), mk = $('.mini-cikti', kok);
  const mc = () => {
    const t = tutarOku(mt.value);
    if (t == null || t < 0) { mk.innerHTML = '<li class="soluk">Geçerli bir tutar yazın</li>'; return; }
    const tl = son[0] / birim;
    mk.innerHTML = `<li><span>${sayiSerbest(t, 2)} ${kod}</span><span class="sayi"><b>${sayiYaz(t * tl, 2)}</b> ₺</span></li><li><span>${sayiSerbest(t, 2)} ₺</span><span class="sayi"><b>${sayiYaz(t / tl, 4)}</b> ${kod}</span></li>`;
  };
  mt.addEventListener('input', mc); mc();
  ciz();
}
