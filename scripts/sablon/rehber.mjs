// Rehber: kısa, doğru, tek konulu yazılar. Rakam yazmaz; güncel değerler için araç bağlantısı verir.
import { sayfa, e } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd, reklam } from './ortak.mjs';
import { AYAR } from '../../public/assets/js/ayar.js';

export const YAZILAR = [
  { slug: 'kur-nedir', baslik: 'Döviz kuru nedir, nasıl belirlenir?', ozet: 'Bir paranın başka bir para cinsinden fiyatı ve fiyatı etkileyen şeyler.',
    govde: `<p>Döviz kuru, bir para biriminin başka bir para birimi cinsinden fiyatıdır. "1 dolar 40 TL" demek, bir ABD doları almak için 40 Türk lirası verilmesi gerektiği anlamına gelir (sayı örnek amaçlıdır).</p>
<h2>Kur nasıl oluşur?</h2><p>Serbest dalgalı kur rejiminde kur, piyasadaki alıcı ve satıcıların arzına ve talebine göre günün her saati değişir. Faiz farkları, enflasyon beklentisi, dış ticaret ve sermaye hareketleri, merkez bankası kararları ve haberler fiyatı etkileyen başlıca unsurlardır.</p>
<h2>Alış ve satış kuru</h2><p>Bir kurum size döviz sattığında <strong>satış</strong> kurunu, sizden döviz aldığında <strong>alış</strong> kurunu uygular. Satış kuru her zaman alış kurundan yüksektir; aradaki farka <a href="/rehber/alis-satis-farki/">alış-satış farkı</a> denir.</p>
<h2>Bu sitede kurlar</h2><p>Bu sitedeki değerler, T.C. Merkez Bankası'nın yayımladığı gösterge niteliğindeki döviz kurlarıdır. Güncel değerler için <a href="/kurlar/">kurlar sayfasına</a> bakabilirsiniz.</p>` },
  { slug: 'tcmb-kuru-ve-piyasa-kuru', baslik: 'TCMB kuru ile bankadaki ve piyasadaki kur neden farklı?', ozet: 'Gösterge kuru, banka kuru ve anlık piyasa fiyatı üç ayrı şeydir.',
    govde: `<p>TCMB, iş günlerinde bir bülten yayımlar. Bu kurlar <strong>gösterge niteliğindedir</strong>: ilgili günün belirli bir anında piyasadaki fiyatları yansıtır ve işlem yapılacak kesin fiyat değildir.</p>
<h2>Üç farklı değer</h2><ul><li><strong>TCMB gösterge kuru:</strong> Günde bir kez yayımlanan resmî referanstır. Muhasebe, değerleme ve geçmiş tarih hesaplarında yaygın kullanılır.</li><li><strong>Piyasa fiyatı:</strong> Gün içinde saniyeler içinde değişir.</li><li><strong>Banka veya büro kuru:</strong> Piyasa fiyatına kurumun kendi marjı eklenmiş hâlidir. Şubeye, kanala ve saate göre değişir.</li></ul>
<p class="not">Bu site alım satım yapmaz ve anlık piyasa fiyatı göstermez. Gerçek bir işlemden önce işlem yapacağınız kurumun güncel kurunu kontrol edin.</p>
<h2>Hangisini ne zaman kullanmalı?</h2><p>Geçmiş bir tarihteki değeri öğrenmek veya bir faturayı belgelemek için resmî gösterge kuru uygundur. Elinize geçecek tutarı tahmin etmek için kurumun satış veya alış kuru ve varsa komisyon gerekir; <a href="/cevirici/">çeviricide</a> komisyonlu net tutarı hesaplayabilirsiniz.</p>` },
  { slug: 'alis-satis-farki', baslik: 'Alış-satış farkı (makas) nedir?', ozet: 'Aynı para birimi için alış ve satış kuru neden farklıdır?',
    govde: `<p>Alış-satış farkı, bir kurumun döviz alırken ve satarken uyguladığı fiyatlar arasındaki farktır. Kurum bu fark üzerinden gelir elde eder ve kur riskini karşılar.</p>
<h2>Örnek</h2><p>Bir kurumun alış kuru 40,00 TL, satış kuru 40,50 TL ise (örnek sayılar), bir dolar alıp hemen geri satan kişi, kur hiç değişmese bile her dolarda 0,50 TL kaybeder.</p>
<h2>Etkileyen şeyler</h2><ul><li>Para biriminin piyasada ne kadar işlem gördüğü: az işlem gören dövizde fark büyür.</li><li>Kanal: mobil bankacılık, şube ve döviz bürosu farklı marjlar uygulayabilir.</li><li>Efektif (nakit) kurlar, döviz (hesap) kurlarından genellikle daha geniş farkla işlem görür.</li></ul>
<p><a href="/kur/dolar/">Dolar sayfasında</a> TCMB'nin yayımladığı dört kur türünü ayrı ayrı görebilirsiniz.</p>` },
  { slug: 'capraz-kur', baslik: 'Çapraz kur nedir, nasıl hesaplanır?', ozet: 'Euro/dolar gibi TL içermeyen çiftler iki kurdan nasıl bulunur?',
    govde: `<p>Çapraz kur, iki yabancı para biriminin birbirine oranıdır. Örneğin EUR/USD, ne kadar dolar karşılığında bir euro alındığını gösterir. TL'nin dahil olmadığı bu oran, her iki paranın TL kuruna bölünerek bulunur.</p>
<h2>Formül</h2><p>EUR/USD = (1 euronun TL değeri) ÷ (1 doların TL değeri)</p>
<h2>Örnek</h2><p>1 euro 45 TL, 1 dolar 40 TL ise (örnek sayılar) EUR/USD = 45 ÷ 40 = 1,125 olur.</p>
<h2>Neden küçük farklar görürsünüz?</h2><p>Bu siteyle uluslararası piyasa kotasyonları arasında küçük farklar olabilir; çünkü burada TCMB'nin günlük gösterge kurlarından hesaplama yapılır, piyasalar ise sürekli işlem görür.</p>
<p>İki parayı birbirine çevirmek için <a href="/cevirici/">çeviriciyi</a>, zaman içindeki değişimi görmek için <a href="/karsilastir/">karşılaştırma</a> sayfasını kullanın.</p>` },
  { slug: 'hafta-sonu-ve-tatil-kurlari', baslik: 'Hafta sonu ve resmî tatillerde kur', ozet: 'TCMB bu günlerde bülten yayımlamaz; sitede ne gösterilir?',
    govde: `<p>TCMB gösterge kurlarını yalnızca iş günlerinde yayımlar. Cumartesi, pazar ve resmî tatillerde yeni bülten yoktur.</p>
<h2>Bu sitede nasıl ele alınır?</h2><p>Bülten olmayan bir gün için hesaplama yapıldığında, o günden önceki son bülten kullanılır ve sonuçta bunun nedeni ve kullanılan bültenin tarihi yazılır. Uydurma veya ortalama bir değer üretilmez.</p>
<h2>Gerçek hayatta</h2><p>Haftanın son iş gününden sonra yabancı piyasalar açıkken kur değişebilir. Pazartesi açılan bülten bu değişimi bir arada yansıtır.</p>
<p>Tarihli hesaplama için <a href="/gecmis-kur/">geçmiş kur</a> aracını kullanabilirsiniz.</p>` },
  { slug: 'gecmis-tarihli-hesaplama', baslik: 'Geçmiş bir tarihte döviz değeri nasıl hesaplanır?', ozet: 'Bir tutarın geçmişteki ve bugünkü TL karşılığını karşılaştırmak.',
    govde: `<p>Belirli bir tarihteki değeri bulmak için o günün bülteni ile bugünkü bülten karşılaştırılır.</p>
<ol><li>Para birimini ve tutarı seçin.</li><li>Geçmiş tarihi seçin. Bülten olmayan günde önceki son bülten kullanılır.</li><li>Sonuçta o tarihteki ve bugünkü TL karşılığını, nominal ve yüzde farkı görürsünüz.</li></ol>
<h2>Dikkat edilecekler</h2><ul><li>Fark, TL cinsinden nominal değişimdir; enflasyondan arındırılmış reel değişim değildir.</li><li>Gerçek bir alım satımın getirisi kurum kuruna ve komisyona bağlıdır.</li></ul>
<p>Hesaplamak için <a href="/gecmis-kur/">geçmiş kur</a> sayfasına gidin.</p>` },
];

