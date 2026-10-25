// Tarayıcıdaki kur alarmları: sayfa açıkken ve veri yenilendiğinde kontrol edilir (sunucu gerektirmez).
import { alarmlar } from './kisisel.js';
import { alarmDurumu, kurYaz, tarihYaz, yuzdeYaz } from './hesap.js';
import { toast } from './ui.js';

export function alarmMetni(a, birim) {
  const m = birim[a.kod];
  return a.tur === 'hedef' ? `${m ? m.kisa : a.kod} ${kurYaz(a.deger)} ₺ ${a.yon === 'altina' ? 'altına inerse' : 'üstüne çıkarsa'}` : `${m ? m.kisa : a.kod} ${kurYaz(a.baz)} ₺ düzeyinden %${a.deger} ${a.yon === 'ustu' ? 'artarsa' : a.yon === 'altina' ? 'azalırsa' : 'artarsa ya da azalırsa'}`;
}

export function kontrolEt(son, birim) {
  const tetiklenen = [];
  for (const a of alarmlar.oku()) {
    if (!a.aktif || a.tetiklendi) continue;
    const r = son.kurlar[a.kod]; if (!r) continue;
    const kur = r[0] / (birim[a.kod]?.birim || 1);
    if (alarmDurumu(a, kur).tetik) {
      alarmlar.guncelle(a.id, { aktif: false, tetiklendi: { tarih: son.tarih, kur } });
      tetiklenen.push({ a, kur });
    }
  }
  for (const { a, kur } of tetiklenen) {
    const baslik = `${alarmMetni(a, birim)}: şimdi ${kurYaz(kur)} ₺`;
    toast(baslik);
    if (a.tarayici && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('FF Döviz kur uyarısı', { body: `${baslik} (TCMB, ${tarihYaz(son.tarih)})`, icon: '/assets/icon-512.png', tag: a.id }); } catch { /* bazı tarayıcılar yalnızca hizmet işçisinden izin verir */ }
    }
  }
  return tetiklenen.length;
}
