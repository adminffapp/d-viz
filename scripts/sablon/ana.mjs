import { sayfa, e } from './layout.mjs';
import { kurYaz } from '../../public/assets/js/hesap.js';
import { satirHTML, TABLO_BASLIK, degisimHTML } from '../../public/assets/js/kur-satir.js';
import { AYAR } from '../../public/assets/js/ayar.js';


const GERI = [['1a', '1 ay'], ['6a', '6 ay'], ['1y', '1 yıl'], ['3y', '3 yıl'], ['5y', '5 yıl']];

export function anaSayfa(c) {
  const { meta, son, ozet } = c;
  const liste = meta.filter(m => m.populer).sort((a, b) => a.sira - b.sira).slice(0, 5).map(m => { const r = son.kurlar[m.kod]; if (!r) return ''; return `<li><a href="/kur/${m.slug}/"><span class="kod">${m.kod}</span><span class="ad">${e(m.ad)}${m.birim > 1 ? `<small>${m.birim} ${m.kod} için</small>` : ''}</span><span class="sayi deger">${kurYaz(r[0])}</span><span class="sayi deger">${r[1] == null ? '—' : kurYaz(r[1])}</span>${degisimHTML(ozet.ozet[m.kod]?.g1)}</a></li>`; }).join('');
  const gunluk = '/tarihe-gore-kur/';
  const govde = `
<section class="hero" aria-labelledby="h1">
  <div class="kap">
    <div class="hero-izgara">
      <div class="hero-ust">
      <div class="hero-metin">
        <h1 id="h1" class="gir">Popüler kurlar</h1>
        <ul class="hero-liste gir" style="--s:1" aria-label="Popüler kurlar"><li class="hero-liste-baslik" aria-hidden="true"><span></span><span></span><span>Alış ₺</span><span>Satış ₺</span><span>Günlük</span></li>${liste}</ul>
        <a class="dugme ikincil gir" style="--s:2" href="/kurlar/">Kurlar</a>
      </div>
      <div class="madeni-sahne">
        <div class="hero-madeni" id="madeni"><img src="/assets/forex-madeni.webp" alt="FF-App Labs Forex madeni parası" width="272" height="272" decoding="async"></div>
      </div>
      <div class="hero-yazi">
        <p class="hero-etiket gir"><span>FOREX · DÖVİZ VE KUR TAKİBİ</span><i aria-hidden="true"></i></p>
        <h2 class="hero-sloganb gir" style="--s:1">Döviz kurlarını takip etmek ve para birimlerini karşılaştırmak için ihtiyacınız olan araçları <em>tek noktada</em> sunar.</h2>
      </div>
      </div>
      <div class="hero-sahne">
       <div class="sahne-grid">
        <div class="sahne-sol"><h2 class="sahne-baslik gir" aria-label="O gün dolar kaçtı?"><span aria-hidden="true" style="--r:0.803">O</span><span aria-hidden="true" style="--r:2.409">gün</span><span aria-hidden="true" style="--r:3.684">dolar</span><span aria-hidden="true" style="--r:3.821">kaçtı?</span></h2></div>
        <div class="sahne-orta">
        <p class="hero-aciklama gir" style="--s:1">Bir tutarın geçmişteki ve bugünkü TL değerini TCMB gösterge kurlarıyla karşılaştırın.</p>
        <div class="sahne-ic">
        <div class="hero-kutu">
        <a class="kutu-link" href="/gecmis-kur/" aria-label="Geçmiş tarihli hesabı aç"><span class="kutu-git">Hesapla <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
        <div class="parca zaman" data-ui id="zaman">
          <div class="parca-baslik"><h2>Geçmiş tarihli hesap</h2><span class="kucuk soluk">Döviz alış kuru</span></div>
          <div class="parca-ic">
            <div class="alanlar">
              <div class="alan"><label for="zm-tutar">Tutar</label><input class="girdi sayi" id="zm-tutar" name="tutar" inputmode="decimal" autocomplete="off" value="1.000"></div>
              <div class="alan"><label for="zm-kod">Para birimi</label><select class="girdi" id="zm-kod" name="kod" aria-label="Para birimi"><option>USD · ABD Doları</option></select></div>
              <div class="alan tarih-alan"><label for="zm-tarih">Hangi tarihte?</label><input class="girdi" type="date" id="zm-tarih" name="tarih" min="2019-01-02"></div>
            </div>
            <div class="hizli-tutar" style="margin-top:12px" role="group" aria-label="Hızlı tarih seçimi">${GERI.map(([k, ad]) => `<button type="button" data-geri="${k}" aria-pressed="${k === '1y'}">${ad} önce</button>`).join('')}</div>
            <p class="hata-metni" role="alert"></p>
          </div>
          <div class="zaman-govde">
            <div class="zaman-sonuc">
              <div><p class="et o-gun">—</p><p class="buyuk sayi o-tl">…</p><p class="et sayi o-kur">&nbsp;</p></div>
              <div><p class="et b-gun">—</p><p class="buyuk sayi b-tl">…</p><p class="et sayi b-kur">&nbsp;</p></div>
            </div>
            <div class="zaman-fark"><span class="z-degisim"></span><span class="z-cumle" aria-live="polite"></span></div>
            <p class="zaman-not z-not"></p>
            <div class="mini-grafik"><svg viewBox="0 0 400 56" preserveAspectRatio="none" role="img" aria-label="Seçilen tarihten bugüne kur çizgisi"><path class="z-yol" d="" fill="none" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          </div>
          <ul class="z-donemler" aria-label="Aynı tutar, farklı başlangıç tarihleri"></ul>
        </div>
        </div>
        </div>
        <p class="hero-not">Kaynak: Türkiye Cumhuriyet Merkez Bankası. Kurlar hafta içi her gün 15:30'dan sonra yayımlanır; hafta sonu ve tatilde bir önceki bülten geçerlidir.</p>
        </div>
       </div>
      </div>
    </div>
  </div>
  <noscript><div class="kap"><p class="not-kutu" style="margin-top:16px">Hesaplayıcı JavaScript gerektirir. Aşağıdaki tablo ve sayfalar yine de çalışır.</p></div></noscript>
</section>

<section class="blok sag" aria-labelledby="b0">
  <div class="kap"><div class="blok-grid">
    <div class="sahne-sol"><h2 class="sahne-baslik gir" id="b0" aria-label="Fatura günü hangi kurdu?"><span aria-hidden="true" style="--r:4.241">Fatura</span><span aria-hidden="true" style="--r:3.212">günü</span><span aria-hidden="true" style="--r:3.516">hangi</span><span aria-hidden="true" style="--r:4.486">kurdu?</span></h2></div>
    <div class="sahne-orta">
      <p class="hero-aciklama gir">Tarihi seçin, o günün TCMB kurunu görün. Hafta sonu ve tatil günlerinde hangi bültenin kullanıldığı açıkça yazılır.</p>
    <div class="hero-kutu" data-git="${gunluk}">
    <a class="kutu-link" href="${gunluk}" aria-label="Günlük kurları aç"><span class="kutu-git">Aç <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
    <div class="parca" data-ui data-demo="fatura">
      <div class="parca-baslik"><h3>Tarihe göre kur</h3><span class="kucuk soluk">Döviz alış</span></div>
      <div class="parca-ic"><div class="satir-esit"><div class="alan"><label>Tarih<input class="girdi" type="date" name="tarih"></label></div><div class="alan"><label>Para birimi<select class="girdi" name="kod"></select></label></div></div><div class="sonuc" style="margin-top:16px" aria-live="polite"></div></div>
    </div>
    </div>
      <p class="blok-link"><a class="baglanti" href="${gunluk}">Tarihe göre kuru bul</a></p>
    </div>
  </div></div>
</section>
<section class="blok" aria-labelledby="b1">
  <div class="kap"><div class="blok-grid">
    <div class="sahne-sol"><h2 class="sahne-baslik gir" id="b1" aria-label="Tutarı hemen çevirin"><span aria-hidden="true" style="--r:3.942">Tutarı</span><span aria-hidden="true" style="--r:3.932">hemen</span><span aria-hidden="true" style="--r:4.457">çevirin</span></h2></div>
    <div class="sahne-orta">
      <p class="hero-aciklama gir">TL, dolar, euro, sterlin ve diğerleri arasında; komisyonu düşerek net tutarı da görebilirsiniz.</p>
    <div class="hero-kutu" data-git="/cevirici/">
    <a class="kutu-link" href="/cevirici/" aria-label="Aracı aç"><span class="kutu-git">Aç <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>
    <div class="parca" data-ui data-demo="hizli">
      <div class="parca-baslik"><h3>Hızlı çevirici</h3><span class="kucuk soluk">Son bülten</span></div>
      <div class="parca-ic"><div class="satir-esit"><div class="alan"><label>Tutar<input class="girdi sayi" name="tutar" inputmode="decimal" value="1.000" autocomplete="off"></label></div><div class="alan"><label>Para birimi<select class="girdi" name="kod"></select></label></div></div><ul class="liste-sade cikti" style="margin-top:12px" aria-live="polite"></ul></div>
    </div>
    </div>
      <p class="blok-link"><a class="baglanti" href="/cevirici/">Çeviriciyi aç</a></p>
    </div>
  </div></div>
</section>
<section class="blok sag" aria-labelledby="b2">
  <div class="kap"><div class="blok-grid">
    <div class="sahne-sol"><h2 class="sahne-baslik gir" id="b2" aria-label="Grafik, en yüksek, en düşük"><span aria-hidden="true" style="--r:4.381">grafik,</span><span aria-hidden="true" style="--r:2.6">en</span><span aria-hidden="true" style="--r:4.844">yüksek,</span><span aria-hidden="true" style="--r:2.6">en</span><span aria-hidden="true" style="--r:3.849">düşük</span></h2></div>
    <div class="sahne-orta">
      <p class="hero-aciklama gir">7 günden tüm arşive: fareyle ya da ok tuşlarıyla bir tarihin değerine bakın, dönem ortalamasını görün.</p>
    <div class="parca" data-ui data-demo="grafik">
      <div class="parca-baslik"><h3>USD/TL</h3><div class="ip" role="group" aria-label="Zaman aralığı"><button type="button" data-aralik="30g" aria-pressed="false">30 gün</button><button type="button" data-aralik="90g" aria-pressed="true">90 gün</button><button type="button" data-aralik="1y" aria-pressed="false">1 yıl</button></div></div>
      <div class="parca-ic"><div class="g"></div><p class="gosterge ist" style="margin-top:12px"></p></div>
    </div>
      <p class="blok-link"><a class="baglanti" href="/kur/dolar/">Dolar kuru sayfası</a></p>
    </div>
  </div></div>
</section>
<section class="blok" aria-labelledby="b3">
  <div class="kap"><div class="blok-grid">
    <div class="sahne-sol"><h2 class="sahne-baslik gir" id="b3" aria-label="İki para birimi, tek grafik"><span aria-hidden="true" style="--r:2.6">iki</span><span aria-hidden="true" style="--r:2.886">para</span><span aria-hidden="true" style="--r:3.758">birimi,</span><span aria-hidden="true" style="--r:2.187">tek</span><span aria-hidden="true" style="--r:4.078">grafik</span></h2></div>
    <div class="sahne-orta">
      <p class="hero-aciklama gir">Aynı dönemde hangisi daha çok değişti? Yüzde olarak yan yana karşılaştırın, tabloyu CSV olarak indirin.</p>
    <div class="parca" data-ui data-demo="karsi">
      <div class="parca-baslik"><h3>Son 1 yıl, yüzde değişim</h3></div>
      <div class="parca-ic"><div class="g"></div><p class="gosterge ist" style="margin-top:12px"></p></div>
    </div>
      <p class="blok-link"><a class="baglanti" href="/karsilastir/">Karşılaştırmaya git</a></p>
    </div>
  </div></div>
</section>

<div class="kap"><div class="reklam" data-yuva="orta" aria-label="Reklam alanı"></div></div>

<section class="uyari-blok cumle-bolum" aria-labelledby="b-uyari">
  <div class="kap"><div class="uyari-grid">
    <div class="hero-kutu uyari-panel" data-git="/uyarilar/">
      <a class="kutu-link" href="/uyarilar/" aria-label="Kur uyarılarını aç"></a>
      <div class="uyari-ic">
      <form id="uyari-cumle" novalidate>
      <select class="bosluk" name="kod" aria-label="Para birimi"><option>Dolar</option></select><input class="bosluk" name="deger" inputmode="decimal" aria-label="Hedef kur (TL)" placeholder="0,00" autocomplete="off"> olunca haber <button class="son" type="submit">ver</button>
    </form>
      <p class="hero-aciklama gir">Hedef kuru yazın; sonraki adımda tarayıcı bildirimi ya da e-posta seçersiniz. Üyelik gerekmez.</p>
      </div>
    </div>
    <div class="sahne-sol"><h2 class="sahne-baslik gir" id="b-uyari" aria-label="Hedef kur gelince haber alın"><span aria-hidden="true" style="--r:6.056">Hedef kur</span><span aria-hidden="true" style="--r:4.714">gelince</span><span aria-hidden="true" style="--r:6.416">haber alın</span></h2></div>
  </div></div>
</section>`;
  return sayfa({
    yol: '/', baslik: 'FF Döviz: geçmiş tarihli kur, çevirici, grafik ve karşılaştırma', tam: true,
    aciklama: 'TCMB gösterge kurlarıyla bir tarihteki kuru bulun, tutarın o günkü ve bugünkü TL değerini hesaplayın; döviz çevirici, grafik, karşılaştırma ve kur uyarısı. Üyelik gerekmez.',
    govde, js: ['ana.js'], surum: c.surum,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FF Döviz', url: AYAR.origin + '/', applicationCategory: 'FinanceApplication', operatingSystem: 'Web', inLanguage: 'tr', offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' } }],
  });
}