export async function uret(c, ekle) {
  const liste = YAZILAR.map(y => `<li><a href="/rehber/${y.slug}/"><strong>${e(y.baslik)}</strong><span>${e(y.ozet)}</span></a></li>`).join('');
  ekle('/rehber/', sayfa({ yol: '/rehber/', baslik: 'Döviz rehberi', aciklama: 'Kur, çapraz kur, alış-satış farkı ve TCMB gösterge kurları hakkında kısa ve açık anlatımlar.', surum: c.surum,
    govde: `${ustBolum({ kirintiHtml: kirinti([null, 'Rehber']), baslik: 'Rehber', giris: 'Kurla ilgili sık sorulan konular, kısa ve açık anlatımlarla.' })}<div class="kap" style="padding-bottom:56px"><ul class="rehber-liste">${liste}</ul></div>`,
    jsonld: [kirintiLd([['/rehber/', 'Rehber']], AYAR.origin)] }), { oncelik: 0.6, degisim: 'monthly' });
  for (const y of YAZILAR) {
    const yol = `/rehber/${y.slug}/`;
    ekle(yol, sayfa({ yol, baslik: y.baslik, aciklama: y.ozet, surum: c.surum,
      govde: `${ustBolum({ kirintiHtml: kirinti(['/rehber/', 'Rehber'], [null, y.baslik]), baslik: y.baslik })}<div class="kap" style="padding-bottom:48px"><article class="metin">${y.govde}</article></div>${reklam('alt')}`,
      jsonld: [kirintiLd([['/rehber/', 'Rehber'], [yol, y.baslik]], AYAR.origin), { '@context': 'https://schema.org', '@type': 'Article', headline: y.baslik, inLanguage: 'tr', dateModified: c.son.tarih, author: { '@type': 'Organization', name: 'FF-App Labs' }, mainEntityOfPage: AYAR.origin + yol }] }), { oncelik: 0.5, degisim: 'monthly' });
  }
}
