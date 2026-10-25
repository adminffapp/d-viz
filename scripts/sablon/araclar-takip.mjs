import { sayfa } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd } from './ortak.mjs';
import { AYAR } from '../../public/assets/js/ayar.js';

export async function uret(c, ekle) {
  const govde = `${ustBolum({ kirintiHtml: kirinti([null, 'Takip']), baslik: 'Takip listem ve döviz sepetim', giris: 'Favori kurlarınızı sıralayın, birden fazla para biriminden sepet kurun, toplam TL değerini bir tarihe göre karşılaştırın. Üyelik yok; veriler yalnızca bu tarayıcıda durur.' })}
<div class="kap" id="takip" style="padding-bottom:64px">
  <div class="sekmeler" role="tablist" aria-label="Takip bölümleri"><button role="tab" data-s="favori" id="t-fav" aria-controls="p-fav" aria-selected="true">Favori kurlarım</button><button role="tab" data-s="sepet" id="t-sepet" aria-controls="p-sepet" aria-selected="false" tabindex="-1">Döviz sepetim</button></div>
  <section role="tabpanel" id="p-fav" aria-labelledby="t-fav" data-s="favori" class="parca" data-ui>
    <div class="parca-baslik"><h2>Takip listem</h2><button class="dugme ikincil kucuk" type="button" data-fav-csv>CSV indir</button></div>
    <div style="overflow-x:auto"><table class="veri"><thead><tr><th scope="col">Para birimi</th><th scope="col">Alış (₺)</th><th scope="col" class="gizle-mobil">Satış (₺)</th><th scope="col">Değişim</th><th scope="col"><span class="gizli-okur">Sıra</span></th></tr></thead><tbody class="f-govde"></tbody></table></div>
  </section>
  <section role="tabpanel" id="p-sepet" aria-labelledby="t-sepet" data-s="sepet" class="parca" data-ui hidden>
    <div class="parca-baslik"><h2>Döviz sepeti</h2><div class="eylemler"><button class="dugme ikincil kucuk" type="button" data-sepet-csv>CSV</button><button class="dugme ikincil kucuk" type="button" data-sepet-rapor>PDF raporu</button><button class="dugme ikincil kucuk" type="button" data-temizle>Temizle</button></div></div>
    <div class="parca-ic s-ozet" aria-live="polite"></div>
    <div style="overflow-x:auto"><table class="veri"><thead><tr><th scope="col">Para birimi</th><th scope="col">Miktar</th><th scope="col">Bugün (₺)</th><th scope="col" class="gizle-mobil">Karşılaştırma tarihi (₺)</th><th scope="col">Değişim</th><th scope="col"><span class="gizli-okur">Sil</span></th></tr></thead><tbody class="s-govde"></tbody></table></div>
    <div class="parca-ic" style="display:grid;gap:14px;border-top:1px solid var(--cizgi)">
      <form class="s-ekle izgara-alan" novalidate style="align-items:end"><div class="alan"><label for="s-kod">Para birimi</label><select class="girdi" id="s-kod" name="yenikod"></select></div><div class="alan"><label for="s-tutar">Miktar</label><input class="girdi sayi" id="s-tutar" name="yenitutar" inputmode="decimal" placeholder="ör. 250" autocomplete="off"></div><button class="dugme" type="submit">Sepete ekle</button></form>
      <p class="hata-metni" role="alert"></p>
      <div class="alan" style="max-width:260px"><label for="s-tarih">Karşılaştırma tarihi</label><input class="girdi" type="date" id="s-tarih" name="tarih"></div>
    </div>
  </section>
  <div class="parca" data-ui style="margin-top:24px"><div class="parca-baslik"><h2>Verilerimi taşı</h2></div><div class="parca-ic"><p class="soluk" style="margin-bottom:12px">Hesap açmadan başka bir cihaza taşımak için favori, sepet ve alarmlarınızı dosya olarak indirip orada yükleyin. Hesapla giriş ve otomatik senkronizasyon bu sürümde yoktur.</p><div class="eylemler"><button class="dugme ikincil kucuk" type="button" data-hepsi-indir>Hepsini indir (JSON)</button><label class="dugme ikincil kucuk" style="cursor:pointer">Dosyadan yükle<input type="file" accept="application/json,.json" data-hepsi-yukle class="gizli-okur"></label></div></div></div>
</div>`;
  ekle('/takip/', sayfa({ yol: '/takip/', baslik: 'Takip listem ve döviz sepeti', aciklama: 'Favori kurlarınızı sıralayın, döviz sepeti oluşturun, toplam TL değerini geçmiş bir tarihle karşılaştırın. Üyelik yok; veriler tarayıcınızda kalır. CSV ve PDF dışa aktarma.', govde, js: ['takip-sayfa.js'], surum: c.surum, jsonld: [kirintiLd([['/takip/', 'Takip']], AYAR.origin)] }), { oncelik: 0.6 });
}
