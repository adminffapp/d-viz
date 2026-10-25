// Rapor sayfası: araçlardan gelen sonucu yazdırılabilir bir belgeye çevirir; "PDF olarak kaydet" tarayıcının yazdır penceresini kullanır.
import { $, kacis, depo } from './ui.js';
import { grafik } from './grafik.js';
import { tarihYaz, sayiYaz } from './hesap.js';

const r = depo.oku('rapor');
const kok = $('#rapor');
if (!r) {
  kok.innerHTML = '<div class="bos"><strong>Henüz bir rapor yok</strong>Çevirici, geçmiş kur, kur detayı, karşılaştırma ya da sepet sayfasındaki “PDF raporu” düğmesine basın.<p style="margin-top:12px"><a class="dugme" href="/cevirici/">Çeviriciye git</a></p></div>';
} else {
  const olusturma = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(new Date());
  kok.innerHTML = `
    <div class="yazdirma-gizle eylemler" style="margin-bottom:20px"><button class="dugme" type="button" id="yazdir">PDF olarak kaydet / yazdır</button><a class="dugme ikincil" href="javascript:history.back()">Geri dön</a></div>
    ${r.ornek ? '<p class="not-kutu" style="margin-bottom:16px"><b>Örnek veri.</b> Bu raporun kurları gerçek TCMB verisi değildir.</p>' : ''}
    <p class="kucuk soluk">Forex · ffapplabs.com</p>
    <h1>${kacis(r.baslik)}</h1>
    <p class="soluk">Oluşturulma: ${kacis(olusturma)} · Veri tarihi: ${kacis(tarihYaz(r.veriTarihi, { gun: true }))}</p>
    ${r.ozet?.length ? `<table><tbody>${r.ozet.map(([k, v]) => `<tr><th scope="row" style="width:40%">${kacis(k)}</th><td>${kacis(v)}</td></tr>`).join('')}</tbody></table>` : ''}
    ${(r.notlar || []).map(n => `<p class="not-kutu bilgi" style="margin:8px 0">${kacis(n)}</p>`).join('')}
    ${r.grafik ? `<h2 style="font-size:1.125rem;margin:24px 0 8px;font-weight:500">${kacis(r.grafik.baslik)}</h2><div id="rg" style="max-width:100%"></div>` : ''}
    ${r.tablo ? `<table><thead><tr>${r.tablo.baslik.map((b, i) => `<th class="${i ? 's' : ''}">${kacis(b)}</th>`).join('')}</tr></thead><tbody>${r.tablo.satirlar.map(s => `<tr>${s.map((h, i) => `<td class="${i ? 's' : ''}">${kacis(h)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}
    <div class="dip"><p><b>Kaynak:</b> Türkiye Cumhuriyet Merkez Bankası gösterge niteliğindeki döviz kurları (tcmb.gov.tr). Veri tarihi ${kacis(tarihYaz(r.veriTarihi))}; siteye alınma ${kacis(r.uretim ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(new Date(r.uretim)) : '—')}.</p>
    <p>Bu rapor bilgilendirme amaçlıdır; yatırım, vergi ya da muhasebe tavsiyesi değildir. Gösterge kurlar bankaların işlem kurlarından farklı olabilir. Resmî işlemlerde ilgili kurumun ya da mali müşavirinizin belirttiği kuru kullanın.</p></div>`;
  $('#yazdir').addEventListener('click', () => window.print());
  if (r.grafik && r.grafik.noktalar.length > 1) {
    const kap = $('#rg');
    grafik(kap, { seriler: [{ ad: r.grafik.baslik, renk: 'var(--seri1)', noktalar: r.grafik.noktalar }], yaz: v => sayiYaz(v, 4), yukseklik: 240, ad: r.grafik.baslik });
  }
  document.title = r.baslik + ' | Forex';
}
