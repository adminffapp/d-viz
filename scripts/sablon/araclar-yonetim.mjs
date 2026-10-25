import { sayfa } from './layout.mjs';
import { ustBolum } from './ortak.mjs';
export async function uret(c, ekle) {
  const govde = `${ustBolum({ baslik: 'Veri ve sayfa sağlığı', giris: 'Kaynak kontrolü, arşiv bütünlüğü ve sayfa taraması. Herkese açık verilerden hesaplanır; gizli bilgi içermez.' })}
<div class="kap" id="yonetim" style="padding-bottom:64px;display:grid;gap:24px">
  <div class="parca" data-ui><div class="parca-baslik"><h2>Veri kontrolleri</h2></div><div style="overflow-x:auto"><table class="veri"><thead><tr><th scope="col">Kontrol</th><th scope="col">Durum</th><th scope="col" style="text-align:left">Ayrıntı</th></tr></thead><tbody id="kontrol-govde"><tr><td colspan="3" class="bos">Kontrol ediliyor…</td></tr></tbody></table></div></div>
  <div class="parca" data-ui><div class="parca-baslik"><h2>Sayfa taraması</h2></div><div class="parca-ic" id="sayfa-saglik"></div></div>
</div>`;
  ekle('/yonetim/', sayfa({ yol: '/yonetim/', baslik: 'Veri ve sayfa sağlığı', aciklama: 'Veri kaynağı ve sayfa sağlığı kontrolleri.', govde, js: ['yonetim.js'], surum: c.surum, noindex: true }), { sitemap: false });
}
