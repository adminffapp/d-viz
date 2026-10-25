// Onaylı e-posta uyarılarını son bültenle karşılaştırır, koşulu sağlayanlara tek seferlik e-posta yollar ve kaydı siler.
// GitHub Actions günlük akışında, veri güncellendikten sonra çalışır. Gizli anahtarlar ortam değişkenlerindedir.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { VERI } from './lib/veri.mjs';
import { yapilandirildi, komut, epostaGonder, kayitAnahtar, ORIGIN, kacis, ozet } from '../api/_ortak.js';
import { alarmDurumu, kurYaz, tarihYaz } from '../public/assets/js/hesap.js';

export async function calistir() {
  if (!yapilandirildi()) { console.log('E-posta uyarı servisi yapılandırılmamış (UPSTASH_*, RESEND_*); atlandı.'); return { gonderilen: 0, atlandi: true }; }
  const son = JSON.parse(await readFile(path.join(VERI, 'son.json'), 'utf8'));
  if (son.ornek) { console.log('Örnek veri: uyarı gönderilmez.'); return { gonderilen: 0, atlandi: true }; }
  const meta = JSON.parse(await readFile(path.join(VERI, 'meta.json'), 'utf8'));
  const birim = Object.fromEntries(meta.map(m => [m.kod, m]));
  const idler = (await komut(['SMEMBERS', 'uyarilar'])) || [];
  let gonderilen = 0, hata = 0;
  for (const id of idler) {
    try {
      const ham = await komut(['GET', kayitAnahtar(id)]);
      if (!ham) { await komut(['SREM', 'uyarilar', id]); continue; } // süresi dolmuş
      const k = JSON.parse(ham);
      if (k.durum !== 'onayli' || !son.kurlar[k.kod]) continue;
      const kur = son.kurlar[k.kod][0] / (birim[k.kod]?.birim || 1);
      const d = alarmDurumu(k, kur);
      if (!d.tetik) continue;
      const m = birim[k.kod];
      const baslik = k.tur === 'hedef' ? `${m.kisa} ${kurYaz(k.deger)} ₺ ${k.yon === 'altina' ? 'altına indi' : 'seviyesine ulaştı'}` : `${m.kisa} ${k.baz ? '%' + Math.abs(d.fark).toFixed(2).replace('.', ',') : ''} ${d.fark >= 0 ? 'yükseldi' : 'düştü'}`;
      const cikis = `${ORIGIN()}/api/cikis?id=${k.id}&t=${k.cikisToken}`;
      const govde = `${m.ad} döviz alış kuru ${kurYaz(kur)} ₺ (TCMB, ${tarihYaz(son.tarih)} bülteni).`;
      await epostaGonder({ to: k.eposta, subject: baslik, text: `${govde}\n\nBu uyarı tek seferlikti ve kaydınız silindi. Yeni uyarı: ${ORIGIN()}/uyarilar/\n\nYatırım tavsiyesi değildir.`, html: `<p><b>${kacis(baslik)}</b></p><p>${kacis(govde)}</p><p>Bu uyarı tek seferlikti ve kaydınız (e-posta adresiniz dahil) silindi.</p><p><a href="${ORIGIN()}/uyarilar/">Yeni uyarı oluştur</a></p><p style="color:#666;font-size:13px">Yatırım tavsiyesi değildir. Kur, TCMB gösterge niteliğindeki döviz kurudur; işlem kuru değildir.</p>` });
      await komut(['DEL', kayitAnahtar(id)]); await komut(['SREM', 'uyarilar', id]);
      const sayac = Number((await komut(['GET', 'e:' + ozet(k.eposta)])) || 0); if (sayac > 0) await komut(['DECR', 'e:' + ozet(k.eposta)]);
      gonderilen++;
    } catch (e) { hata++; console.error(`uyarı ${id}:`, e.message); }
  }
  console.log(`Uyarılar: ${idler.length} kayıt, ${gonderilen} gönderildi, ${hata} hata`);
  return { gonderilen, hata, toplam: idler.length };
}
if (import.meta.url === `file://${process.argv[1]}`) calistir().then(r => { if (r.hata) process.exitCode = 1; });
