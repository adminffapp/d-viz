// Günlük güncelleme: arşivin son gününden bugüne kadar yeni bültenleri ekler, türev dosyaları yeniler,
// public/data/durum.json'a kontrol sonucunu yazar. GitHub Actions bunu hafta içi her gün çalıştırır.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { gunBulteni, guncelBulten, isoTarih } from './lib/tcmb.mjs';
import { tumArsiv, arsivYaz, bultenEkle, turevleriYaz, VERI } from './lib/veri.mjs';
import { KODLAR } from './lib/meta.mjs';

const durumDosya = path.join(VERI, 'durum.json');
let durum = existsSync(durumDosya) ? JSON.parse(await readFile(durumDosya, 'utf8')) : { gecmis: [] };
const kayit = (sonuc, mesaj, ekstra = {}) => {
  const zaman = new Date().toISOString();
  durum = { ...durum, ...ekstra, sonKontrol: zaman, sonSonuc: sonuc, sonMesaj: mesaj, gecmis: [...(durum.gecmis || []), { zaman, sonuc, mesaj }].slice(-60) };
};
try {
  const arsiv = await tumArsiv();
  if (!arsiv.USD) throw new Error('Arşiv yok: önce `npm run arsiv` çalıştırın.');
  if (Object.values(arsiv).some(a => a.ornek)) throw new Error('Arşivde ÖRNEK veri var; gerçek veriye geçilmeden güncelleme yapılmaz.');
  let gun = new Date(arsiv.USD.gunler.at(-1)[0] + 'T00:00:00Z');
  gun.setUTCDate(gun.getUTCDate() + 1);
  const bugun = new Date(isoTarih(new Date(Date.now() + 3 * 3600e3)) + 'T00:00:00Z');
  let eklenen = 0;
  for (; gun <= bugun; gun.setUTCDate(gun.getUTCDate() + 1)) {
    const d = gun.getUTCDay();
    if (d === 0 || d === 6) continue;
    const iso = isoTarih(gun);
    let b = await gunBulteni(iso);
    if (!b && iso === isoTarih(bugun)) { // arşiv yolu henüz yoksa today.xml'e bak
      const g = await guncelBulten();
      if (g.tarih === iso) b = g;
    }
    if (!b || b.tarih !== iso) continue;
    for (const kod of KODLAR) {
      const k = b.kurlar[kod]; if (!k) continue;
      const r = bultenEkle(arsiv, kod, iso, k);
      arsiv[kod] = r.arsiv;
      if (r.durum === 'celisiyor') console.warn(`${iso} ${kod}: arşivle çelişiyor, değiştirilmedi`);
    }
    eklenen++;
  }
  if (eklenen) {
    for (const kod of KODLAR) if (arsiv[kod]) await arsivYaz(kod, arsiv[kod]);
    const t = await turevleriYaz();
    kayit('tamam', `${eklenen} yeni bülten, son bülten ${t.tarih}`, { sonBulten: t.tarih, sonBasari: new Date().toISOString() });
  } else {
    kayit('degisiklik-yok', 'Yeni bülten yok (hafta sonu, tatil ya da henüz yayımlanmadı)');
  }
  await writeFile(durumDosya, JSON.stringify(durum, null, 1) + '\n');
  console.log(durum.sonMesaj);
} catch (e) {
  kayit('hata', e.message);
  await writeFile(durumDosya, JSON.stringify(durum, null, 1) + '\n');
  console.error('HATA:', e.message);
  process.exit(1); // Actions başarısız görünsün; eski veri "güncelmiş gibi" yayımlanmaz
}
