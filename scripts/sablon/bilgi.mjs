// Kurumsal ve yasal sayfalar + 404. Sahte bilgi yok: olmayan şey "yok" diye yazılır.
import { sayfa, e } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd } from './ortak.mjs';
import { AYAR } from '../../public/assets/js/ayar.js';

const GUN = '25 Ekim 2026'; // yasal metinlerin son güncelleme tarihi
const SAYFALAR = [
  { slug: 'hakkimizda', baslik: 'Hakkımızda', aciklama: 'Forex, FF-App Labs tarafından hazırlanan, alım satım yapmayan bir kur ve hesaplama sitesidir.',
    govde: `<p>Forex, <a href="${AYAR.anaSite}">FF-App Labs</a> tarafından hazırlanan bir kur takip ve hesaplama sitesidir. Amacı, kuru yalnızca bir sayı olarak göstermek yerine; çevirmek, geçmişle karşılaştırmak, izlemek ve belgelemek için yan yana araçlar sunmaktır.</p>
<h2>Ne yapmaz?</h2><ul><li>Döviz alım satımı yapmaz, aracılık etmez.</li><li>Yatırım tavsiyesi vermez.</li><li>Anlık piyasa fiyatı göstermez; kaynak, günlük TCMB gösterge kurlarıdır.</li></ul>
<p>Veri kaynağı ve güncelleme düzeni için <a href="/veri-kaynagi/">veri kaynağı</a> sayfasına bakın.</p>` },
  { slug: 'veri-kaynagi', baslik: 'Veri kaynağı ve güncelleme', aciklama: 'Kurların kaynağı T.C. Merkez Bankası göstergesi kurlarıdır; güncelleme, eksik gün ve yuvarlama kuralları.',
    govde: `<h2>Kaynak</h2><p>Kurlar, T.C. Merkez Bankası'nın <a href="https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Doviz+Kurlari/Gosterge+Niteligindeki+Merkez+Bankasi+Kurlari" rel="noopener">gösterge niteliğindeki döviz kurları</a> bülteninden alınır. Bunlar resmî göstergelerdir; kurumların işlem kurları değildir.</p>
<h2>Güncelleme</h2><p>Bülten iş günlerinde yayımlanır. Site, bülten sonrası günde bir kez otomatik güncellenir. Sayfaların üstünde son bültenin tarihi gösterilir. Kaynak okunamadığında eski veri "güncel" diye sunulmaz; sayfada uyarı çıkar.</p>
<h2>Eksik günler</h2><p>Hafta sonu ve resmî tatillerde bülten yoktur. Bu günler arşivde boş bırakılır; hesaplarda önceki son bülten kullanılır ve nedeni yazılır. Ayrıntı: <a href="/rehber/hafta-sonu-ve-tatil-kurlari/">hafta sonu ve tatil kurları</a>.</p>
<h2>Değerler ve yuvarlama</h2><p>Kurlar yayımlandığı gibi saklanır, yeniden hesaplanmaz. Bazı paralar (örn. Japon yeni) 100 birim için yayımlanır; bu sitede birim açıkça yazılır. Gösterim yuvarlaması yalnızca ekranda yapılır; hesaplar tam değerle yürür.</p>
<h2>Arşiv</h2><p>Her bülten günlük olarak arşivlenir. Arşivin başlangıç tarihi ve eksik günler <a href="/yonetim/">sağlık sayfasında</a> görülebilir.</p>
<h2>Gösterge kurlar nelerdir?</h2><p>Döviz alış, döviz satış, efektif alış ve efektif satış olarak dört tür yayımlanır. Seçiminiz sitenin her yerinde geçerlidir; varsayılan "döviz alış"tır.</p>` },
  { slug: 'yasal-uyari', baslik: 'Yasal uyarı', aciklama: 'Sitedeki bilgiler yatırım tavsiyesi değildir; veriler gösterge niteliğindedir ve resmî kurumlarla bağlantımız yoktur.',
    govde: `<p class="not">Son güncelleme: ${GUN}</p>
<p>Bu sitedeki bilgiler yalnızca genel bilgilendirme amaçlıdır. Yatırım, hukuk, vergi veya muhasebe tavsiyesi değildir; yatırım danışmanlığı hizmeti de sunulmaz.</p>
<h2>Veriler</h2>
<ul><li>Kurlar T.C. Merkez Bankası'nın yayımladığı gösterge niteliğindeki kurlardır; işlem yapılabilecek alış-satış fiyatı değildir. Bankaların, kuyumcuların ve döviz bürolarının kurları farklıdır.</li>
<li>Hesaplama sonuçları tahmindir; gerçek tutar kuruma, komisyona, vergiye ve zamana göre değişir.</li>
<li>Veriler gecikebilir, eksik ya da hatalı olabilir. Karar vermeden önce resmî kaynağı ve işlem yapacağınız kurumu kontrol edin.</li></ul>
<h2>Kurumlarla ilişki</h2>
<p>Bu site T.C. Merkez Bankası'nın ya da başka bir kamu kurumunun sitesi değildir; onlarla bağlantısı, onlar tarafından onaylanması veya yetkilendirilmesi yoktur. Kurum ve marka adları yalnızca kaynağı belirtmek için kullanılır.</p>
<h2>Sorumluluk</h2>
<p>Site ve sahibi, bu bilgilere dayanarak yapılan işlemlerden ya da bilgilerin kullanılamamasından doğan doğrudan veya dolaylı zararlardan sorumlu tutulamaz. Kullanım koşulları için <a href="/kullanim-sartlari/">kullanım şartlarına</a>, kişisel veriler için <a href="/gizlilik/">gizlilik ve KVKK metnine</a> bakın.</p>
<h2>Dış bağlantılar</h2>
<p>Sitedeki dış bağlantılar (örneğin <a href="https://www.tcmb.gov.tr" rel="noopener">tcmb.gov.tr</a>) üçüncü kişilere aittir; içeriklerinden ve gizlilik uygulamalarından sorumlu değiliz.</p>` },
  { slug: 'kullanim-sartlari', baslik: 'Kullanım şartları', aciklama: 'Forex sitesinin kullanım koşulları: hizmetin kapsamı, e-posta uyarıları, fikrî haklar ve sorumluluk sınırı.',
    govde: `<p class="not">Son güncelleme: ${GUN}</p>
<p>Siteyi kullanarak aşağıdaki şartları kabul etmiş olursunuz. Kabul etmiyorsanız lütfen siteyi kullanmayın.</p>
<h2>Hizmetin kapsamı</h2>
<p>Forex, <a href="${AYAR.anaSite}">FF-App Labs</a> tarafından sunulan, T.C. Merkez Bankası gösterge kurlarıyla çalışan ücretsiz bir kur takip ve hesaplama sitesidir. Üyelik gerektirmez. Döviz alım satımı yapmaz, aracılık etmez, yatırım tavsiyesi vermez. Ayrıntı için <a href="/yasal-uyari/">yasal uyarıya</a> ve <a href="/veri-kaynagi/">veri kaynağı</a> sayfasına bakın.</p>
<h2>Doğruluk ve süreklilik</h2>
<p>Verileri doğru ve güncel sunmaya çalışırız; ancak kesintisiz, hatasız ya da belirli bir amaca uygun olduğunu garanti etmeyiz. Hizmeti önceden haber vermeden değiştirebilir, geçici ya da kalıcı olarak durdurabiliriz. Kaynak okunamadığında sayfalarda uyarı gösterilir.</p>
<h2>E-posta uyarıları</h2>
<ul><li>Uyarı, e-posta adresinizi girip onay bağlantısına tıkladığınızda başlar; tek seferliktir ve gönderildikten sonra silinir.</li>
<li>Uyarı yalnızca günlük TCMB bülteniyle karşılaştırılır. Anlık fiyat hareketlerini yakalamaz; e-posta gecikebilir, spam klasörüne düşebilir ya da hiç ulaşmayabilir. Önemli kararlarınızı bu e-postaya bağlamayın.</li>
<li>Bir adres için en fazla 5 aktif uyarı tanımlanabilir. Başkasına ait adres girmemelisiniz.</li>
<li>Her e-postadaki iptal bağlantısıyla kaydı silebilirsiniz. Kişisel verilerin işlenmesi <a href="/gizlilik/">gizlilik ve KVKK metninde</a> anlatılır.</li></ul>
<h2>Kabul edilemez kullanım</h2>
<p>Siteyi ya da uyarı servisini kötüye kullanmamalı; otomatik araçlarla aşırı istek göndermemeli, güvenliği aşmaya veya hizmeti aksatmaya çalışmamalı, başkalarının e-posta adresleriyle uyarı oluşturmamalısınız. Bu tür kullanımları engelleme hakkımız saklıdır.</p>
<h2>Fikrî haklar</h2>
<p>Sitenin tasarımı, yazılımı ve özgün metinleri FF-App Labs'a aittir. Kur verilerinin kaynağı T.C. Merkez Bankası'dır. Hesap sonuçlarını kişisel kullanımınızda serbestçe kullanabilirsiniz; sitenin kendisini izinsiz kopyalayıp yeniden yayımlamayın.</p>
<h2>Sorumluluk sınırı</h2>
<p>Yasaların izin verdiği ölçüde, site ve sahibi, siteyi kullanmaktan ya da kullanamamaktan doğan dolaylı zararlardan, kâr kaybından ve verilere dayanılarak yapılan işlemlerin sonuçlarından sorumlu değildir. Tüketici mevzuatından doğan, vazgeçilemeyen haklarınız saklıdır.</p>
<h2>Değişiklikler ve uygulanacak hukuk</h2>
<p>Bu şartları güncelleyebiliriz; güncel hâli bu sayfada yayımlanır ve yukarıdaki tarih değişir. Şartlara Türkiye Cumhuriyeti hukuku uygulanır; uyuşmazlıklarda Türkiye'deki yetkili mahkemeler ve icra daireleri yetkilidir.</p>
<h2>İletişim</h2>
<p>Sorularınız için <a href="mailto:${AYAR.eposta}">${AYAR.eposta}</a>.</p>` },
  { slug: 'gizlilik', baslik: 'Gizlilik, KVKK ve çerezler', aciklama: 'KVKK aydınlatma metni: hangi kişisel veri neden işlenir, kimlerle paylaşılır, ne kadar saklanır; çerezler ve haklarınız.',
    govde: `<p class="not">Son güncelleme: ${GUN}</p>
<p>Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) m.10 uyarınca aydınlatma yükümlülüğümüzü yerine getirmek için hazırlanmıştır ve sitenin gerçek çalışma biçimini anlatır.</p>
<h2>Veri sorumlusu</h2>
<p>Kişisel verileriniz bakımından veri sorumlusu <strong>FF-App Labs</strong>'tır. İletişim: <a href="mailto:${AYAR.eposta}">${AYAR.eposta}</a>.</p>
<h2>Üyelik yok</h2>
<p>Siteyi kullanmak için hesap açmanız ya da kişisel bilgi vermeniz gerekmez. Kur, çevirici ve grafik araçları verisiz çalışır.</p>
<h2>Hangi veriler, neden ve hangi dayanakla işlenir?</h2>
<table class="tablo-sade"><thead><tr><th>Veri</th><th>Amaç</th><th>Hukuki sebep</th><th>Saklama</th></tr></thead><tbody>
<tr><td>E-posta adresi, uyarı koşulu (para birimi, eşik, yön), onay durumu, kayıt tarihi</td><td>İstediğiniz kur uyarısını e-postayla göndermek</td><td>Talebiniz üzerine hizmetin sunulması (m.5/2-c) ve onay kutusu ile onay bağlantısıyla verdiğiniz açık rıza</td><td>Uyarı gönderilince ya da iptal edilince silinir; en geç 180 gün</td></tr>
<tr><td>E-posta adresinin ve IP adresinin tek yönlü özeti (geri döndürülemez)</td><td>Kötüye kullanımı ve aşırı denemeyi önlemek (adres başına en çok 5 uyarı; saatte en çok 6 deneme)</td><td>Meşru menfaat (m.5/2-f)</td><td>IP özeti 1 saat; e-posta özeti en çok 180 gün</td></tr>
<tr><td>Standart sunucu kayıtları (IP, zaman, adres, tarayıcı bilgisi)</td><td>Sitenin güvenli ve çalışır tutulması</td><td>Meşru menfaat (m.5/2-f); hukuki yükümlülük</td><td>Barındırma sağlayıcısının süresi kadar</td></tr>
<tr><td>Sayfa görüntüleme sayıları (kişiyi tanımlamayan toplu ölçüm)</td><td>Hangi sayfaların kullanıldığını anlamak</td><td>Meşru menfaat (m.5/2-f)</td><td>Toplu veri</td></tr></tbody></table>
<h2>Tarayıcınızda tutulanlar</h2>
<p>Favoriler, sepet, son hesaplamalar, tema tercihi ve tarayıcı uyarıları yalnızca cihazınızın tarayıcı depolamasında (localStorage) tutulur; bize gönderilmez. Tarayıcı verilerini silerek ya da sayfalardaki "tüm verilerimi sil" düğmesiyle kaldırabilirsiniz.</p>
<h2>Kişisel veriler kimlerle paylaşılır?</h2>
<p>Verileriniz satılmaz ve pazarlama için kullanılmaz. Hizmetin sunulması için şu hizmet sağlayıcılar kullanılır:</p>
<ul><li><strong>Firebase</strong> (Google): uyarı kayıtları Firebase ile saklanır.</li>
<li><strong>Resend</strong>: onay ve uyarı e-postalarının gönderilmesi.</li>
<li><strong>Vercel</strong>: sitenin barındırılması, sunucu kayıtları ve çerezsiz sayfa ölçümü (Vercel Web Analytics).</li></ul>
<p>Bu sağlayıcıların sunucuları yurt dışında bulunabilir; dolayısıyla verileriniz yurt dışına aktarılabilir. Aktarım, KVKK m.9 kapsamında öngörülen güvencelerle yapılır. Yasal bir talep olması halinde yetkili kurumlarla paylaşım yapılabilir.</p>
<h2>E-posta uyarıları nasıl işler?</h2>
<p>Adresinizi ve uyarı koşulunu girip kutuyu işaretlediğinizde size bir onay e-postası gönderilir. Bağlantıya tıklamadan adresiniz uyarı için kullanılmaz. Koşul sağlandığında tek bir e-posta gönderilir ve kayıt silinir. Her e-postadaki iptal bağlantısıyla kaydı hemen silebilirsiniz. Onaylanmayan kayıtlar da en geç 180 gün içinde silinir. Kayıtlar Firebase üzerinde saklanır; adres yalnızca uyarı göndermek için kullanılır.</p>
<h2>Çerezler ve reklam</h2>
<p>Site şu an çerez kullanmaz ve reklam göstermez. İleride reklam gösterilirse reklam sağlayıcısının çerezleri yalnızca açık tercihinizi verdikten sonra yüklenir; tercihinizi daha sonra değiştirebilirsiniz. Kabul etmezseniz araçlar aynen çalışır.</p>
<h2>KVKK m.11 kapsamındaki haklarınız</h2>
<p>Veri sorumlusuna başvurarak şunları talep edebilirsiniz: verilerinizin işlenip işlenmediğini öğrenme; işlenmişse bilgi isteme; işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme; yurt içinde ya da yurt dışında aktarıldığı üçüncü kişileri bilme; eksik veya yanlış işlenmişse düzeltilmesini isteme; KVKK'daki şartlar çerçevesinde silinmesini veya yok edilmesini isteme ve bunun aktarıldığı üçüncü kişilere bildirilmesini isteme; işlenen verilerin otomatik sistemlerle analiziyle aleyhinize bir sonuç çıkmasına itiraz etme; kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme.</p>
<h2>Başvuru yöntemi</h2>
<p>Taleplerinizi, kimliğinizi doğrulamamıza yetecek bilgiyle birlikte <a href="mailto:${AYAR.eposta}">${AYAR.eposta}</a> adresine yazabilirsiniz. Başvurunuza, talebin niteliğine göre en geç otuz gün içinde yanıt veririz. Yanıttan memnun kalmazsanız Kişisel Verileri Koruma Kurulu'na şikâyet hakkınız saklıdır.</p>
<p>Ayrıca <a href="/kullanim-sartlari/">kullanım şartları</a> ve <a href="/yasal-uyari/">yasal uyarı</a> sayfalarına bakabilirsiniz.</p>` },
  { slug: 'iletisim', baslik: 'İletişim', aciklama: 'Hata bildirimi, öneri ve veri silme talepleri için iletişim.',
    govde: `<p>Hata, eksik veri veya öneri için: <a href="mailto:${AYAR.eposta}">${AYAR.eposta}</a></p>
<p>Yanlış bir kur gördüyseniz sayfa adresini, tarihi ve beklediğiniz değeri yazmanız incelemeyi hızlandırır.</p>
<p>FF-App Labs: <a href="${AYAR.anaSite}">${AYAR.anaSite.replace('https://', '')}</a></p>` },
];

