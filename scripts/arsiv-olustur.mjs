// Geçmiş TCMB bültenlerini indirip public/data/arsiv/ içine yazar. İnternetli bir makinede çalıştırın.
//   npm run arsiv                      → 2019-01-01'den bugüne
//   npm run arsiv -- --from=2010-01-04 → daha eski başlangıç
// Yarıda kesilirse tekrar çalıştırın: kalınan yerden devam eder.
import { gunBulteni, isoTarih } from './lib/tcmb.mjs';
import { tumArsiv, arsivYaz, bultenEkle, turevleriYaz } from './lib/veri.mjs';
import { KODLAR } from './lib/meta.mjs';

const arg = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const baslangic = arg.from || '2019-01-01';
const istanbulBugun = () => isoTarih(new Date(Date.now() + 3 * 3600e3));
const bitis = arg.to || istanbulBugun();
const bekle = ms => new Promise(r => setTimeout(r, ms));

const arsiv = await tumArsiv();
if (Object.values(arsiv).some(a => a.ornek)) {
  console.error('HATA: public/data/arsiv içinde ÖRNEK veri var. Gerçek arşive geçmek için önce public/data/arsiv klasörünü silin.');
  process.exit(1);
}
const sonTarih = arsiv.USD && arsiv.USD.gunler.length ? arsiv.USD.gunler.at(-1)[0] : null;
let gun = new Date((sonTarih && sonTarih >= baslangic ? sonTarih : baslangic) + 'T00:00:00Z');
if (sonTarih && sonTarih >= baslangic) gun.setUTCDate(gun.getUTCDate() + 1);
const son = new Date(bitis + 'T00:00:00Z');
let eklenen = 0, atlanan = 0, hatalar = 0, sayac = 0;
console.log(`TCMB arşivi ${isoTarih(gun)} → ${bitis}`);
while (gun <= son) {
  const iso = isoTarih(gun);
  const hg = gun.getUTCDay(); // 0 pazar, 6 cumartesi
  gun.setUTCDate(gun.getUTCDate() + 1);
  if (hg === 0 || hg === 6) continue;
  try {
    const b = await gunBulteni(iso);
    if (!b) { atlanan++; continue; }
    if (b.tarih !== iso) { console.warn(`  ${iso}: bülten tarihi ${b.tarih} (atlandı)`); atlanan++; continue; }
    for (const kod of KODLAR) {
      const k = b.kurlar[kod];
      if (!k) continue;
      const r = bultenEkle(arsiv, kod, iso, k);
      arsiv[kod] = r.arsiv;
      if (r.durum === 'celisiyor') console.warn(`  ${iso} ${kod}: arşivdeki değerle çelişiyor, değiştirilmedi`);
    }
    eklenen++;
  } catch (e) { hatalar++; console.error(`  ${iso}: ${e.message}`); }
  if (++sayac % 50 === 0) console.log(`  ${iso} · ${eklenen} bülten`);
  await bekle(250); // kaynağa nazik davran
}
for (const kod of KODLAR) if (arsiv[kod]) await arsivYaz(kod, arsiv[kod]);
const t = await turevleriYaz();
console.log(`Bitti: ${eklenen} bülten eklendi, ${atlanan} gün yayımsız, ${hatalar} hata. Son bülten: ${t.tarih}`);
if (hatalar) { console.error('Hata veren günler için komutu yeniden çalıştırmak yetmez (kalınan yerden değil, son tarihten devam eder). --from ile o günden başlatın.'); process.exitCode = 2; }
