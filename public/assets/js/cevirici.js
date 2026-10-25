// Döviz çevirici: çift yönlü, çoklu hedef, komisyon, hassasiyet, kopyala/paylaş/rapor, son hesaplar.
import { $, $$, kacis, kopyala, paylas, sorgu, sorguYaz, olay, toast, depo, indir } from './ui.js';
import { ortam, paraSecenekleri, tlKuru, turSecenekleri, turAdi } from './ortak.js';
import { tutarOku, sayiYaz, sayiSerbest, kurYaz, cevir, netTutar, tarihYaz, csvUret } from './hesap.js';
import { gecmis, sepet } from './kisisel.js';

const HIZLI = [10, 50, 100, 500, 1000, 5000];
const VARSAYILAN_HEDEF = ['TRY', 'USD', 'EUR', 'GBP', 'CHF'];

export async function cevirici(kok) {
  const o = await ortam();
  const f = n => $(`[name=${n}]`, kok);
  const [tutar, kaynak, hedef, sonucAlan, tur, hane, kom, ucret] = ['tutar', 'kaynak', 'hedef', 'sonuc', 'tur', 'hane', 'komisyon', 'ucret'].map(f);
  const q = sorgu();
  kaynak.innerHTML = paraSecenekleri(o, q.kaynak || 'USD');
  hedef.innerHTML = paraSecenekleri(o, q.hedef || 'TRY');
  tur.innerHTML = turSecenekleri(Number(q.tur) || 1);
  if (q.tutar) tutar.value = q.tutar; if (q.hane) hane.value = q.hane; if (q.kom) kom.value = q.kom; if (q.ucret) ucret.value = q.ucret;
  const secili = new Set(depo.oku('cevirici-hedefler', VARSAYILAN_HEDEF));
  const chip = $('.hedef-chipler', kok);
  chip.innerHTML = ['TRY', ...o.meta.sort((a, b) => a.sira - b.sira).map(m => m.kod)].map(k => `<button type="button" class="cip" data-k="${k}" aria-pressed="${secili.has(k)}">${k}</button>`).join('');
  let yon = 'ileri'; // sonuç alanını kullanıcı düzenlerse 'geri'

  async function hesapla() {
    const t = yon === 'ileri' ? tutarOku(tutar.value) : null;
    const turIdx = Number(tur.value), d = Number(hane.value);
    const [a, b] = await Promise.all([tlKuru(o, kaynak.value, null, turIdx), tlKuru(o, hedef.value, null, turIdx)]);
    const bilgiA = a.bilgi, bilgiB = b.bilgi;
    const uyari = $('.tur-uyari', kok); uyari.textContent = '';
    if (a.tl == null || b.tl == null) { uyari.textContent = `${a.tl == null ? kaynak.value : hedef.value} için bu kur türü bulunamadı; Döviz alış kullanıldı.`; }
    const tlA = a.tl ?? (await tlKuru(o, kaynak.value, null, 1)).tl, tlB = b.tl ?? (await tlKuru(o, hedef.value, null, 1)).tl;
    if (bilgiA.turDegisti || bilgiB.turDegisti) uyari.textContent = 'Seçilen kur türü bu para biriminde yayımlanmıyor; Döviz alış kullanıldı.';
    let girdi = t;
    if (yon === 'geri') {
      const s = tutarOku(sonucAlan.value); // sonucu düzenlediyse tutarı geri hesapla
      if (s != null) { const kes = Number(kom.value) || 0; const brut = (s + (tutarOku(ucret.value) || 0)) / (1 - kes / 100); girdi = (brut * tlB) / tlA; tutar.value = sayiSerbest(girdi, 6); }
    }
    const err = $('.hata-metni', kok);
    err.textContent = '';
    if (girdi == null || girdi < 0) { if (yon === 'ileri') { tutar.setAttribute('aria-invalid', 'true'); err.textContent = 'Geçerli bir tutar yazın (ör. 1.250,50).'; } return; }
    tutar.removeAttribute('aria-invalid');
    const brut = cevir(girdi, tlA, tlB);
    const k = Math.max(0, Number(kom.value) || 0), u = Math.max(0, tutarOku(ucret.value) || 0);
    const { net, kesinti } = netTutar(brut, k, u);
    if (yon === 'ileri') sonucAlan.value = sayiYaz(net, d);
    $('.net-bilgi', kok).innerHTML = k || u ? `Brüt <b class="sayi">${sayiYaz(brut, d)} ${hedef.value}</b>, kesinti <b class="sayi">${sayiYaz(kesinti, d)} ${hedef.value}</b> (%${sayiSerbest(k, 2)} komisyon${u ? ` + ${sayiSerbest(u, 2)} ücret` : ''}).` : 'Komisyon girilmedi; sonuç ham kurla hesaplandı.';
    const bir = cevir(1, tlA, tlB), ters = cevir(1, tlB, tlA);
    $('.kur-bilgi', kok).innerHTML = `<span class="sayi">1 ${kaynak.value} = ${sayiYaz(bir, Math.max(4, d))} ${hedef.value}</span><span class="sayi">1 ${hedef.value} = ${sayiYaz(ters, Math.max(4, d))} ${kaynak.value}</span>`;
    $('.buyuk-sonuc', kok).textContent = `${sayiSerbest(girdi, 6)} ${kaynak.value} = ${sayiYaz(net, d)} ${hedef.value}`;
    $('.kaynak-satir', kok).textContent = `Kur: ${turAdi(turIdx)} · TCMB bülteni ${tarihYaz(o.sonTarih, { gun: true })}` + (kaynak.value !== 'TRY' && hedef.value !== 'TRY' ? ' · çapraz kur TL üzerinden hesaplanır' : '');
    // çoklu hedef
    const satirlar = [];
    for (const kod of [...secili]) {
      if (kod === kaynak.value) continue;
      const r = await tlKuru(o, kod, null, turIdx);
      const tl = r.tl ?? (await tlKuru(o, kod, null, 1)).tl;
      satirlar.push([kod, kod === 'TRY' ? 'Türk Lirası' : o.birim[kod].ad, netTutar(cevir(girdi, tlA, tl), k, u).net, cevir(1, tlA, tl)]);
    }
    kok._cokluSatir = satirlar;
    $('.coklu-govde', kok).innerHTML = satirlar.length ? satirlar.map(([kod, ad, v, b1]) => `<tr><td><span class="kod">${kod}</span>${kacis(ad)}</td><td class="sayi">${sayiYaz(v, d)}</td><td class="sayi gizle-mobil">${sayiYaz(b1, Math.max(4, d))}</td></tr>`).join('') : '<tr><td colspan="3" class="bos">Yukarıdan para birimi seçin.</td></tr>';
    kok._son = { girdi, net, k, u, d, turIdx, brut };
    sorguYaz({ tutar: sayiSerbest(girdi, 6).replace(/\./g, ''), kaynak: kaynak.value, hedef: hedef.value, tur: turIdx !== 1 ? turIdx : '', hane: d !== 2 ? d : '', kom: k || '', ucret: u || '' });
    depo.yaz('cevirici-hedefler', [...secili]);
  }
  const tetik = () => hesapla().catch(e => { console.error(e); $('.hata-metni', kok).textContent = 'Hesaplanamadı; sayfayı yenileyin.'; });
  const gecikmeli = (() => { let t; return () => { clearTimeout(t); t = setTimeout(() => { tetik(); kaydet(); }, 600); }; })();
  function kaydet() { const s = kok._son; if (!s) return; gecmis.ekle({ tur: 'cevirici', baslik: `${sayiSerbest(s.girdi, 2)} ${kaynak.value} → ${hedef.value}`, url: location.pathname + location.search }); gecmisCiz(); olay('cevirici', { kaynak: kaynak.value, hedef: hedef.value }); }
  [tutar, kaynak, hedef, tur, hane, kom, ucret].forEach(el => el.addEventListener('input', () => { yon = 'ileri'; tetik(); gecikmeli(); }));
  sonucAlan.addEventListener('input', () => { yon = 'geri'; tetik(); gecikmeli(); });
  $('.degis', kok).addEventListener('click', () => { [kaynak.value, hedef.value] = [hedef.value, kaynak.value]; yon = 'ileri'; tetik(); gecikmeli(); });
  $$('[data-hizli]', kok).forEach(b => b.addEventListener('click', () => { tutar.value = sayiSerbest(Number(b.dataset.hizli), 0); yon = 'ileri'; tetik(); gecikmeli(); }));
  chip.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; secili.has(k) ? secili.delete(k) : secili.add(k); b.setAttribute('aria-pressed', secili.has(k)); tetik(); });
  $('[data-kopyala]', kok).addEventListener('click', () => kopyala($('.buyuk-sonuc', kok).textContent));
  $('[data-paylas]', kok).addEventListener('click', () => paylas({ baslik: 'Forex hesabı', metin: $('.buyuk-sonuc', kok).textContent, url: location.href }));
  $('[data-sepet]', kok).addEventListener('click', () => { const s = kok._son; if (!s || kaynak.value === 'TRY') return toast('Sepete yalnızca döviz eklenir', 'hata'); sepet.ekle(kaynak.value, s.girdi); toast(`${sayiSerbest(s.girdi, 2)} ${kaynak.value} sepete eklendi`); });
  $('[data-csv]', kok).addEventListener('click', () => {
    const r = kok._cokluSatir || [], s = kok._son;
    indir(`cevirici-${kaynak.value}-${o.sonTarih}.csv`, csvUret(['Kaynak tutar', 'Kaynak birim', 'Hedef birim', 'Sonuç', 'Kur', 'Kur türü', 'Bülten tarihi', 'Kaynak'], r.map(([kod, , v, b1]) => [s.girdi, kaynak.value, kod, v, b1, turAdi(s.turIdx), o.sonTarih, 'TCMB'])));
  });
  $('[data-rapor]', kok).addEventListener('click', () => {
    const s = kok._son, r = kok._cokluSatir || [];
    depo.yaz('rapor', { tur: 'cevirici', baslik: 'Döviz çevirme raporu', veriTarihi: o.sonTarih, uretim: o.son.uretim, ornek: !!o.son.ornek, ozet: [[`Tutar`, `${sayiSerbest(s.girdi, 6)} ${kaynak.value}`], ['Hedef', hedef.value], ['Sonuç (net)', `${sayiYaz(s.net, s.d)} ${hedef.value}`], ['Kur türü', turAdi(s.turIdx)], ['Komisyon', `%${sayiSerbest(s.k, 2)} + ${sayiSerbest(s.u, 2)}`]], tablo: { baslik: ['Para birimi', 'Karşılığı', 'Kur'], satirlar: r.map(([kod, ad, v, b1]) => [`${kod} · ${ad}`, sayiYaz(v, s.d), sayiYaz(b1, 4)]) } });
    location.href = '/rapor/';
  });
  function gecmisCiz() {
    const l = gecmis.oku().filter(x => x.tur === 'cevirici').slice(0, 8);
    $('.gecmis-liste', kok).innerHTML = l.length ? l.map(x => `<li><a href="${kacis(x.url)}">${kacis(x.baslik)}</a><span class="kucuk soluk">${new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(x.zaman))}</span></li>`).join('') : '<li class="soluk">Henüz hesap yok. Yaptığınız hesaplar yalnızca bu tarayıcıda saklanır.</li>';
  }
  $('[data-gecmis-temizle]', kok).addEventListener('click', () => { gecmis.temizle(); gecmisCiz(); });
  gecmisCiz(); await hesapla();
  if (q.tutar) kaydet();
}
