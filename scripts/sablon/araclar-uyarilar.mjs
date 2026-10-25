import { sayfa } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd } from './ortak.mjs';
import { AYAR } from '../../public/assets/js/ayar.js';

export async function uret(c, ekle) {
  const govde = `${ustBolum({ kirintiHtml: kirinti([null, 'Uyarılar']), baslik: 'Kur uyarısı oluştur', giris: 'Hedef kura ulaşıldığında ya da kur belirli bir yüzde değiştiğinde haber alın. Üyelik gerekmez.' })}
<div class="kap" id="uyari" style="padding-bottom:64px"><div class="arac-izgara">
  <form class="parca" data-ui novalidate>
    <div class="parca-baslik"><h2>Yeni uyarı</h2></div>
    <div class="parca-ic" style="display:grid;gap:14px">
      <div class="satir-esit"><div class="alan"><label for="u-kod">Para birimi</label><select class="girdi" id="u-kod" name="kod"></select></div><div class="alan"><label for="u-tur">Uyarı türü</label><select class="girdi" id="u-tur" name="tur"><option value="hedef">Hedef kur</option><option value="yuzde">Yüzde değişim</option></select></div></div>
      <p class="kucuk soluk guncel" aria-live="polite"></p>
      <div class="alan"><label for="u-yon"><span class="yon-hedef">Koşul</span><span class="yon-yuzde" hidden>Yön</span></label><select class="girdi" id="u-yon" name="yon"></select></div>
      <div class="alan"><label for="u-deger">Hedef kur (₺)</label><input class="girdi sayi" id="u-deger" name="deger" inputmode="decimal" autocomplete="off" placeholder="ör. 45,00"></div>
      <fieldset style="border:0;padding:0;display:grid;gap:8px"><legend class="kucuk soluk" style="margin-bottom:6px">Nasıl haber verelim?</legend>
        <label><input type="checkbox" name="k-tarayici" checked> Tarayıcı bildirimi <span class="kucuk soluk">(yalnızca site açıkken)</span></label>
        <label><input type="checkbox" name="k-eposta"> E-posta <span class="kucuk soluk">(site kapalıyken de, günde bir kez kontrol)</span></label>
      </fieldset>
      <div class="ep-alan" hidden style="display:grid;gap:10px"><div class="alan"><label for="u-eposta">E-posta adresi</label><input class="girdi" id="u-eposta" name="eposta" type="email" autocomplete="email" placeholder="ad@ornek.com"></div>
        <input name="web" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0">
        <label><input type="checkbox" name="onay"> Bu uyarı için e-posta adresimin işlenmesini kabul ediyorum. <a href="/gizlilik/">Gizlilik ve KVKK</a></label>
        <p class="kucuk soluk">Önce onay e-postası gelir. Uyarı tek seferliktir; tetiklenince ya da ${180} gün sonunda e-posta adresiniz silinir. Her e-postada iptal bağlantısı vardır.</p></div>
      <p class="ep-bilgi kucuk soluk"></p>
      <p class="hata-metni" role="alert"></p>
      <div><button class="dugme" type="submit">Uyarıyı kaydet</button></div>
    </div>
  </form>
  <div style="display:grid;gap:24px;min-width:0;align-content:start">
    <div class="parca" data-ui><div class="parca-baslik"><h2>Aktif uyarılarım</h2></div><div class="parca-ic"><ul class="liste-sade aktif"></ul></div></div>
    <div class="parca" data-ui><div class="parca-baslik"><h2>Tetiklenenler</h2></div><div class="parca-ic"><ul class="liste-sade bitmis"></ul></div></div>
    <p class="not-kutu bilgi">Tarayıcı bildirimi, siteyi (ya da ana ekrana eklediğiniz uygulamayı) açtığınızda ve veri yenilendiğinde kontrol edilir; site kapalıyken çalışmaz. Kapalıyken haber almak için e-posta seçin. TCMB günde bir bülten yayımladığı için uyarılar da en sık günde bir kez tetiklenir.</p>
  </div></div></div>`;
  ekle('/uyarilar/', sayfa({ yol: '/uyarilar/', baslik: 'Kur uyarısı: hedef kura ulaşınca bildirim', aciklama: 'Dolar, euro ve diğer kurlar için hedef seviye ya da yüzde değişim uyarısı oluşturun. Tarayıcı bildirimi ve çift onaylı e-posta. Üyelik gerekmez.', govde, js: ['uyarilar-sayfa.js'], surum: c.surum, jsonld: [kirintiLd([['/uyarilar/', 'Uyarılar']], AYAR.origin)] }), { oncelik: 0.6 });
}
