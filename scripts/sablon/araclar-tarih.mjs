import { sayfa } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd, reklam } from './ortak.mjs';
import { AYAR } from '../../public/assets/js/ayar.js';

export async function uret(c, ekle) {
  const govde = `${ustBolum({ kirintiHtml: kirinti([null, 'Tarihe göre kur']), baslik: 'Tarihe göre kur', giris: 'Fatura, defter ya da merak ettiğiniz bir günün TCMB kurunu bulun. Hafta sonu ve resmî tatil günlerinde hangi bültenin geçerli olduğu açıkça yazılır.' })}
<div class="kap" style="padding-bottom:64px"><div class="arac-izgara" id="tarih">
  <div class="parca" data-ui>
    <div class="parca-baslik"><h2>Hangi gün?</h2><span class="kucuk soluk">Arşiv: TCMB bültenleri</span></div>
    <div class="parca-ic" style="display:grid;gap:14px">
      <div class="alan"><label for="t-tarih">Tarih</label><input class="girdi" type="date" id="t-tarih" name="tarih"></div>
      <div class="alan"><label for="t-kod">Para birimi</label><select class="girdi" id="t-kod" name="kod"></select></div>
      <div class="hizli-tutar" role="group" aria-label="Hızlı tarih"><button type="button" data-geri="0">Son bülten</button><button type="button" data-geri="1">Dün</button><button type="button" data-geri="7">1 hafta önce</button><button type="button" data-geri="30">1 ay önce</button><button type="button" data-geri="365">1 yıl önce</button></div>
      <p class="hata-metni" role="alert"></p>
      <p class="kucuk soluk">Fatura ya da defter kaydında hangi günün kurunun geçerli olduğunu mali müşavirinize danışın; bu sayfa TCMB'nin yayımladığı bülten kurlarını gösterir.</p>
    </div>
  </div>
  <div style="display:grid;gap:24px;min-width:0">
    <div class="parca" data-ui>
      <div class="parca-ic" aria-live="polite">
        <p class="et t-gun">…</p>
        <p class="sonuc-buyuk sayi t-kur">…</p>
        <p class="sonuc-alt t-kaynak"></p>
        <p class="not-kutu t-not" hidden style="margin-top:12px"></p>
        <div class="zaman-fark" style="margin-top:12px"><span class="t-bugun"></span></div>
      </div>
      <div class="parca-ic eylemler" style="padding-top:0"><button class="dugme kucuk" type="button" data-kopyala>Cümleyi kopyala</button><a class="dugme ikincil kucuk t-gecmis" href="/gecmis-kur/">Tutarla hesapla</a></div>
    </div>
    <div class="parca" data-ui><div class="parca-baslik"><h2>O günün dört kuru</h2><span class="kucuk soluk t-bulten"></span></div><div class="tablo-kaydir" style="border:0;border-radius:0"><table class="veri"><thead><tr><th>Tür</th><th class="s">Kur (₺)</th></tr></thead><tbody class="t-turler"></tbody></table></div></div>
    <div class="parca" data-ui><div class="parca-baslik"><h2>Önceki ve sonraki bültenler</h2></div><div class="tablo-kaydir" style="border:0;border-radius:0"><table class="veri"><thead><tr><th>Tarih</th><th class="s">Döviz alış (₺)</th></tr></thead><tbody class="t-komsu"></tbody></table></div></div>
  </div></div></div>
${reklam('orta')}`;
  ekle('/tarihe-gore-kur/', sayfa({ yol: '/tarihe-gore-kur/', baslik: 'Tarihe göre kur: o günün TCMB dolar, euro kuru', aciklama: 'Bir tarih seçin, o günün TCMB döviz alış, satış ve efektif kurlarını görün. Hafta sonu ve tatil günlerinde hangi bültenin kullanıldığı açıkça yazılır.', govde, js: ['tarih-sayfa.js'], surum: c.surum, jsonld: [kirintiLd([['/tarihe-gore-kur/', 'Tarihe göre kur']], AYAR.origin)] }), { oncelik: 0.9 });
}
