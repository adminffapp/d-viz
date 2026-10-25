// Karşılaştırma ve analiz: iki para birimi, dönemler, değer değişimi, yükselen/düşenler, değişim tabloları.
import { $, $$, kacis, indir, depo, olay } from './ui.js';
import { ortam, paraSecenekleri, tlKuru } from './ortak.js';
import { arsivYukle, ozetYukle } from './veri.js';
import { grafik } from './grafik.js';
import { degisimHTML } from './kur-satir.js';
import { tutarOku, sayiYaz, sayiSerbest, kurYaz, yuzdeYaz, yuzdeDegisim, tarihYaz, aralikBaslangic, aralikSatirlari, indirge, istatistik, csvUret, gunEkle, isoGecerli, isaret, satirIdx } from './hesap.js';

export async function karsilastir(kok) {
  const [o, oz] = await Promise.all([ortam(), ozetYukle()]);
  const sekmeler = $$('[role=tab]', kok), paneller = $$('[role=tabpanel]', kok);
  function sekme(ad) {
    sekmeler.forEach(s => { const a = s.dataset.s === ad; s.setAttribute('aria-selected', a); s.tabIndex = a ? 0 : -1; });
    paneller.forEach(p => { p.hidden = p.dataset.s !== ad; });
    history.replaceState(null, '', '#' + ad);
  }
  sekmeler.forEach((s, i) => {
    s.addEventListener('click', () => sekme(s.dataset.s));
    s.addEventListener('keydown', e => { const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null; if (j == null) return; const t = sekmeler[(j + sekmeler.length) % sekmeler.length]; t.focus(); sekme(t.dataset.s); });
  });
  const raporYaz = r => { depo.yaz('rapor', { veriTarihi: o.sonTarih, uretim: o.son.uretim, ornek: !!o.son.ornek, ...r }); location.href = '/rapor/'; };

  /* 1) iki para birimi */
  {
    const p = $('[role=tabpanel][data-s=iki]', kok); const a = $('[name=a]', p), b = $('[name=b]', p);
    a.innerHTML = paraSecenekleri(o, 'USD', { tl: false }); b.innerHTML = paraSecenekleri(o, 'EUR', { tl: false });
    let aralik = '1y';
    const g = grafik($('.g', p), { seriler: [], yaz: v => yuzdeYaz(v, 2), yEksenYaz: v => Math.round(v) + '%', uclar: false, yukseklik: 320 });
    let son;
    async function ciz() {
      const [A, B] = await Promise.all([arsivYukle(a.value), arsivYukle(b.value)]);
      const bas = aralikBaslangic(aralik, o.sonTarih, o.ilkTarih);
      const sa = aralikSatirlari(A.gunler, bas, o.sonTarih), sb = aralikSatirlari(B.gunler, bas, o.sonTarih);
      const seri = (rows, ad, renk) => { const n = indirge(rows, 1, 380).filter(r => r[1] != null); const t0 = n[0][1]; return { ad, renk, alan: false, noktalar: n.map(r => [r[0], (r[1] / t0 - 1) * 100]) }; };
      g.guncelle([seri(sa, a.value, 'var(--seri1)'), seri(sb, b.value, 'var(--seri2)')], `${a.value} ve ${b.value}`);
      const ia = istatistik(sa, 1), ib = istatistik(sb, 1);
      const satir = (k, s, renk) => `<tr><th scope="row"><i style="display:inline-block;width:12px;height:3px;background:${renk};margin-right:8px;vertical-align:middle"></i>${k} · ${kacis(o.birim[k].ad)}</th><td class="sayi">${degisimHTML(s.yuzde)}</td><td class="sayi">${kurYaz(s.min)}</td><td class="sayi">${kurYaz(s.max)}</td><td class="sayi">${kurYaz(s.ortalama)}</td></tr>`;
      $('.ist-govde', p).innerHTML = satir(a.value, ia, 'var(--seri1)') + satir(b.value, ib, 'var(--seri2)');
      const fark = ia.yuzde - ib.yuzde;
      $('.cumle', p).textContent = `${tarihYaz(ia.ilkTarih)} – ${tarihYaz(ia.sonTarih)} arasında ${a.value} %${sayiYaz(Math.abs(ia.yuzde), 2)} ${ia.yuzde >= 0 ? 'yükseldi' : 'düştü'}, ${b.value} %${sayiYaz(Math.abs(ib.yuzde), 2)} ${ib.yuzde >= 0 ? 'yükseldi' : 'düştü'}. Aradaki fark ${sayiYaz(Math.abs(fark), 2)} yüzde puan (${fark >= 0 ? a.value : b.value} lehine).`;
      son = { a: a.value, b: b.value, sa, sb, ia, ib };
    }
    [a, b].forEach(x => x.addEventListener('input', ciz));
    $$('[data-aralik]', p).forEach(bt => bt.addEventListener('click', () => { aralik = bt.dataset.aralik; $$('[data-aralik]', p).forEach(x => x.setAttribute('aria-pressed', x === bt)); ciz(); }));
    $('[data-csv]', p).addEventListener('click', () => {
      const mb = new Map(son.sb.map(r => [r[0], r[1]]));
      indir(`karsilastirma-${son.a}-${son.b}.csv`, csvUret(['Tarih', `${son.a}/TL`, `${son.b}/TL`, `${son.a}/${son.b} paritesi`], son.sa.filter(r => mb.has(r[0]) && r[1] != null && mb.get(r[0]) != null).map(r => [r[0], r[1], mb.get(r[0]), r[1] / mb.get(r[0])])));
    });
    $('[data-rapor]', p).addEventListener('click', () => raporYaz({ tur: 'karsilastirma', baslik: `${son.a} ve ${son.b} karşılaştırması`, ozet: [['Dönem', `${tarihYaz(son.ia.ilkTarih)} – ${tarihYaz(son.ia.sonTarih)}`], [`${son.a} değişimi`, yuzdeYaz(son.ia.yuzde)], [`${son.b} değişimi`, yuzdeYaz(son.ib.yuzde)]], notlar: [$('.cumle', p).textContent], grafik: { baslik: `${son.a}/TL (yüzde değişim)`, noktalar: indirge(son.sa, 1, 120).filter(r => r[1] != null).map(r => [r[0], r[1]]) }, tablo: { baslik: ['Para birimi', 'Değişim', 'En düşük', 'En yüksek', 'Ortalama'], satirlar: [[son.a, son.ia], [son.b, son.ib]].map(([k, s]) => [k, yuzdeYaz(s.yuzde), kurYaz(s.min), kurYaz(s.max), kurYaz(s.ortalama)]) } }));
    await ciz();
  }

  /* 2) farklı dönemler */
  {
    const p = $('[role=tabpanel][data-s=donem]', kok); const k = $('[name=kod]', p);
    k.innerHTML = paraSecenekleri(o, 'USD', { tl: false });
    const al = n => $(`[name=${n}]`, p);
    const [a1, a2, b1, b2] = ['a1', 'a2', 'b1', 'b2'].map(al);
    a1.value = gunEkle(o.sonTarih, -730); a2.value = gunEkle(o.sonTarih, -366); b1.value = gunEkle(o.sonTarih, -365); b2.value = o.sonTarih;
    [a1, a2, b1, b2].forEach(x => { x.min = o.ilkTarih; x.max = o.sonTarih; });
    async function hesapla() {
      const hata = $('.hata-metni', p); hata.textContent = '';
      const ts = [a1, a2, b1, b2];
      if (ts.some(x => !isoGecerli(x.value) || x.value < o.ilkTarih || x.value > o.sonTarih)) { hata.textContent = `Tarihler ${tarihYaz(o.ilkTarih, { kisa: true })} – ${tarihYaz(o.sonTarih, { kisa: true })} arasında olmalı.`; return; }
      if (a1.value > a2.value || b1.value > b2.value) { hata.textContent = 'Her dönemde başlangıç, bitişten önce olmalı.'; return; }
      const A = await arsivYukle(k.value);
      const dg = (x, y) => { const i = A.gunler[satirIdx(A.gunler, x)], j = A.gunler[satirIdx(A.gunler, y)]; return i && j ? { x: i, y: j, yuzde: yuzdeDegisim(j[1], i[1]), fark: j[1] - i[1] } : null; };
      const da = dg(a1.value, a2.value), db = dg(b1.value, b2.value);
      const blok = (ad, d) => `<tr><th scope="row">${ad}</th><td>${tarihYaz(d.x[0], { kisa: true })} → ${tarihYaz(d.y[0], { kisa: true })}</td><td class="sayi">${kurYaz(d.x[1])} → ${kurYaz(d.y[1])}</td><td class="sayi">${degisimHTML(d.yuzde)}</td></tr>`;
      $('.govde', p).innerHTML = blok('1. dönem', da) + blok('2. dönem', db);
      const f = db.yuzde - da.yuzde;
      $('.cumle', p).textContent = `${k.value}/TL 1. dönemde ${yuzdeYaz(da.yuzde)}, 2. dönemde ${yuzdeYaz(db.yuzde)} değişti; fark ${sayiYaz(Math.abs(f), 2)} yüzde puan.`;
    }
    [k, a1, a2, b1, b2].forEach(x => x.addEventListener('input', () => hesapla().catch(console.error)));
    await hesapla();
  }

  /* 3) değer değişimi */
  {
    const p = $('[role=tabpanel][data-s=deger]', kok); const al = n => $(`[name=${n}]`, p);
    const [tutar, kod, tarih] = ['tutar', 'kod', 'tarih'].map(al);
    kod.innerHTML = paraSecenekleri(o, 'TRY'); tarih.min = o.ilkTarih; tarih.max = o.sonTarih; tarih.value = gunEkle(o.sonTarih, -365);
    let son;
    async function hesapla() {
      const hata = $('.hata-metni', p); hata.textContent = '';
      const t = tutarOku(tutar.value);
      if (t == null || t <= 0) { hata.textContent = 'Geçerli bir tutar yazın.'; return; }
      if (!isoGecerli(tarih.value) || tarih.value < o.ilkTarih || tarih.value > o.sonTarih) { hata.textContent = 'Tarih arşiv aralığında olmalı.'; return; }
      const [e1, e2] = await Promise.all([tlKuru(o, kod.value, tarih.value), tlKuru(o, kod.value, o.sonTarih)]);
      if (e1.tl == null) { hata.textContent = 'Bu tarih için kur bulunamadı.'; return; }
      const tl1 = t * e1.tl, tl2 = t * e2.tl;
      const satirlar = [['TRY', 'Türk Lirası', tl1, tl2]];
      for (const r of ['USD', 'EUR', 'GBP']) {
        if (r === kod.value) continue;
        const [r1, r2] = await Promise.all([tlKuru(o, r, tarih.value), tlKuru(o, r, o.sonTarih)]);
        satirlar.push([r, o.birim[r].ad, tl1 / r1.tl, tl2 / r2.tl]);
      }
      $('.govde', p).innerHTML = satirlar.map(([r, ad, v1, v2]) => `<tr><th scope="row">${r} <span class="soluk">${kacis(ad)}</span></th><td class="sayi">${sayiYaz(v1, 2)}</td><td class="sayi">${sayiYaz(v2, 2)}</td><td class="sayi">${degisimHTML(yuzdeDegisim(v2, v1))}</td></tr>`).join('');
      $('.bas1', p).textContent = tarihYaz(e1.bilgi.tarih, { kisa: true }); $('.bas2', p).textContent = tarihYaz(e2.bilgi.tarih, { kisa: true });
      $('.cumle', p).textContent = `${sayiSerbest(t, 2)} ${kod.value} değeri, ${tarihYaz(e1.bilgi.tarih)} ile ${tarihYaz(e2.bilgi.tarih)} arasında TL cinsinden ${yuzdeYaz(yuzdeDegisim(tl2, tl1))}${satirlar[1] ? `, ${satirlar[1][0]} cinsinden ${yuzdeYaz(yuzdeDegisim(satirlar[1][3], satirlar[1][2]))}` : ''} değişti. Hangi para biriminde ölçtüğünüz sonucu değiştirir.`;
      son = { t, kod: kod.value, satirlar, e1, e2 };
    }
    [tutar, kod, tarih].forEach(x => x.addEventListener('input', () => hesapla().catch(console.error)));
    $('[data-csv]', p).addEventListener('click', () => indir(`deger-degisimi-${son.kod}.csv`, csvUret(['Ölçü birimi', 'Başlangıç değeri', 'Son değer', 'Yüzde değişim'], son.satirlar.map(([r, , v1, v2]) => [r, v1, v2, yuzdeDegisim(v2, v1)]))));
    $('[data-rapor]', p).addEventListener('click', () => raporYaz({ tur: 'deger', baslik: 'Tutarın değer değişimi', ozet: [['Tutar', `${sayiSerbest(son.t, 2)} ${son.kod}`], ['Başlangıç', tarihYaz(son.e1.bilgi.tarih)], ['Son bülten', tarihYaz(son.e2.bilgi.tarih)]], notlar: [$('.cumle', p).textContent], tablo: { baslik: ['Ölçü birimi', 'Başlangıç', 'Son', 'Değişim'], satirlar: son.satirlar.map(([r, , v1, v2]) => [r, sayiYaz(v1, 2), sayiYaz(v2, 2), yuzdeYaz(yuzdeDegisim(v2, v1))]) } }));
    await hesapla();
  }

  /* 4) yükselen / düşenler + değişim tabloları */
  {
    const p = $('[role=tabpanel][data-s=siralama]', kok); const per = $('[name=donem]', p);
    const alanlar = { g1: '1 gün', g7: '7 gün', g30: '30 gün', g90: '90 gün', g365: '1 yıl' };
    const liste = () => o.meta.filter(m => oz.ozet[m.kod]?.[per.value] != null).map(m => ({ m, d: oz.ozet[m.kod][per.value] })).sort((x, y) => y.d - x.d);
    function ciz() {
      const l = liste();
      const kart = (x) => `<li><a href="/kur/${x.m.slug}/" class="sol"><b>${kacis(x.m.ad)}</b><span class="kucuk soluk">${x.m.kod}</span></a>${degisimHTML(x.d)}</li>`;
      $('.yuk', p).innerHTML = l.slice(0, 5).map(kart).join(''); $('.dus', p).innerHTML = l.slice(-5).reverse().map(kart).join('');
      $('.tum-govde', p).innerHTML = o.meta.map(m => { const z = oz.ozet[m.kod]; return `<tr><th scope="row"><a href="/kur/${m.slug}/">${kacis(m.ad)}</a> <span class="soluk">${m.kod}</span></th>${['g1', 'g7', 'g30', 'g90', 'g365'].map(a => `<td>${degisimHTML(z?.[a])}</td>`).join('')}</tr>`; }).join('');
      $('.not', p).textContent = `Karşılaştırma ${tarihYaz(oz.tarih)} bülteni ve döviz alış kuru üzerinden; her para birimi kendi arşivindeki tarihe göre hesaplanır.`;
    }
    per.addEventListener('input', ciz); ciz();
    $('[data-csv]', p).addEventListener('click', () => indir(`degisim-tablosu-${oz.tarih}.csv`, csvUret(['Kod', 'Para birimi', ...Object.values(alanlar).map(a => a + ' değişim (%)'), 'Bülten tarihi', 'Kaynak'], o.meta.map(m => [m.kod, m.ad, ...Object.keys(alanlar).map(a => oz.ozet[m.kod]?.[a] ?? null), oz.tarih, 'TCMB']))));
    $('[data-rapor]', p).addEventListener('click', () => raporYaz({ tur: 'degisim', baslik: 'Değişim tablosu', ozet: [['Bülten tarihi', tarihYaz(oz.tarih)], ['Ölçüt', 'Döviz alış, bir önceki bülten / 7 / 30 / 90 / 365 gün öncesine göre']], tablo: { baslik: ['Para birimi', ...Object.values(alanlar)], satirlar: o.meta.map(m => [`${m.kod} · ${m.ad}`, ...Object.keys(alanlar).map(a => yuzdeYaz(oz.ozet[m.kod]?.[a]))]) } }));
  }
  const ilk = location.hash.slice(1); sekme(['iki', 'donem', 'deger', 'siralama'].includes(ilk) ? ilk : 'iki');
}
