// Geçmiş tarihli kur hesabı: iki tarih, iki yön, nominal ve yüzde değişim, grafik, tablo, CSV, rapor.
import { $, $$, kacis, kopyala, paylas, sorgu, sorguYaz, olay, depo, indir } from './ui.js';
import { ortam, paraSecenekleri, tlKuru, turSecenekleri, turAdi } from './ortak.js';
import { arsivYukle } from './veri.js';
import { grafik } from './grafik.js';
import { degisimHTML } from './kur-satir.js';
import { tutarOku, sayiYaz, sayiSerbest, kurYaz, yuzdeDegisim, yuzdeYaz, tarihYaz, nedenMetni, aralikSatirlari, indirge, csvUret, isoGecerli, gunEkle } from './hesap.js';
import { gecmis as gecmisDepo } from './kisisel.js';

export async function gecmis(kok) {
  const o = await ortam();
  const f = n => $(`[name=${n}]`, kok);
  const [yonS, tutar, kod, t1, t2, tur] = ['yon', 'tutar', 'kod', 'tarih1', 'tarih2', 'tur'].map(f);
  const q = sorgu();
  kod.innerHTML = paraSecenekleri(o, q.kod || 'USD', { tl: false });
  tur.innerHTML = turSecenekleri(Number(q.tur) || 1);
  [t1, t2].forEach(t => { t.min = o.ilkTarih; t.max = o.sonTarih; });
  t1.value = isoGecerli(q.tarih) ? q.tarih : gunEkle(o.sonTarih, -365);
  t2.value = isoGecerli(q.tarih2) ? q.tarih2 : o.sonTarih;
  if (q.tutar) tutar.value = q.tutar; if (q.yon) yonS.value = q.yon;
  const g = grafik($('.g', kok), { seriler: [], yaz: v => sayiYaz(v, 4), yukseklik: 280 });

  async function hesapla() {
    const err = $('.hata-metni', kok); err.textContent = '';
    [tutar, t1, t2].forEach(x => x.removeAttribute('aria-invalid'));
    const t = tutarOku(tutar.value);
    if (t == null || t <= 0) { tutar.setAttribute('aria-invalid', 'true'); err.textContent = 'Geçerli bir tutar yazın.'; return; }
    for (const x of [t1, t2]) if (!isoGecerli(x.value) || x.value < o.ilkTarih || x.value > o.sonTarih) { x.setAttribute('aria-invalid', 'true'); err.textContent = `Tarih ${tarihYaz(o.ilkTarih, { kisa: true })} ile ${tarihYaz(o.sonTarih, { kisa: true })} arasında olmalı. Arşiv bu tarihten başlıyor.`; return; }
    let [a, b] = [t1.value, t2.value]; let degisti = false;
    if (a > b) { [a, b] = [b, a]; degisti = true; }
    const turIdx = Number(tur.value), yon = yonS.value;
    const [r1, r2] = await Promise.all([tlKuru(o, kod.value, a, turIdx), tlKuru(o, kod.value, b, turIdx)]);
    if (r1.bilgi.hata || r2.bilgi.hata) { err.textContent = 'Bu tarihler için kur bulunamadı.'; return; }
    const kod_ = kod.value;
    const v1 = yon === 'doviz' ? t * r1.tl : t / r1.tl, v2 = yon === 'doviz' ? t * r2.tl : t / r2.tl;
    const birimEt = yon === 'doviz' ? '₺' : kod_;
    const fark = v2 - v1, yuzde = yuzdeDegisim(v2, v1);
    const kutu = (r, v, etiket) => `<div><p class="et">${etiket}</p><p class="buyuk sayi">${sayiYaz(v, 2)} ${birimEt}</p><p class="et sayi">1 ${kod_} = ${kurYaz(r.tl)} ₺</p><p class="et">${tarihYaz(r.bilgi.tarih, { gun: true })} bülteni</p></div>`;
    $('.sonuc-iki', kok).innerHTML = kutu(r1, v1, a === t1.value ? 'Başlangıç' : 'İlk tarih') + kutu(r2, v2, 'Bitiş');
    const isaretli = (fark >= 0 ? '+' : '−') + sayiSerbest(Math.abs(fark), 2) + ' ' + birimEt;
    $('.fark-satir', kok).innerHTML = `${degisimHTML(yuzde)}<span class="sayi"><b>${isaretli}</b></span>`;
    $('.cumle', kok).textContent = yon === 'doviz'
      ? `${sayiSerbest(t, 2)} ${kod_} tutarının TL karşılığı, ${tarihYaz(a)} ile ${tarihYaz(b)} arasında ${sayiYaz(Math.abs(fark), 2)} ₺ ${fark >= 0 ? 'arttı' : 'azaldı'} (${sayiYaz(v1, 2)} ₺ → ${sayiYaz(v2, 2)} ₺).`
      : `${sayiSerbest(t, 2)} ₺ ile ${tarihYaz(a)} tarihinde ${sayiYaz(v1, 2)} ${kod_} alınabilirdi; ${tarihYaz(b)} tarihinde ${sayiYaz(v2, 2)} ${kod_} alınabilir. TL'nin ${kod_} karşısındaki değeri ${yuzdeYaz(yuzde)} değişti.`;
    const notlar = [degisti ? 'Tarihler sıraya konuldu.' : '', nedenMetni(r1.bilgi), nedenMetni(r2.bilgi), r1.bilgi.turDegisti ? 'Seçilen kur türü bu para biriminde yayımlanmıyor; Döviz alış kullanıldı.' : ''].filter(Boolean);
    const nk = $('.notlar', kok); nk.hidden = !notlar.length; nk.innerHTML = notlar.map(n => `<p>${kacis(n)}</p>`).join('');
    $('.kaynak-satir', kok).textContent = `Kaynak: TCMB ${turAdi(r1.bilgi.tur).toLowerCase()} · bülten tarihleri ${tarihYaz(r1.bilgi.tarih, { kisa: true })} ve ${tarihYaz(r2.bilgi.tarih, { kisa: true })}`;
    // grafik + tablo
    const arsiv = r1.arsiv || await arsivYukle(kod_);
    const satirlar = aralikSatirlari(arsiv.gunler, a, b);
    const idx = r1.bilgi.tur;
    g.guncelle([{ ad: kod_ + '/TL', renk: 'var(--seri1)', noktalar: indirge(satirlar, idx, 360).filter(r => r[idx] != null).map(r => [r[0], r[idx] / (arsiv.birim || 1)]) }], o.birim[kod_].ad);
    $('.tablo-govde', kok).innerHTML = [...satirlar].reverse().slice(0, 400).map(r => `<tr><td>${tarihYaz(r[0], { gun: true })}</td><td class="sayi">${r[idx] == null ? '—' : sayiYaz(r[idx], 4)}</td></tr>`).join('');
    $('.tablo-bilgi', kok).textContent = `${satirlar.length} bülten${satirlar.length > 400 ? ' (tabloda son 400; CSV hepsini içerir)' : ''}`;
    kok._son = { a, b, t, kod: kod_, yon, v1, v2, fark, yuzde, r1, r2, satirlar, idx, arsiv, turIdx, birimEt };
    sorguYaz({ tutar: sayiSerbest(t, 6).replace(/\./g, ''), kod: kod_, tarih: a, tarih2: b === o.sonTarih ? '' : b, yon: yon === 'doviz' ? '' : yon, tur: turIdx !== 1 ? turIdx : '' });
  }
  const tetik = () => hesapla().catch(e => { console.error(e); $('.hata-metni', kok).textContent = 'Hesaplanamadı; sayfayı yenileyin.'; });
  let zaman; const kaydet = () => { clearTimeout(zaman); zaman = setTimeout(() => { const s = kok._son; if (s) { gecmisDepo.ekle({ tur: 'gecmis', baslik: `${sayiSerbest(s.t, 2)} ${s.kod}, ${tarihYaz(s.a, { kisa: true })} → ${tarihYaz(s.b, { kisa: true })}`, url: location.pathname + location.search }); olay('gecmis-kur', { kod: s.kod }); } }, 1200); };
  [yonS, tutar, kod, t1, t2, tur].forEach(el => el.addEventListener('input', () => { tetik(); kaydet(); }));
  $$('[data-hizli-tarih]', kok).forEach(bt => bt.addEventListener('click', () => {
    const [n, b] = [Number(bt.dataset.hizliTarih.slice(0, -1)), bt.dataset.hizliTarih.slice(-1)];
    t2.value = o.sonTarih; t1.value = gunEkle(o.sonTarih, -(b === 'a' ? n * 30 : n * 365)); if (t1.value < o.ilkTarih) t1.value = o.ilkTarih; tetik(); kaydet();
  }));
  $('[data-kopyala]', kok).addEventListener('click', () => kopyala($('.cumle', kok).textContent));
  $('[data-paylas]', kok).addEventListener('click', () => paylas({ baslik: 'Geçmiş kur hesabı', metin: $('.cumle', kok).textContent, url: location.href }));
  $('[data-csv]', kok).addEventListener('click', () => {
    const s = kok._son; if (!s) return;
    indir(`kur-${s.kod}-${s.a}_${s.b}.csv`, csvUret(['Tarih', `${s.kod} / TL (${turAdi(s.turIdx)})`, 'Birim', 'Kaynak'], s.satirlar.filter(r => r[s.idx] != null).map(r => [r[0], r[s.idx], s.arsiv.birim || 1, 'TCMB'])), 'text/csv;charset=utf-8');
  });
  $('[data-rapor]', kok).addEventListener('click', () => {
    const s = kok._son; if (!s) return;
    depo.yaz('rapor', { tur: 'gecmis', baslik: 'Geçmiş tarihli kur raporu', veriTarihi: o.sonTarih, uretim: o.son.uretim, ornek: !!o.son.ornek,
      ozet: [['Tutar', `${sayiSerbest(s.t, 2)} ${s.yon === 'doviz' ? s.kod : '₺'}`], ['Para birimi', `${s.kod} · ${o.birim[s.kod].ad}`], ['Yön', s.yon === 'doviz' ? 'Döviz → TL' : 'TL → Döviz'], [`${tarihYaz(s.a)} değeri`, `${sayiYaz(s.v1, 2)} ${s.birimEt}`], [`${tarihYaz(s.b)} değeri`, `${sayiYaz(s.v2, 2)} ${s.birimEt}`], ['Nominal değişim', `${s.fark >= 0 ? '+' : '−'}${sayiSerbest(Math.abs(s.fark), 2)} ${s.birimEt}`], ['Yüzde değişim', yuzdeYaz(s.yuzde)], ['Kullanılan bültenler', `${tarihYaz(s.r1.bilgi.tarih, { kisa: true })} ve ${tarihYaz(s.r2.bilgi.tarih, { kisa: true })}`], ['Kur türü', turAdi(s.turIdx)]],
      notlar: [nedenMetni(s.r1.bilgi), nedenMetni(s.r2.bilgi)].filter(Boolean),
      grafik: s.satirlar.length > 1 ? { baslik: `${s.kod}/TL`, noktalar: indirge(s.satirlar, s.idx, 120).filter(r => r[s.idx] != null).map(r => [r[0], r[s.idx] / (s.arsiv.birim || 1)]) } : null,
      tablo: { baslik: ['Tarih', `${s.kod}/TL`], satirlar: [s.r1, s.r2].map(r => [tarihYaz(r.bilgi.tarih, { gun: true }), kurYaz(r.tl)]) } });
    location.href = '/rapor/';
  });
  await hesapla();
  if (q.tutar) kaydet();
}