export async function uret(c, ekle) {
  for (const s of SAYFALAR) {
    const yol = `/${s.slug}/`;
    ekle(yol, sayfa({ yol, baslik: s.baslik, aciklama: s.aciklama, surum: c.surum,
      govde: `${ustBolum({ kirintiHtml: kirinti([null, s.baslik]), baslik: s.baslik })}<div class="kap" style="padding-bottom:56px"><article class="metin">${s.govde}</article></div>`,
      jsonld: [kirintiLd([[yol, s.baslik]], AYAR.origin)] }), { oncelik: 0.3, degisim: 'yearly' });
  }
  ekle('/404.html', sayfa({ yol: '/404.html', baslik: 'Sayfa bulunamadı', aciklama: 'Aradığınız sayfa bulunamadı.', noindex: true, surum: c.surum, aktif: '/404',
    govde: `${ustBolum({ baslik: 'Sayfa bulunamadı', giris: 'Adres yanlış olabilir ya da sayfa kaldırılmış olabilir.' })}<div class="kap" style="padding-bottom:64px"><div class="eylemler"><a class="dugme" href="/">Ana sayfa</a><a class="dugme ikincil" href="/kurlar/">Kurlar</a><a class="dugme ikincil" href="/cevirici/">Çevirici</a></div></div>` }), { sitemap: false });
}
