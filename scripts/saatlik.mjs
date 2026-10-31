// Saatlik piyasa kuru güncellemesi (GitHub Actions her saat çalıştırır: .github/workflows/saatlik.yml).
// public/data/saatlik.json dosyasını yazar. TCMB arşivine dokunmaz.
//   node scripts/saatlik.mjs           → piyasa kapalıysa istek atmadan çıkar
//   node scripts/saatlik.mjs --zorla   → piyasa kapalı olsa da çeker (deneme için)
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { VERI } from './lib/veri.mjs';
import { getir, birlestir, piyasaKapali } from './lib/piyasa.mjs';

const dosya = path.join(VERI, 'saatlik.json');
const zorla = process.argv.includes('--zorla');

if (!zorla && piyasaKapali()) {
  console.log('Döviz piyasası kapalı (hafta sonu); istek atılmadı, kota korundu.');
  process.exit(0);
}
try {
  const onceki = existsSync(dosya) ? JSON.parse(await readFile(dosya, 'utf8')) : null;
  const yeni = await getir(process.env.OXR_APP_ID);
  const sonuc = birlestir(onceki, yeni);
  if (!sonuc) { console.log(`Değişiklik yok: kaynak hâlâ ${yeni.zaman} verisini veriyor.`); process.exit(0); }
  await writeFile(dosya, JSON.stringify(sonuc) + '\n');
  console.log(`Saatlik kur yazıldı: ${sonuc.zaman} · ${Object.keys(sonuc.kurlar).length} para birimi · USD/TRY ${sonuc.kurlar.USD}`);
} catch (e) {
  // Dosya değiştirilmez: site son başarılı veriyi zaman damgasıyla göstermeye devam eder, 3 saati geçerse "bayat" uyarısı çıkar.
  console.error('HATA:', e.message);
  process.exit(1);
}
