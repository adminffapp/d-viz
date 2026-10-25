import { sayfa, e } from './layout.mjs';
import { kirinti, ustBolum, kirintiLd, reklam, HIZLI, turSecenek } from './ortak.mjs';
import { AYAR } from '../../public/assets/js/ayar.js';

function ceviriciSayfa(c) {
  const govde = `${ustBolum({ kirintiHtml: kirinti([null, 'Çevirici']), baslik: 'Döviz çevirici', giris: 'Herhangi bir para biriminden diğerine; TL, dolar, euro ve ' + c.meta.length + ' para birimi. Sonucu düzenleyerek tersini de hesaplayabilirsiniz.' })}
<div class="kap" style="padding-bottom:64px">
<div class="arac-izgara" id="cevirici">
  <div class="parca" data-ui>
    <div class="parca-baslik"><h2>Hesapla</h2><span class="kucuk soluk">Üyelik gerekmez</span></div>
    <div class="parca-ic" style="display:grid;gap:14px">
      <div class="alan"><label for="c-tutar">Tutar</label><input class="girdi sayi" id="c-tutar" name="tutar" inputmode="decimal" autocomplete="off" value="1.000"></div>
      <div class="hizli-tutar" role="group" aria-label="Hızlı tutar">${HIZLI.map(h => `<button type="button" data-hizli="${h}">${h.toLocaleString('tr-TR')}</button>`).join('')}</div>
      <div class="cevir-satir">
        <div class="alan"><label for="c-kaynak">Şundan</label><select class="girdi" id="c-kaynak" name="kaynak"></select></div>
        <button class="ikon-dugme degis" type="button" aria-label="Para birimlerini yer değiştir" title="Yer değiştir"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg></button>
        <div class="alan"><label for="c-hedef">Şuna</label><select class="girdi" id="c-hedef" name="hedef"></select></div>
      </div>
      <div class="alan"><label for="c-sonuc">Sonuç (düzenleyerek tersini bulun)</label><input class="girdi sayi" id="c-sonuc" name="sonuc" inputmode="decimal" autocomplete="off"></div>
      <p class="hata-metni" role="alert"></p>
      <details><summary style="cursor:pointer;min-height:44px;display:flex;align-items:center">Kur türü, hassasiyet, komisyon</summary>
        <div class="izgara-alan" style="margin-top:12px">
          <div class="alan"><label for="c-tur">Kur türü</label><select class="girdi" id="c-tur" name="tur">${turSecenek}</select></div>
          <div class="alan"><label for="c-hane">Ondalık hane</label><select class="girdi" id="c-hane" name="hane"><option value="0">0</option><option value="2" selected>2</option><option value="4">4</option><option value="6">6</option></select></div>
          <div class="alan"><label for="c-kom">Komisyon / kur farkı (%)</label><input class="girdi sayi" id="c-kom" name="komisyon" inputmode="decimal" placeholder="0"></div>
          <div class="alan"><label for="c-ucret">Sabit ücret (hedef birimde)</label><input class="girdi sayi" id="c-ucret" name="ucret" inputmode="decimal" placeholder="0"></div>
        </div>
        <p class="kucuk soluk" style="margin-top:10px">Komisyon, bankanızın ya da değiş tokuş noktasının TCMB kuruna eklediği farkı yansıtmak içindir. Gerçek işlem kuru için kurumunuza danışın.</p>
      </details>
      <p class="tur-uyari not-kutu" style="display:none"></p>
    </div>
  </div>
  <div style="display:grid;gap:24px;min-width:0">
    <div class="parca" data-ui>
      <div class="parca-ic">
        <p class="sonuc-buyuk sayi buyuk-sonuc" aria-live="polite">…</p>
        <p class="sonuc-alt net-bilgi"></p>
        <div class="gosterge kur-bilgi" style="margin-top:12px;color:var(--yazi)"></div>
        <p class="sonuc-alt kaynak-satir"></p>
        <div class="eylemler" style="margin-top:16px">
          <button class="dugme kucuk" type="button" data-kopyala>Sonucu kopyala</button>
          <button class="dugme ikincil kucuk" type="button" data-paylas>Paylaş</button>
          <button class="dugme ikincil kucuk" type="button" data-sepet>Sepete ekle</button>
          <button class="dugme ikincil kucuk" type="button" data-csv>CSV indir</button>
          <button class="dugme ikincil kucuk" type="button" data-rapor>PDF raporu</button>
        </div>
      </div>
    </div>
    <div class="parca" data-ui>
      <div class="parca-baslik"><h2>Aynı anda birden fazla birim</h2></div>
      <div class="parca-ic"><div class="etiket-satir hedef-chipler" role="group" aria-label="Hedef para birimleri"></div></div>
      <div class="tablo-kaydir" style="border:0;border-top:1px solid var(--cizgi);border-radius:0;max-height:360px"><table class="veri"><thead><tr><th>Para birimi</th><th>Karşılığı</th><th class="gizle-mobil">1 birim kuru</th></tr></thead><tbody class="coklu-govde"></tbody></table></div>
    </div>
    <div class="parca" data-ui>
      <div class="parca-baslik"><h2>Son hesaplamalarım</h2><button class="dugme ikincil kucuk" type="button" data-gecmis-temizle>Temizle</button></div>
      <div class="parca-ic"><ul class="liste-sade gecmis-liste"></ul><p class="kucuk soluk" style="margin-top:8px">Yalnızca bu tarayıcıda saklanır.</p></div>
    </div>
  </div>
</div>
</div>
${reklam('orta')}`;
  return sayfa({ yol: '/cevirici/', baslik: `Döviz çevirici: TL, dolar, euro ve ${c.meta.length} para birimi`, aciklama: 'TCMB gösterge kurlarıyla herhangi bir para biriminden diğerine çevirin. Çift yönlü, komisyonlu net tutar, çapraz kur, aynı anda birden fazla birim. Üyelik gerekmez.', govde, js: ['cevirici-sayfa.js'], surum: c.surum, jsonld: [kirintiLd([['/cevirici/', 'Çevirici']], AYAR.origin), { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Forex çevirici', url: AYAR.origin + '/cevirici/', applicationCategory: 'FinanceApplication', operatingSystem: 'Web', inLanguage: 'tr', offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' } }] });
}

export async function uret(c, ekle) {
  ekle('/cevirici/', ceviriciSayfa(c), { oncelik: 0.9 });
  for (const ad of ['gecmis', 'tarih', 'karsilastir', 'takip', 'uyarilar', 'rapor', 'yonetim']) {
    try { const m = await import(`./araclar-${ad}.mjs`); await m.uret(c, ekle); } catch (err) { if (err.code !== 'ERR_MODULE_NOT_FOUND') throw err; }
  }
}
