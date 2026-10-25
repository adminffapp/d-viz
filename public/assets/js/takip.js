// Takip listem (favoriler) ve döviz sepeti. Tüm veri bu tarayıcıda saklanır; üyelik yok.
import { $, $$, kacis, indir, depo, toast, olay } from './ui.js';
import { ortam, paraSecenekleri, tlKuru } from './ortak.js';
import { favoriler, sepet, tumu } from './kisisel.js';
import { degisimHTML } from './kur-satir.js';
import { tutarOku, sayiYaz, sayiSerbest, kurYaz, yuzdeDegisim, yuzdeYaz, tarihYaz, csvUret, gunEkle, isoGecerli } from './hesap.js';
import { ozetYukle } from './veri.js';

export async function takip(kok) {
  const [o, oz] = await Promise.all([ortam(), ozetYukle()]);
  const sekmeler = $$('[role=tab]', kok), paneller = $$('[role=tabpanel]', kok);
  const sekme = ad => { sekmeler.forEach(s => { const a = s.dataset.s === ad; s.setAttribute('aria-selected', a); s.tabIndex = a ? 0 : -1; }); paneller.forEach(p => { p.hidden = p.dataset.s !== ad; }); history.replaceState(null, '', '#' + ad); };
  sekmeler.forEach((s, i) => { s.addEventListener('click', () => sekme(s.dataset.s)); s.addEventListener('keydown', e => { const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null; if (j == null) return; const t = sekmeler[(j + sekmeler.length) % sekmeler.length]; t.focus(); sekme(t.dataset.s); }); });
  const raporYaz = r => { depo.yaz('rapor', { veriTarihi: o.sonTarih, uretim: o.son.uretim, ornek: !!o.son.ornek, ...r }); location.href = '/rapor/'; };

  /* ---- favoriler ---- */
  const fp = $('[role=tabpanel][data-s=favori]', kok);
  function favCiz() {
    const l = favoriler.oku().filter(k => o.birim[k] && o.son.kurlar[k]);
    $('.f-govde', fp).innerHTML = l.length ? l.map((k, i) => {
      const m = o.birim[k], r = o.son.kurlar[k];
      return `<tr><td><span class="kur-ad"><span class="kod">${k}</span><span class="metin"><a class="ad" href="/kur/${m.slug}/">${kacis(m.ad)}</a><small>${m.birim > 1 ? m.birim + ' ' + k + ' için' : m.kisa}</small></span></span></td><td class="sayi">${kurYaz(r[0])}</td><td class="sayi gizle-mobil">${kurYaz(r[1])}</td><td>${degisimHTML(oz.ozet[k]?.g1)}</td>
        <td style="white-space:nowrap"><button class="ikon-dugme" type="button" data-yukari="${k}" aria-label="${kacis(m.ad)} yukarı taşı" ${i === 0 ? 'disabled' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg></button> <button class="ikon-dugme" type="button" data-asagi="${k}" aria-label="${kacis(m.ad)} aşağı taşı" ${i === l.length - 1 ? 'disabled' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button> <button class="ikon-dugme" type="button" data-kaldir="${k}" aria-label="${kacis(m.ad)} listeden çıkar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></td></tr>`;
    }).join('') : `<tr><td colspan="5" class="bos"><strong>Takip listeniz boş</strong>Kurlar sayfasında yıldız simgesine basarak para birimi ekleyin. <a href="/kurlar/">Kurlara git</a></td></tr>`;
    $$('[data-yukari],[data-asagi]', fp).forEach(b => b.disabled && b.setAttribute('aria-disabled', 'true'));
  }
  fp.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.yukari) favoriler.tasi(b.dataset.yukari, -1); else if (b.dataset.asagi) favoriler.tasi(b.dataset.asagi, 1);
    else if (b.dataset.kaldir) favoriler.degistir(b.dataset.kaldir); else return;
    favCiz();
  });
  $('[data-fav-csv]', fp).addEventListener('click', () => {
    const l = favoriler.oku().filter(k => o.birim[k]);
    indir(`takip-listem-${o.sonTarih}.csv`, csvUret(['Sıra', 'Kod', 'Para birimi', 'Döviz alış (₺)', 'Döviz satış (₺)', 'Birim', 'Günlük değişim (%)', 'Bülten tarihi', 'Kaynak'], l.map((k, i) => { const r = o.son.kurlar[k]; return [i + 1, k, o.birim[k].ad, r[0], r[1], o.birim[k].birim, oz.ozet[k]?.g1 ?? null, o.sonTarih, 'TCMB']; })));
  });
  $('[data-hepsi-indir]', kok).addEventListener('click', () => indir(`ff-doviz-verilerim-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(tumu.disaAktar(), null, 1), 'application/json'));
  $('[data-hepsi-yukle]', kok).addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try { tumu.iceAl(JSON.parse(await f.text())); favCiz(); sepetCiz(); toast('Veriler yüklendi'); } catch { toast('Bu dosya okunamadı', 'hata'); }
    e.target.value = '';
  });
  window.addEventListener('favori-degisti', favCiz);
  favCiz();

  /* ---- sepet ---- */
  const sp = $('[role=tabpanel][data-s=sepet]', kok);
  const tarih = $('[name=tarih]', sp), yeniKod = $('[name=yenikod]', sp), yeniTutar = $('[name=yenitutar]', sp);
  yeniKod.innerHTML = paraSecenekleri(o, 'USD', { tl: false });
  tarih.min = o.ilkTarih; tarih.max = o.sonTarih;
  const kayitli = sepet.tarih.oku();
  tarih.value = isoGecerli(kayitli) && kayitli >= o.ilkTarih && kayitli <= o.sonTarih ? kayitli : gunEkle(o.sonTarih, -365);
  let sonDurum = null;
  async function sepetCiz() {
    const l = sepet.oku().filter(x => o.birim[x.kod]);
    const [govde, ozet] = [$('.s-govde', sp), $('.s-ozet', sp)];
    if (!l.length) { govde.innerHTML = `<tr><td colspan="6" class="bos"><strong>Sepetiniz boş</strong>Aşağıdan para birimi ve tutar ekleyin; toplam TL değerini ve geçmiş tarihe göre değişimini görürsünüz.</td></tr>`; ozet.innerHTML = ''; sonDurum = null; return; }
    let topBugun = 0, topEski = 0; const satirlar = [];
    for (let i = 0; i < l.length; i++) {
      const [bugun, eski] = await Promise.all([tlKuru(o, l[i].kod, o.sonTarih), tlKuru(o, l[i].kod, tarih.value)]);
      const vb = l[i].miktar * bugun.tl, ve = eski.tl == null ? null : l[i].miktar * eski.tl;
      topBugun += vb; if (ve != null) topEski += ve;
      satirlar.push({ ...l[i], vb, ve, eskiTarih: eski.bilgi.tarih });
    }
    govde.innerHTML = satirlar.map((s, i) => `<tr><td><span class="kod">${s.kod}</span>${kacis(o.birim[s.kod].ad)}</td><td class="sayi">${sayiSerbest(s.miktar, 4)}</td><td class="sayi">${sayiYaz(s.vb, 2)}</td><td class="sayi gizle-mobil">${s.ve == null ? '—' : sayiYaz(s.ve, 2)}</td><td>${s.ve == null ? '—' : degisimHTML(yuzdeDegisim(s.vb, s.ve))}</td><td><button class="ikon-dugme" type="button" data-sil="${i}" aria-label="${kacis(o.birim[s.kod].ad)} satırını sil"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></td></tr>`).join('') +
      `<tr><td><b>Toplam</b></td><td></td><td class="sayi"><b>${sayiYaz(topBugun, 2)} ₺</b></td><td class="sayi gizle-mobil"><b>${sayiYaz(topEski, 2)} ₺</b></td><td>${degisimHTML(yuzdeDegisim(topBugun, topEski))}</td><td></td></tr>`;
    ozet.innerHTML = `<p class="sonuc-buyuk sayi">${sayiYaz(topBugun, 2)} ₺</p><p class="sonuc-alt">Sepetin son bülten (${tarihYaz(o.sonTarih, { kisa: true })}) değeri, döviz alış kuruyla. ${tarihYaz(tarih.value, { kisa: true })} tarihinde ${sayiYaz(topEski, 2)} ₺ idi: ${yuzdeYaz(yuzdeDegisim(topBugun, topEski))}.</p>`;
    sonDurum = { satirlar, topBugun, topEski };
  }
  sp.addEventListener('click', e => { const b = e.target.closest('[data-sil]'); if (b) { sepet.sil(Number(b.dataset.sil)); sepetCiz(); } });
  $('.s-ekle', sp).addEventListener('submit', e => {
    e.preventDefault(); const t = tutarOku(yeniTutar.value);
    if (t == null || t <= 0) { yeniTutar.setAttribute('aria-invalid', 'true'); $('.hata-metni', sp).textContent = 'Geçerli bir tutar yazın.'; return; }
    yeniTutar.removeAttribute('aria-invalid'); $('.hata-metni', sp).textContent = '';
    sepet.ekle(yeniKod.value, t); yeniTutar.value = ''; sepetCiz(); olay('sepet-ekle', { kod: yeniKod.value });
  });
  tarih.addEventListener('input', () => { if (isoGecerli(tarih.value) && tarih.value >= o.ilkTarih && tarih.value <= o.sonTarih) { sepet.tarih.yaz(tarih.value); sepetCiz(); } });
  $('[data-temizle]', sp).addEventListener('click', () => { if (confirm('Sepetteki tüm satırlar silinsin mi?')) { sepet.temizle(); sepetCiz(); } });
  $('[data-sepet-csv]', sp).addEventListener('click', () => { if (!sonDurum) return toast('Sepet boş', 'hata'); indir(`doviz-sepeti-${o.sonTarih}.csv`, csvUret(['Para birimi', 'Miktar', `Değer ${o.sonTarih} (₺)`, `Değer ${tarih.value} (₺)`, 'Değişim (%)', 'Kaynak'], [...sonDurum.satirlar.map(s => [s.kod, s.miktar, s.vb, s.ve, s.ve ? yuzdeDegisim(s.vb, s.ve) : null, 'TCMB']), ['TOPLAM', null, sonDurum.topBugun, sonDurum.topEski, yuzdeDegisim(sonDurum.topBugun, sonDurum.topEski), 'TCMB']])); });
  $('[data-sepet-rapor]', sp).addEventListener('click', () => { if (!sonDurum) return toast('Sepet boş', 'hata'); const d = sonDurum; raporYaz({ tur: 'sepet', baslik: 'Döviz sepeti raporu', ozet: [['Sepet değeri (son bülten)', `${sayiYaz(d.topBugun, 2)} ₺`], [`${tarihYaz(tarih.value)} değeri`, `${sayiYaz(d.topEski, 2)} ₺`], ['Değişim', yuzdeYaz(yuzdeDegisim(d.topBugun, d.topEski))], ['Kur türü', 'Döviz alış']], tablo: { baslik: ['Para birimi', 'Miktar', 'Bugün (₺)', 'Eski (₺)', 'Değişim'], satirlar: d.satirlar.map(s => [s.kod, sayiSerbest(s.miktar, 4), sayiYaz(s.vb, 2), s.ve == null ? '—' : sayiYaz(s.ve, 2), s.ve == null ? '—' : yuzdeYaz(yuzdeDegisim(s.vb, s.ve))]) } }); });
  await sepetCiz();
  const ilk = location.hash.slice(1); sekme(ilk === 'sepet' ? 'sepet' : 'favori');
}
