import { sayfa } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd, reklam } from './ortak.mjs';
import { AYAR } from '../../public/assets/js/ayar.js';

const aralikDugmeleri = `<div class="ip" role="group" aria-label="Zaman aralığı"><button type="button" data-aralik="30g" aria-pressed="false">30 gün</button><button type="button" data-aralik="90g" aria-pressed="false">90 gün</button><button type="button" data-aralik="1y" aria-pressed="true">1 yıl</button><button type="button" data-aralik="5y" aria-pressed="false">5 yıl</button><button type="button" data-aralik="tum" aria-pressed="false">Tümü</button></div>`;
const eylem = `<div class="eylemler"><button class="dugme ikincil kucuk" type="button" data-csv>CSV indir</button><button class="dugme ikincil kucuk" type="button" data-rapor>PDF raporu</button></div>`;

export async function uret(c, ekle) {
  const govde = `${ustBolum({ kirintiHtml: kirinti([null, 'Karşılaştır']), baslik: 'Kur karşılaştırma ve analiz', giris: 'İki para birimini, iki dönemi ya da bir tutarın değerini yan yana koyun; yükselen ve düşenleri görün.' })}
<div class="kap" id="karsi" style="padding-bottom:64px">
  <div class="sekmeler" role="tablist" aria-label="Karşılaştırma türleri">
    <button role="tab" data-s="iki" id="t-iki" aria-controls="p-iki" aria-selected="true">İki para birimi</button>
    <button role="tab" data-s="donem" id="t-donem" aria-controls="p-donem" aria-selected="false" tabindex="-1">Farklı dönemler</button>
    <button role="tab" data-s="deger" id="t-deger" aria-controls="p-deger" aria-selected="false" tabindex="-1">Tutarın değer değişimi</button>
    <button role="tab" data-s="siralama" id="t-siralama" aria-controls="p-siralama" aria-selected="false" tabindex="-1">Yükselen, düşen, değişim tabloları</button>
  </div>

  <section role="tabpanel" id="p-iki" aria-labelledby="t-iki" data-s="iki" class="parca" data-ui>
    <div class="parca-baslik"><h2>Hangisi daha çok değişti?</h2>${aralikDugmeleri}</div>
    <div class="parca-ic"><div class="satir-esit" style="max-width:520px;margin-bottom:16px"><div class="alan"><label for="k-a">Birinci</label><select class="girdi" id="k-a" name="a"></select></div><div class="alan"><label for="k-b">İkinci</label><select class="girdi" id="k-b" name="b"></select></div></div>
      <div class="g"></div>
      <p class="cumle" style="margin-top:16px" aria-live="polite"></p>
      <div class="kur-tablo-kap" style="margin-top:16px;overflow-x:auto"><table class="veri"><thead><tr><th scope="col">Para birimi</th><th scope="col">Dönem değişimi</th><th scope="col">En düşük</th><th scope="col">En yüksek</th><th scope="col">Ortalama</th></tr></thead><tbody class="ist-govde"></tbody></table></div>
      <div style="margin-top:16px">${eylem}</div></div>
  </section>

  <section role="tabpanel" id="p-donem" aria-labelledby="t-donem" data-s="donem" class="parca" data-ui hidden>
    <div class="parca-baslik"><h2>İki dönemi karşılaştırın</h2></div>
    <div class="parca-ic" style="display:grid;gap:14px"><div class="alan" style="max-width:320px"><label for="d-kod">Para birimi</label><select class="girdi" id="d-kod" name="kod"></select></div>
      <div class="izgara-alan"><div class="alan"><label for="d-a1">1. dönem başlangıç</label><input class="girdi" type="date" id="d-a1" name="a1"></div><div class="alan"><label for="d-a2">1. dönem bitiş</label><input class="girdi" type="date" id="d-a2" name="a2"></div><div class="alan"><label for="d-b1">2. dönem başlangıç</label><input class="girdi" type="date" id="d-b1" name="b1"></div><div class="alan"><label for="d-b2">2. dönem bitiş</label><input class="girdi" type="date" id="d-b2" name="b2"></div></div>
      <p class="hata-metni" role="alert"></p>
      <div style="overflow-x:auto"><table class="veri"><thead><tr><th scope="col">Dönem</th><th scope="col">Bülten tarihleri</th><th scope="col">Kur (₺)</th><th scope="col">Değişim</th></tr></thead><tbody class="govde"></tbody></table></div>
      <p class="cumle" aria-live="polite"></p></div>
  </section>

  <section role="tabpanel" id="p-deger" aria-labelledby="t-deger" data-s="deger" class="parca" data-ui hidden>
    <div class="parca-baslik"><h2>Bir tutar geçmişten bugüne ne oldu?</h2></div>
    <div class="parca-ic" style="display:grid;gap:14px"><div class="izgara-alan" style="max-width:720px"><div class="alan"><label for="v-tutar">Tutar</label><input class="girdi sayi" id="v-tutar" name="tutar" inputmode="decimal" value="100.000" autocomplete="off"></div><div class="alan"><label for="v-kod">Para birimi</label><select class="girdi" id="v-kod" name="kod"></select></div><div class="alan"><label for="v-tarih">Başlangıç tarihi</label><input class="girdi" type="date" id="v-tarih" name="tarih"></div></div>
      <p class="hata-metni" role="alert"></p>
      <div style="overflow-x:auto"><table class="veri"><thead><tr><th scope="col">Hangi birimle ölçülürse</th><th scope="col">Başlangıç (<span class="bas1"></span>)</th><th scope="col">Son bülten (<span class="bas2"></span>)</th><th scope="col">Değişim</th></tr></thead><tbody class="govde"></tbody></table></div>
      <p class="cumle" aria-live="polite"></p>${eylem}</div>
  </section>

  <section role="tabpanel" id="p-siralama" aria-labelledby="t-siralama" data-s="siralama" class="parca" data-ui hidden>
    <div class="parca-baslik"><h2>En çok yükselen ve düşenler</h2><div class="alan" style="min-width:150px"><label class="gizli-okur" for="s-donem">Dönem</label><select class="girdi" id="s-donem" name="donem"><option value="g1">Bir önceki bülten</option><option value="g7">7 gün</option><option value="g30" selected>30 gün</option><option value="g90">90 gün</option><option value="g365">1 yıl</option></select></div></div>
    <div class="parca-ic"><div class="arac-izgara" style="grid-template-columns:1fr 1fr;gap:24px"><div><h3 style="margin-bottom:8px">Yükselenler</h3><ul class="liste-sade yuk"></ul></div><div><h3 style="margin-bottom:8px">Düşenler</h3><ul class="liste-sade dus"></ul></div></div>
      <h3 style="margin:28px 0 8px">Günlük, haftalık, aylık, yıllık değişim</h3>
      <div class="kur-tablo-kap" style="overflow-x:auto"><table class="veri" style="min-width:560px"><thead><tr><th scope="col">Para birimi</th><th scope="col">1 gün</th><th scope="col">7 gün</th><th scope="col">30 gün</th><th scope="col">90 gün</th><th scope="col">1 yıl</th></tr></thead><tbody class="tum-govde"></tbody></table></div>
      <p class="kucuk soluk not" style="margin-top:10px"></p><div style="margin-top:12px">${eylem}</div></div>
  </section>
</div>
${reklam('orta')}`;
  ekle('/karsilastir/', sayfa({ yol: '/karsilastir/', baslik: 'Kur karşılaştırma: dolar euro, dönemler, yükselen ve düşenler', aciklama: 'USD/TL ile EUR/TL grafiklerini karşılaştırın, dönemlerin yüzde değişimini bulun, en çok yükselen ve düşen paraları görün. CSV ve PDF dışa aktarma.', govde, js: ['karsilastir-sayfa.js'], surum: c.surum, jsonld: [kirintiLd([['/karsilastir/', 'Karşılaştır']], AYAR.origin)] }), { oncelik: 0.8 });
}
