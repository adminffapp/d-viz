// Veri sağlığı paneli: herkese açık dosyalardan hesaplanır (gizli bilgi içermez). Bozuk sayfa raporu data/saglik.json'dan gelir.
import { $, kacis } from './ui.js';
import { sonYukle, durumYukle, arsivYukle, metaYukle } from './veri.js';
import { guncellikDurumu, tarihYaz, gunFarki, haftaGunu, gunEkle, yuzdeDegisim, yuzdeYaz } from './hesap.js';

const kok = $('#yonetim');
const satir = (ad, durum, ayrinti) => `<tr><th scope="row">${kacis(ad)}</th><td><span class="degisim ${durum === 'tamam' ? 'yuk' : durum === 'uyari' ? 'sabit' : 'dus'}">${durum === 'tamam' ? 'Tamam' : durum === 'uyari' ? 'Dikkat' : 'Sorun'}</span></td><td>${ayrinti}</td></tr>`;
(async () => {
  const [son, durum, meta] = await Promise.all([sonYukle(), durumYukle(), metaYukle()]);
  const kontroller = [];
  const g = guncellikDurumu(son.tarih);
  kontroller.push(satir('Veri güncelliği', g.durum === 'guncel' ? 'tamam' : g.durum === 'bekleniyor' ? 'uyari' : 'sorun', `Son bülten ${tarihYaz(son.tarih, { gun: true })}; beklenen ${tarihYaz(g.beklenen)}.`));
  kontroller.push(satir('Veri türü', son.ornek ? 'sorun' : 'tamam', son.ornek ? 'ÖRNEK veri yayında. Yayına çıkmadan gerçek arşive geçin.' : 'Gerçek TCMB verisi.'));
  if (durum) {
    kontroller.push(satir('Son kaynak kontrolü', durum.sonSonuc === 'hata' ? 'sorun' : 'tamam', `${durum.sonKontrol ? new Date(durum.sonKontrol).toLocaleString('tr-TR') : '—'}: ${kacis(durum.sonMesaj || '')}`));
    const hatalar = (durum.gecmis || []).filter(x => x.sonuc === 'hata').slice(-5);
    kontroller.push(satir('Son 60 kontrolde hata', hatalar.length ? 'uyari' : 'tamam', hatalar.length ? hatalar.map(h => `${new Date(h.zaman).toLocaleDateString('tr-TR')}: ${kacis(h.mesaj)}`).join('<br>') : 'Yok'));
  } else kontroller.push(satir('Son kaynak kontrolü', 'uyari', 'durum.json yok (ilk günlük çalışmadan sonra oluşur).'));
  // arşiv tutarlılığı
  let eksik = 0, uyum = [], anormal = [];
  for (const m of meta) {
    const a = await arsivYukle(m.kod);
    if (a.gunler.at(-1)[0] !== son.tarih) uyum.push(m.kod);
    for (let i = 1; i < a.gunler.length; i++) {
      const [t0, t1] = [a.gunler[i - 1][0], a.gunler[i][0]];
      if (gunFarki(t0, t1) > 6) eksik++;
      const d = yuzdeDegisim(a.gunler[i][1], a.gunler[i - 1][1]);
      if (d != null && Math.abs(d) > 15) anormal.push(`${m.kod} ${t1} ${yuzdeYaz(d)}`);
    }
  }
  kontroller.push(satir('Arşiv bütünlüğü', uyum.length ? 'sorun' : 'tamam', uyum.length ? `Son bülten farklı: ${uyum.join(', ')}` : `${meta.length} para biriminin arşivi aynı son tarihte bitiyor.`));
  kontroller.push(satir('Uzun boşluklar (>6 gün)', eksik ? 'uyari' : 'tamam', eksik ? `${eksik} boşluk. Resmî tatil dizileri olabilir; gerekirse arşivi yeniden indirin.` : 'Yok'));
  kontroller.push(satir('Olağan dışı sıçrama (>%15, bir bültende)', anormal.length ? 'uyari' : 'tamam', anormal.length ? kacis(anormal.slice(0, 8).join(' · ')) + (anormal.length > 8 ? ` … +${anormal.length - 8}` : '') : 'Yok'));
  $('#kontrol-govde').innerHTML = kontroller.join('');
  const sg = await fetch('/data/saglik.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null)).catch(() => null);
  $('#sayfa-saglik').innerHTML = sg ? `<p class="soluk kucuk">Son tarama: ${new Date(sg.zaman).toLocaleString('tr-TR')} · ${sg.sayfaSayisi} sayfa</p>${sg.sorunlar.length ? `<ul class="liste-sade">${sg.sorunlar.map(s => `<li><span class="sol"><b>${kacis(s.sayfa)}</b><span class="kucuk soluk">${kacis(s.sorun)}</span></span></li>`).join('')}</ul>` : '<p>Bozuk bağlantı, eksik başlık ya da yinelenen başlık bulunamadı.</p>'}` : '<p class="soluk">Henüz sayfa taraması yok. <code>npm run saglik</code> çalıştırın (günlük akış otomatik çalıştırır).</p>';
})().catch(e => { console.error(e); kok.insertAdjacentHTML('afterbegin', '<p class="hata-metni" role="alert">Veri yüklenemedi.</p>'); });
