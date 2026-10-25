// Kullanıcı ihtiyacına göre üretilen sayfalar: "100 dolar kaç TL?" ve "2024 dolar kurları".
import { sayfa, e } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd, reklam } from './ortak.mjs';
import { CEVIR_TUTARLAR, TL_TUTARLAR, SEO_BIRIMLER } from './kurlar.mjs';
import { kurYaz, sayiYaz, sayiSerbest, tarihYaz, yuzdeYaz, yuzdeDegisim, istatistik, AYLAR, aylikSon } from '../../public/assets/js/hesap.js';
import { degisimHTML } from '../../public/assets/js/kur-satir.js';
import { AYAR } from '../../public/assets/js/ayar.js';

const bin = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const kucuk = s => s.toLocaleLowerCase('tr');

function dovizTL(c, m, n) {
  const r = c.son.kurlar[m.kod]; const tl = r[0] / m.birim;
  const yol = `/cevir/${n}-${m.slug}-kac-tl/`;
  const deger = n * tl;
  const komsu = CEVIR_TUTARLAR.filter(x => x !== n).map(x => `<tr><td><a href="/cevir/${x}-${m.slug}-kac-tl/">${bin(x)} ${kucuk(m.kisa)}</a></td><td class="sayi">${sayiYaz(x * tl, 2)} ₺</td></tr>`).join('');
  const govde = `${ustBolum({ kirintiHtml: kirinti(['/kurlar/', 'Kurlar'], [`/kur/${m.slug}/`, m.kisa], [null, `${bin(n)} ${kucuk(m.kisa)} kaç TL`]), baslik: `${bin(n)} ${kucuk(m.kisa)} kaç TL?`, giris: `${bin(n)} ${m.kod} = ${sayiYaz(deger, 2)} TL (TCMB döviz alış, ${e(tarihYaz(c.son.tarih, { gun: true }))} bülteni).` })}
<div class="kap" style="padding-bottom:48px;display:grid;gap:24px;max-width:var(--sayfa)">
  <div class="parca" data-ui><div class="parca-ic"><p class="sonuc-buyuk sayi">${bin(n)} ${m.kod} = ${sayiYaz(deger, 2)} ₺</p><p class="sonuc-alt">1 ${m.kod} = ${kurYaz(tl)} ₺ · Döviz satış kuruyla ${sayiYaz(n * c.son.kurlar[m.kod][1] / m.birim, 2)} ₺ · Kaynak: TCMB gösterge kuru</p>
    <div class="eylemler" style="margin-top:16px"><a class="dugme" href="/cevirici/?tutar=${n}&kaynak=${m.kod}&hedef=TRY">Başka bir tutarla hesapla</a><a class="dugme ikincil" href="/gecmis-kur/?tutar=${n}&kod=${m.kod}">Geçmiş tarihli hesap</a><a class="dugme ikincil" href="/kur/${m.slug}/">${e(m.kisa)} kuru ve grafik</a></div></div></div>
  <div class="metin"><p>Tutar, TCMB'nin her iş günü yayımladığı gösterge niteliğindeki döviz alış kuruyla çarpılarak bulunur. Bankalar ve döviz büroları kendi alış ve satış kurlarını uyguladığı için elinize geçecek tutar farklı olabilir; komisyonlu net tutarı <a href="/cevirici/?tutar=${n}&kaynak=${m.kod}&hedef=TRY">çeviricide</a> hesaplayabilirsiniz.</p></div>
  <div class="parca" data-ui><div class="parca-baslik"><h2>Diğer tutarlar</h2></div><div style="max-height:420px;overflow:auto"><table class="veri"><thead><tr><th>Tutar</th><th>TL karşılığı</th></tr></thead><tbody>${komsu}</tbody></table></div></div>
</div>${reklam('orta')}`;
  return sayfa({ yol, baslik: `${bin(n)} ${kucuk(m.kisa)} kaç TL? (${tarihYaz(c.son.tarih)})`, aciklama: `${bin(n)} ${kucuk(m.kisa)} (${m.kod}) bugün ${sayiYaz(deger, 2)} TL eder. TCMB döviz alış kuru ${kurYaz(tl)} TL, ${tarihYaz(c.son.tarih)} bülteni. Diğer tutarlar ve tarihli hesaplama.`, govde, surum: c.surum, jsonld: [kirintiLd([['/kurlar/', 'Kurlar'], [`/kur/${m.slug}/`, m.kisa], [yol, `${bin(n)} ${kucuk(m.kisa)} kaç TL`]], AYAR.origin)] });
}
function tlDoviz(c, m, n) {
  const r = c.son.kurlar[m.kod]; const tl = r[0] / m.birim;
  const yol = `/cevir/${n}-tl-kac-${m.slug}/`;
  const deger = n / tl;
  const komsu = TL_TUTARLAR.filter(x => x !== n).map(x => `<tr><td><a href="/cevir/${x}-tl-kac-${m.slug}/">${bin(x)} TL</a></td><td class="sayi">${sayiYaz(x / tl, 2)} ${m.kod}</td></tr>`).join('');
  const govde = `${ustBolum({ kirintiHtml: kirinti(['/kurlar/', 'Kurlar'], [`/kur/${m.slug}/`, m.kisa], [null, `${bin(n)} TL kaç ${kucuk(m.kisa)}`]), baslik: `${bin(n)} TL kaç ${kucuk(m.kisa)}?`, giris: `${bin(n)} TL = ${sayiYaz(deger, 2)} ${m.kod} (TCMB döviz alış, ${e(tarihYaz(c.son.tarih, { gun: true }))} bülteni).` })}
<div class="kap" style="padding-bottom:48px;display:grid;gap:24px">
  <div class="parca" data-ui><div class="parca-ic"><p class="sonuc-buyuk sayi">${bin(n)} ₺ = ${sayiYaz(deger, 2)} ${m.kod}</p><p class="sonuc-alt">1 ${m.kod} = ${kurYaz(tl)} ₺ · Kaynak: TCMB gösterge kuru</p>
    <div class="eylemler" style="margin-top:16px"><a class="dugme" href="/cevirici/?tutar=${n}&kaynak=TRY&hedef=${m.kod}">Başka bir tutarla hesapla</a><a class="dugme ikincil" href="/gecmis-kur/?tutar=${n}&kod=${m.kod}&yon=tl">Geçmiş tarihli hesap</a></div></div></div>
  <div class="metin"><p>TL tutarı, TCMB döviz alış kuruna bölünerek bulunur. Gerçek alım işleminde kuruma göre satış kuru ve komisyon uygulanır; sonuç bu sayfadaki değerden daha az olabilir.</p></div>
  <div class="parca" data-ui><div class="parca-baslik"><h2>Diğer tutarlar</h2></div><table class="veri"><thead><tr><th>Tutar</th><th>Karşılığı</th></tr></thead><tbody>${komsu}</tbody></table></div>
</div>${reklam('orta')}`;
  return sayfa({ yol, baslik: `${bin(n)} TL kaç ${kucuk(m.kisa)}? (${tarihYaz(c.son.tarih)})`, aciklama: `${bin(n)} TL bugün ${sayiYaz(deger, 2)} ${m.kod} eder. TCMB döviz alış kuru ${kurYaz(tl)} TL, ${tarihYaz(c.son.tarih)} bülteni.`, govde, surum: c.surum, jsonld: [kirintiLd([['/kurlar/', 'Kurlar'], [`/kur/${m.slug}/`, m.kisa], [yol, `${bin(n)} TL kaç ${kucuk(m.kisa)}`]], AYAR.origin)] });
}

