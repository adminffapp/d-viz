import { sayfa } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd, reklam, turSecenek } from './ortak.mjs';
import { AYAR } from '../../public/assets/js/ayar.js';

export async function uret(c, ekle) {
  const govde = `${ustBolum({ kirintiHtml: kirinti([null, 'Geçmiş kur']), baslik: 'Geçmiş tarihli kur hesabı', giris: 'Bir tutarın iki tarihteki TL (ya da döviz) karşılığını bulun; nominal ve yüzde değişimi, grafiği ve günlük tabloyu görün.' })}
<div class="kap" style="padding-bottom:64px"><div class="arac-izgara" id="gecmis">
  <div class="parca" data-ui>
    <div class="parca-baslik"><h2>Hesapla</h2><span class="kucuk soluk">Arşiv: TCMB bültenleri</span></div>
    <div class="parca-ic" style="display:grid;gap:14px">
      <div class="alan"><label for="g-yon">Ne hesaplansın?</label><select class="girdi" id="g-yon" name="yon"><option value="doviz">Döviz tutarının TL karşılığı</option><option value="tl">TL tutarının döviz karşılığı</option></select></div>
      <div class="satir-esit"><div class="alan"><label for="g-tutar">Tutar</label><input class="girdi sayi" id="g-tutar" name="tutar" inputmode="decimal" value="1.000" autocomplete="off"></div><div class="alan"><label for="g-kod">Para birimi</label><select class="girdi" id="g-kod" name="kod"></select></div></div>
      <div class="satir-esit"><div class="alan"><label for="g-t1">Başlangıç tarihi</label><input class="girdi" type="date" id="g-t1" name="tarih1"></div><div class="alan"><label for="g-t2">Bitiş tarihi</label><input class="girdi" type="date" id="g-t2" name="tarih2"></div></div>
      <div class="hizli-tutar" role="group" aria-label="Hızlı dönem"><button type="button" data-hizli-tarih="1a">Son 1 ay</button><button type="button" data-hizli-tarih="6a">6 ay</button><button type="button" data-hizli-tarih="1y">1 yıl</button><button type="button" data-hizli-tarih="3y">3 yıl</button><button type="button" data-hizli-tarih="5y">5 yıl</button></div>
      <div class="alan"><label for="g-tur">Kur türü</label><select class="girdi" id="g-tur" name="tur">${turSecenek}</select></div>
      <p class="hata-metni" role="alert"></p>
      <p class="kucuk soluk">Hafta sonu ve resmî tatillerde TCMB bülten yayımlamaz; böyle bir tarih seçerseniz bir önceki bülten kullanılır ve bu açıkça yazılır. Fatura ya da defter kaydında hangi günün kurunun geçerli olduğunu mali müşavirinize sorun.</p>
    </div>
  </div>
  <div style="display:grid;gap:24px;min-width:0">
    <div class="parca" data-ui>
      <div class="zaman-sonuc sonuc-iki" aria-live="polite" style="margin-top:0;border-top:0"><div><p class="et">…</p><p class="buyuk">…</p></div><div></div></div>
      <div class="zaman-fark fark-satir"></div>
      <p class="parca-ic cumle" style="padding-top:0;padding-bottom:8px"></p>
      <div class="parca-ic notlar not-kutu" hidden style="margin:0 18px 12px;padding:10px 14px"></div>
      <p class="zaman-not kaynak-satir"></p>
      <div class="parca-ic eylemler" style="padding-top:0"><button class="dugme kucuk" type="button" data-kopyala>Cümleyi kopyala</button><button class="dugme ikincil kucuk" type="button" data-paylas>Paylaş</button><button class="dugme ikincil kucuk" type="button" data-csv>CSV indir</button><button class="dugme ikincil kucuk" type="button" data-rapor>PDF raporu</button></div>
    </div>
    <div class="parca" data-ui><div class="parca-baslik"><h2>Seçilen dönemde kur</h2></div><div class="parca-ic"><div class="g"></div></div></div>
    <div class="parca" data-ui><div class="parca-baslik"><h2>Günlük bültenler</h2><span class="kucuk soluk tablo-bilgi"></span></div><div class="tablo-kaydir" style="border:0;border-radius:0;max-height:360px"><table class="veri"><thead><tr><th>Tarih</th><th>Kur (₺)</th></tr></thead><tbody class="tablo-govde"></tbody></table></div></div>
  </div></div></div>
${reklam('orta')}`;
  ekle('/gecmis-kur/', sayfa({ yol: '/gecmis-kur/', baslik: 'Geçmiş tarihli kur hesabı: tarihe göre dolar, euro, sterlin', aciklama: 'Geçmiş bir tarihteki TCMB kuruyla tutar hesaplayın; iki tarih arasındaki nominal ve yüzde değişimi, grafiği ve günlük kur tablosunu görün. Hafta sonu ve tatil günleri doğru açıklanır.', govde, js: ['gecmis-sayfa.js'], surum: c.surum, jsonld: [kirintiLd([['/gecmis-kur/', 'Geçmiş kur']], AYAR.origin)] }), { oncelik: 0.95 });
}
