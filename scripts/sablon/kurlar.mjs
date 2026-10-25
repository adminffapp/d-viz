import { sayfa, e } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd, reklam } from './ortak.mjs';
import { satirHTML, TABLO_BASLIK, degisimHTML } from '../../public/assets/js/kur-satir.js';
import { kurYaz, sayiYaz, tarihYaz, yuzdeYaz, yuzdeDegisim } from '../../public/assets/js/hesap.js';
import { AYAR } from '../../public/assets/js/ayar.js';

export const CEVIR_TUTARLAR = [1, 5, 10, 20, 50, 100, 250, 500, 1000, 5000, 10000];
export const TL_TUTARLAR = [100, 250, 500, 1000, 5000, 10000, 50000, 100000];
export const SEO_BIRIMLER = ['USD', 'EUR', 'GBP'];

const tlBirim = (c, kod, i = 0) => (c.son.kurlar[kod] ? c.son.kurlar[kod][i] / c.birim[kod].birim : null);

function kurlarSayfasi(c) {
  const satirlar = c.meta.map(m => satirHTML(m, c.son.kurlar[m.kod], c.ozet.ozet[m.kod])).join('\n');
  const alfabe = [...c.meta].sort((a, b) => a.ad.localeCompare(b.ad, 'tr')).map(m => `<li><a href="/kur/${m.slug}/"><span class="sol"><b>${e(m.ad)}</b><span class="kucuk soluk">${m.kod} · sembol ${e(m.sembol)}${m.birim > 1 ? ` · ${m.birim} birim için` : ''}</span></span><span class="sayi">${kurYaz(c.son.kurlar[m.kod]?.[0])} ₺</span></a></li>`).join('');
  const govde = `${ustBolum({ kirintiHtml: kirinti([null, 'Kurlar']), baslik: 'Tüm döviz kurları', giris: `TCMB'nin ${e(tarihYaz(c.son.tarih))} bülteninde yayımlanan ${c.meta.length} para birimi.` })}
<div class="kap" style="padding-bottom:48px"><div id="kur-tablo" data-kur-tablo>
  <div class="tablo-arac"><div class="ara"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><label class="gizli-okur" for="kur-ara">Para birimi ara</label><input class="girdi" id="kur-ara" type="search" placeholder="Ad veya kod: dolar, EUR, sterlin" autocomplete="off"></div>
  <div class="ip" role="group" aria-label="Görünüm"><button type="button" data-gorunum="populer" aria-pressed="false">Popüler</button><button type="button" data-gorunum="tum" aria-pressed="true">Tümü</button><button type="button" data-gorunum="favori" aria-pressed="false">Favorilerim</button></div><span class="kucuk soluk" data-sayac aria-live="polite"></span></div>
  <div class="kur-tablo-kap"><table class="kur"><caption class="gizli-okur">TCMB gösterge kurları</caption>${TABLO_BASLIK}<tbody>${satirlar}</tbody></table></div>
  <div class="tablo-alt" data-kaynak><span>Kaynak: TCMB · Bülten: ${e(c.son.tarih)}</span></div>
</div></div>
${reklam('orta')}
<section class="kap bolum" aria-labelledby="alfabe-b" style="padding-top:0"><h2 id="alfabe-b" class="bolum-baslik">Alfabetik liste</h2>
<ul class="rehber-liste" style="list-style:none;padding:0">${alfabe}</ul></section>`;
  return sayfa({ yol: '/kurlar/', baslik: 'Tüm döviz kurları: TCMB gösterge kurları listesi', aciklama: `TCMB ${tarihYaz(c.son.tarih)} bülteni: dolar, euro, sterlin ve ${c.meta.length} para biriminin alış, satış kurları, günlük değişimi. Ada, koda göre arama ve sıralama.`, govde, js: ['kurlar-sayfa.js'], surum: c.surum, jsonld: [kirintiLd([['/kurlar/', 'Kurlar']], AYAR.origin)] });
}

function detaySayfasi(c, m) {
  const r = c.son.kurlar[m.kod]; if (!r) return null;
  const o = c.ozet.ozet[m.kod];
  const tl = r[0] / m.birim;
  const baslik = `${m.kisa[0].toUpperCase() + m.kisa.slice(1)} kuru (${m.kod}/TL)`;
  const birimNot = m.birim > 1 ? ` TCMB bu kuru ${m.birim} ${m.kod} için yayımlar; ${m.birim} ${m.kod} = ${kurYaz(r[0])} TL.` : '';
  const cumle = `${m.ad} bugün ${m.birim > 1 ? `${m.birim} ${m.kod} için ` : ''}${kurYaz(r[0])} TL (TCMB döviz alış, ${tarihYaz(c.son.tarih, { gun: true })} bülteni).${o && o.g1 != null ? ` Önceki bültene göre ${yuzdeYaz(o.g1)}.` : ''}${birimNot}`;
  const capraz = c.meta.filter(x => x.populer && x.kod !== m.kod && c.son.kurlar[x.kod]).slice(0, 8).map(x => {
    const v = tl / (c.son.kurlar[x.kod][0] / x.birim);
    return `<a class="cip sayi" href="/cevirici/?kaynak=${m.kod}&hedef=${x.kod}&tutar=1">1 ${m.kod} = ${sayiYaz(v, 4)} ${x.kod}</a>`;
  }).join('');
  const seo = SEO_BIRIMLER.includes(m.kod);
  const cevirBag = seo ? CEVIR_TUTARLAR.filter(n => [10, 50, 100, 500, 1000, 5000].includes(n)).map(n => `<a class="cip" href="/cevir/${n}-${m.slug}-kac-tl/">${n.toLocaleString('tr-TR')} ${m.kisa.toLowerCase()} kaç TL?</a>`).join('') : '';
  const yilBag = seo && c.yillar ? c.yillar.map(y => `<a class="cip" href="/gecmis-kur/${m.slug}/${y}/">${y} ${m.kisa.toLowerCase()} kurları</a>`).join('') : '';
  const diger = c.meta.filter(x => x.kod !== m.kod).slice(0, 10).map(x => `<a class="cip" href="/kur/${x.slug}/">${e(x.kisa)}</a>`).join('');
  const govde = `${ustBolum({ kirintiHtml: kirinti(['/kurlar/', 'Kurlar'], [null, m.ad]), baslik, giris: e(cumle) })}
<div class="kap" id="detay" data-kod="${m.kod}" style="padding-bottom:48px;display:grid;gap:24px">
  <div class="arac-izgara">
    <div class="parca" data-ui>
      <div class="parca-ic"><p class="kucuk soluk"><span class="kod" style="margin-right:6px">${m.kod}</span>${e(m.ad)} · sembol ${e(m.sembol)}</p>
        <p class="sonuc-buyuk sayi guncel-buyuk" style="margin-top:8px">${kurYaz(r[0])} ₺</p>
        <p class="sonuc-alt guncel-not">${m.birim > 1 ? m.birim + ' ' + m.kod : '1 ' + m.kod} · TCMB döviz alış · bülten ${e(tarihYaz(c.son.tarih, { gun: true }))}</p>
        <div class="zaman-fark guncel-degisim" style="padding:8px 0 0">${degisimHTML(o ? o.g1 : null)}</div>
        <div class="eylemler" style="margin-top:16px"><button class="dugme ikincil kucuk" type="button" data-fav aria-pressed="false"><span class="metin">Favorilere ekle</span></button><a class="dugme ikincil kucuk" href="/uyarilar/?kod=${m.kod}">Kur uyarısı oluştur</a><a class="dugme ikincil kucuk" href="/gecmis-kur/?kod=${m.kod}">Geçmiş tarihli hesap</a></div></div>
    </div>
    <div class="parca" data-ui>
      <div class="parca-baslik"><h2>Alış ve satış</h2><span class="kucuk soluk">Önceki bültenle</span></div>
      <div style="overflow-x:auto"><table class="veri"><thead><tr><th scope="col">Tür</th><th scope="col">Bugün</th><th scope="col" class="gizle-mobil">Önceki</th><th scope="col">Değişim</th></tr></thead><tbody class="guncel-tablo"><tr><th scope="row">Döviz alış</th><td class="sayi">${kurYaz(r[0])}</td><td></td><td></td></tr><tr><th scope="row">Döviz satış</th><td class="sayi">${kurYaz(r[1])}</td><td></td><td></td></tr></tbody></table></div>
      <p class="parca-ic kucuk soluk" style="padding-top:12px">TCMB günde bir kez bülten yayımlar; bu yüzden "değişim" bir önceki bültene göredir, son 24 saate değil. Efektif (banknot) kurlar her para biriminde yayımlanmaz.</p>
    </div>
  </div>
  <div class="parca" data-ui>
    <div class="parca-baslik"><h2>Grafik</h2>
      <div class="ip" role="group" aria-label="Zaman aralığı"><button type="button" data-aralik="7g" aria-pressed="false">7 gün</button><button type="button" data-aralik="30g" aria-pressed="false">30 gün</button><button type="button" data-aralik="90g" aria-pressed="true">90 gün</button><button type="button" data-aralik="1y" aria-pressed="false">1 yıl</button><button type="button" data-aralik="5y" aria-pressed="false">5 yıl</button><button type="button" data-aralik="tum" aria-pressed="false">Tümü</button></div></div>
    <div class="parca-ic"><div class="aralik-arac"><span class="gosterge"><label><input type="checkbox" data-seri="alis" checked> Alış</label><label><input type="checkbox" data-seri="satis"> Satış</label></span><span class="kucuk soluk">Fareyle, dokunarak ya da ok tuşlarıyla bir tarihe bakın</span></div><div class="g"></div></div>
    <dl class="istat" style="border-width:1px 0 0;border-radius:0"></dl>
  </div>
  <div class="arac-izgara">
    <div class="parca" data-ui><div class="parca-baslik"><h2>Hızlı çevirici</h2></div><div class="parca-ic"><div class="alan"><label for="mt">Tutar</label><input class="girdi sayi" id="mt" name="mt" inputmode="decimal" value="100" autocomplete="off"></div><ul class="liste-sade mini-cikti" style="margin-top:8px" aria-live="polite"></ul><div class="eylemler" style="margin-top:12px"><a class="dugme ikincil kucuk" href="/cevirici/?kaynak=${m.kod}&hedef=TRY">Gelişmiş çevirici</a></div></div></div>
    <div class="parca" data-ui><div class="parca-baslik"><h2>Çapraz kurlar</h2></div><div class="parca-ic"><div class="etiket-satir">${capraz}</div><p class="kucuk soluk" style="margin-top:12px">Çapraz kur, iki yabancı paranın TL kurlarından hesaplanır; TCMB bülteninin kendi çapraz kur sütunuyla küçük yuvarlama farkları olabilir.</p></div></div>
  </div>
  <div class="parca" data-ui>
    <div class="parca-baslik"><h2>Geçmiş kurlar tablosu</h2><span class="kucuk soluk tablo-bilgi"></span></div>
    <div class="tablo-kaydir" style="border:0;border-radius:0;max-height:480px"><table class="veri"><thead><tr><th>Tarih</th><th>Döviz alış</th><th>Döviz satış</th><th class="gizle-mobil">Efektif alış</th><th class="gizle-mobil">Efektif satış</th><th>Değişim</th></tr></thead><tbody class="tablo-govde"></tbody></table></div>
    <div class="parca-ic eylemler"><button class="dugme ikincil kucuk" type="button" data-daha>Daha fazla göster</button><button class="dugme ikincil kucuk" type="button" data-csv>Seçili dönemi CSV indir</button><button class="dugme ikincil kucuk" type="button" data-rapor>PDF raporu</button></div>
  </div>
  ${cevirBag ? `<section aria-labelledby="sk"><h2 id="sk" style="font-size:var(--t-ust);margin-bottom:12px">Sık aranan hesaplar</h2><div class="etiket-satir">${cevirBag}</div></section>` : ''}
  ${yilBag ? `<section aria-labelledby="yk"><h2 id="yk" style="font-size:var(--t-ust);margin-bottom:12px">Yıllara göre kurlar</h2><div class="etiket-satir">${yilBag}</div></section>` : ''}
  <section aria-labelledby="dk"><h2 id="dk" style="font-size:var(--t-ust);margin-bottom:12px">Diğer para birimleri</h2><div class="etiket-satir">${diger}<a class="cip" href="/kurlar/">Tümü</a></div></section>
</div>
${reklam('orta')}`;
  return sayfa({ yol: `/kur/${m.slug}/`, baslik: `${baslik}: bugün, grafik ve geçmiş`, aciklama: `${m.ad} bugün ${kurYaz(r[0])} TL (TCMB, ${tarihYaz(c.son.tarih)}). Alış, satış, 7 günden tüm arşive grafik, en yüksek ve en düşük değer, geçmiş kur tablosu ve tarihli hesaplama.`, govde, js: ['detay-sayfa.js'], surum: c.surum, jsonld: [kirintiLd([['/kurlar/', 'Kurlar'], [`/kur/${m.slug}/`, m.ad]], AYAR.origin)] });
}

export async function uret(c, ekle) {
  c.yillar = [];
  const usd = await c.arsivAl('USD');
  for (let y = Number(usd.gunler[0][0].slice(0, 4)); y <= Number(c.son.tarih.slice(0, 4)); y++) c.yillar.push(y);
  ekle('/kurlar/', kurlarSayfasi(c), { oncelik: 0.9 });
  for (const m of c.meta) { const h = detaySayfasi(c, m); if (h) ekle(`/kur/${m.slug}/`, h, { oncelik: SEO_BIRIMLER.includes(m.kod) ? 0.9 : 0.6 }); }
}