async function yilSayfasi(c, m, yil) {
  const a = await c.arsivAl(m.kod);
  const satirlar = a.gunler.filter(r => r[0].startsWith(String(yil)));
  if (satirlar.length < 5) return null;
  const s = istatistik(satirlar, 1);
  const aylik = aylikSon(satirlar, 1);
  const yol = `/gecmis-kur/${m.slug}/${yil}/`;
  const onceki = a.gunler.filter(r => r[0] < `${yil}-01-01`).at(-1);
  const yillikDeg = onceki ? yuzdeDegisim(s.son, onceki[1]) : s.yuzde;
  const kismi = String(yil) === c.son.tarih.slice(0, 4);
  const aySatir = aylik.map(r => { const ay = Number(r[0].slice(5, 7)) - 1; return `<tr><td>${AYLAR[ay]}${kismi && r[0] === satirlar.at(-1)[0] ? ' (son bülten)' : ' sonu'}</td><td>${tarihYaz(r[0], { kisa: true })}</td><td class="sayi">${kurYaz(r[1])}</td></tr>`; }).join('');
  const gun = [...satirlar].reverse().map(r => `<tr><td>${tarihYaz(r[0], { gun: true })}</td><td class="sayi">${kurYaz(r[1])}</td><td class="sayi">${kurYaz(r[2])}</td></tr>`).join('');
  const komsu = c.yillar.map(y => y === yil ? `<span class="cip" aria-current="page">${y}</span>` : `<a class="cip" href="/gecmis-kur/${m.slug}/${y}/">${y}</a>`).join('');
  const govde = `${ustBolum({ kirintiHtml: kirinti(['/kurlar/', 'Kurlar'], [`/kur/${m.slug}/`, m.kisa], [null, String(yil)]), baslik: `${yil} ${kucuk(m.kisa)} kurları`, giris: `${m.ad} ${yil} yılında ${kurYaz(s.min)} ile ${kurYaz(s.max)} TL arasında işlem gördü; yılın ilk bülteninden sonuncusuna ${yuzdeYaz(s.yuzde)} değişti.${m.birim > 1 ? ` (${m.birim} ${m.kod} için)` : ''}` })}
<div class="kap" style="padding-bottom:48px;display:grid;gap:24px">
  <dl class="istat"><div><dt>Yıl içi değişim</dt><dd class="sayi">${degisimHTML(s.yuzde)}<small>${kurYaz(s.ilk)} → ${kurYaz(s.son)}</small></dd></div><div><dt>En yüksek</dt><dd class="sayi">${kurYaz(s.max)}<small>${tarihYaz(s.maxTarih)}</small></dd></div><div><dt>En düşük</dt><dd class="sayi">${kurYaz(s.min)}<small>${tarihYaz(s.minTarih)}</small></dd></div><div><dt>Ortalama</dt><dd class="sayi">${kurYaz(s.ortalama)}<small>${s.n} bülten</small></dd></div></dl>
  <div class="etiket-satir">${komsu}</div>
  <div class="eylemler"><a class="dugme" href="/gecmis-kur/?kod=${m.kod}&tarih=${yil}-01-02">Bu yıldan bugüne hesapla</a><a class="dugme ikincil" href="/kur/${m.slug}/">${e(m.kisa)} grafiği</a></div>
  <div class="arac-izgara"><div class="parca" data-ui><div class="parca-baslik"><h2>Ay sonu kurları</h2></div><table class="veri"><thead><tr><th>Ay</th><th>Bülten</th><th>Döviz alış</th></tr></thead><tbody>${aySatir}</tbody></table></div>
  <div class="parca" data-ui><div class="parca-baslik"><h2>Günlük kurlar</h2></div><div class="tablo-kaydir" style="border:0;border-radius:0;max-height:560px"><table class="veri"><thead><tr><th>Tarih</th><th>Döviz alış</th><th>Döviz satış</th></tr></thead><tbody>${gun}</tbody></table></div></div></div>
  <p class="kucuk soluk">Kaynak: TCMB gösterge niteliğindeki döviz kurları. Hafta sonu ve resmî tatillerde bülten yayımlanmaz; bu günler tabloda yer almaz.</p>
</div>${reklam('orta')}`;
  return sayfa({ yol, baslik: `${yil} ${kucuk(m.kisa)} kurları: günlük ve aylık tablo`, aciklama: `${yil} yılı ${kucuk(m.kisa)} (${m.kod}/TL) TCMB kurları: en yüksek ${kurYaz(s.max)}, en düşük ${kurYaz(s.min)}, yıl içi değişim ${yuzdeYaz(s.yuzde)}. Günlük bülten tablosu ve ay sonu kurları.`, govde, surum: c.surum, jsonld: [kirintiLd([['/kurlar/', 'Kurlar'], [`/kur/${m.slug}/`, m.kisa], [yol, String(yil)]], AYAR.origin)] });
}

export async function uret(c, ekle) {
  for (const kod of SEO_BIRIMLER) {
    const m = c.birim[kod];
    for (const n of CEVIR_TUTARLAR) ekle(`/cevir/${n}-${m.slug}-kac-tl/`, dovizTL(c, m, n), { oncelik: 0.5 });
    for (const n of TL_TUTARLAR) ekle(`/cevir/${n}-tl-kac-${m.slug}/`, tlDoviz(c, m, n), { oncelik: 0.4 });
    for (const y of c.yillar) { const h = await yilSayfasi(c, m, y); if (h) ekle(`/gecmis-kur/${m.slug}/${y}/`, h, { oncelik: 0.5, degisim: String(y) === c.son.tarih.slice(0, 4) ? 'daily' : 'yearly' }); }
  }
}
