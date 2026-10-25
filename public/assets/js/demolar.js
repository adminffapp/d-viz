// Ana sayfadaki küçük, çalışan örnekler. Aynı hesap ve veri katmanını kullanırlar.
import { $, $$ } from './ui.js';
import { ortam, paraSecenekleri, tlKuru, kaynakSatiri } from './ortak.js';
import { arsivYukle } from './veri.js';
import { grafik } from './grafik.js';
import { tutarOku, sayiYaz, sayiSerbest, kurYaz, yuzdeYaz, tarihYaz, nedenMetni, gunEkle, haftaGunu, aralikBaslangic, aralikSatirlari, indirge, istatistik, cevir } from './hesap.js';

export async function faturaDemo(kok) {
  const o = await ortam();
  const tarih = $('[name=tarih]', kok), kod = $('[name=kod]', kok);
  kod.innerHTML = paraSecenekleri(o, 'USD', { tl: false, yalnizPopuler: true });
  tarih.min = o.ilkTarih; tarih.max = gunEkle(o.sonTarih, 14);
  // varsayılan: son bültenden önceki cumartesi (hafta sonu açıklamasını göstermek için değil, doğal bir ay sonu örneği)
  let d = gunEkle(o.sonTarih, -30); while (haftaGunu(d) !== 6) d = gunEkle(d, 1);
  tarih.value = d;
  const git = async () => {
    const r = await tlKuru(o, kod.value, tarih.value, 1);
    const kap = $('.sonuc', kok);
    if (r.bilgi.hata) { kap.innerHTML = '<p class="hata-metni">Bu tarih için kur bulunamadı.</p>'; return; }
    const a = r.arsiv; const b = r.bilgi;
    const gosterilen = b.kur;
    kap.innerHTML = `<p class="sonuc-buyuk sayi">${(a.birim > 1 ? a.birim + ' ' : '1 ') + kod.value} = ${kurYaz(gosterilen)} ₺</p>
      <p class="sonuc-alt">${kaynakSatiri(b, o)}</p>
      ${b.neden !== 'tam' ? `<p class="not-kutu" style="margin-top:12px">${nedenMetni(b)}</p>` : ''}`;
  };
  [tarih, kod].forEach(el => el.addEventListener('input', git)); git();
}

export async function hizliDemo(kok) {
  const o = await ortam();
  const tutar = $('[name=tutar]', kok), kod = $('[name=kod]', kok), cikti = $('.cikti', kok);
  kod.innerHTML = paraSecenekleri(o, 'USD', { tl: true, yalnizPopuler: true });
  const hedefler = ['TRY', 'EUR', 'GBP', 'CHF'];
  const git = async () => {
    const t = tutarOku(tutar.value);
    if (t == null || t < 0) { cikti.innerHTML = '<li><span class="soluk">Geçerli bir tutar yazın</span></li>'; return; }
    const kaynak = await tlKuru(o, kod.value, null, 1);
    const satirlar = [];
    for (const h of hedefler.filter(x => x !== kod.value)) {
      const hd = await tlKuru(o, h, null, 1);
      const sonuc = cevir(t, kaynak.tl, hd.tl);
      satirlar.push(`<li><span>${h === 'TRY' ? 'Türk Lirası' : o.birim[h].ad}</span><span class="sayi"><b>${sayiYaz(sonuc, h === 'TRY' ? 2 : 2)}</b> ${h === 'TRY' ? '₺' : h}</span></li>`);
    }
    cikti.innerHTML = satirlar.join('');
  };
  [tutar, kod].forEach(el => el.addEventListener('input', git)); git();
}

export async function grafikDemo(kok) {
  const o = await ortam();
  const a = await arsivYukle('USD');
  const kap = $('.g', kok), ist = $('.ist', kok);
  const g = grafik(kap, { seriler: [], yaz: v => sayiYaz(v, 2), yukseklik: 260 });
  const goster = ad => {
    const bas = aralikBaslangic(ad, o.sonTarih, o.ilkTarih);
    const satirlar = aralikSatirlari(a.gunler, bas, o.sonTarih);
    const n = indirge(satirlar, 1, 300).map(r => [r[0], r[1]]);
    g.guncelle([{ ad: 'USD/TL', renk: 'var(--seri1)', noktalar: n }], 'ABD Doları');
    const s = istatistik(satirlar, 1);
    ist.innerHTML = `<span>En yüksek <b class="sayi">${sayiYaz(s.max, 4)}</b></span><span>En düşük <b class="sayi">${sayiYaz(s.min, 4)}</b></span><span>Ortalama <b class="sayi">${sayiYaz(s.ortalama, 4)}</b></span><span>Değişim <b class="sayi">${yuzdeYaz(s.yuzde)}</b></span>`;
  };
  $$('[data-aralik]', kok).forEach(b => b.addEventListener('click', () => { $$('[data-aralik]', kok).forEach(x => x.setAttribute('aria-pressed', x === b)); goster(b.dataset.aralik); }));
  goster('90g');
}

export async function karsiDemo(kok) {
  const o = await ortam();
  const [u, e] = await Promise.all([arsivYukle('USD'), arsivYukle('EUR')]);
  const bas = aralikBaslangic('1y', o.sonTarih, o.ilkTarih);
  const yuzdeSeri = (a, ad, renk) => {
    const n = indirge(aralikSatirlari(a.gunler, bas, o.sonTarih), 1, 260);
    const t0 = n[0][1];
    return { ad, renk, noktalar: n.map(r => [r[0], (r[1] / t0 - 1) * 100]), alan: false };
  };
  const s1 = yuzdeSeri(u, 'USD', 'var(--seri1)'), s2 = yuzdeSeri(e, 'EUR', 'var(--seri2)');
  grafik($('.g', kok), { seriler: [s1, s2], yaz: v => yuzdeYaz(v, 1), yEksenYaz: v => Math.round(v) + '%', uclar: false, yukseklik: 260 });
  $('.ist', kok).innerHTML = `<span><i style="background:var(--seri1)"></i>USD <b class="sayi">${yuzdeYaz(s1.noktalar.at(-1)[1], 1)}</b></span><span><i style="background:var(--seri2)"></i>EUR <b class="sayi">${yuzdeYaz(s2.noktalar.at(-1)[1], 1)}</b></span>`;
}
