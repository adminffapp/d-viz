// Tarayıcıdaki kur alarmları: sayfa açıkken ve veri yenilendiğinde kontrol edilir (sunucu gerektirmez).
// Kur seçimi saatlik-veri.js uyariKuru(): saatlik piyasa kuru, yoksa TCMB bülteni.
import { alarmlar } from './kisisel.js';
import { alarmDurumu, kurYaz, tarihYaz, yuzdeYaz } from './hesap.js';
import { toast } from './ui.js';
import { uyariKuru, saatYaz } from './saatlik-veri.js';

export const kaynakMetni = t => (t.kaynak === 'piyasa' ? `saatlik piyasa kuru, ${saatYaz(t.zaman)}` : `TCMB, ${tarihYaz(t.tarih || t.zaman)} bülteni`);

export function alarmMetni(a, birim) {
  const m = birim[a.kod];
  return a.tur === 'hedef' ? `${m ? m.kisa : a.kod} ${kurYaz(a.deger)} ₺ ${a.yon === 'altina' ? 'altına inerse' : 'üstüne çıkarsa'}` : `${m ? m.kisa : a.kod} ${kurYaz(a.baz)} ₺ düzeyinden %${a.deger} ${a.yon === 'ustu' ? 'artarsa' : a.yon === 'altina' ? 'azalırsa' : 'artarsa ya da azalırsa'}`;
}

export function kontrolEt(son, birim, saatlik = null) {
  const tetiklenen = [];
  for (const a of alarmlar.oku()) {
    if (!a.aktif || a.tetiklendi) continue;
    const s = uyariKuru(a, son, birim, saatlik); if (!s) continue;
    const kur = s.kur;
    if (alarmDurumu(a, kur).tetik) {
      const t = { tarih: s.kaynak === 'tcmb' ? s.zaman : s.zaman.slice(0, 10), zaman: s.zaman, kur, kaynak: s.kaynak };
      alarmlar.guncelle(a.id, { aktif: false, tetiklendi: t });
      tetiklenen.push({ a, kur, t });
    }
  }
  for (const { a, kur, t } of tetiklenen) {
    const baslik = `${alarmMetni(a, birim)}: şimdi ${kurYaz(kur)} ₺`;
    toast(baslik);
    if (a.tarayici && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('Forex kur uyarısı', { body: `${baslik} (${kaynakMetni(t)})`, icon: '/assets/icon-512.png', tag: a.id }); } catch { /* bazı tarayıcılar yalnızca hizmet işçisinden izin verir */ }
    }
  }
  return tetiklenen.length;
}
