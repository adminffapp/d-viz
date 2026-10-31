# Veri mimarisi

- Kaynak: `https://www.tcmb.gov.tr/kurlar/today.xml` ve `…/YYYYMM/DDMMYYYY.xml` (hafta sonu/tatilde 404 = bülten yok).
- Arşiv: `public/data/arsiv/<KOD>.json`; satır = `[tarih, döviz alış, döviz satış, efektif alış, efektif satış]`. Değerler yayımlandığı gibi saklanır; `birim` alanı (JPY gibi 100 birimlik) ayrı tutulur. Birim değişirse içe aktarma hata verir.
- Türevler: `son.json`, `ozet.json`, `meta.json`, `ozet-dis.json` (borsa sitesi için), `durum.json` (her kontrolün sonucu), `saglik.json`.
- Hata davranışı: kaynak okunamazsa `durum.json`'a hata yazılır; site eski veriyi "güncel" göstermez, uyarı şeridi çıkar. Örnek veri varsa üstte kalıcı "Örnek veri" şeridi görünür ve `--yayin` kipi üretimi reddeder.
- Saatlik piyasa katmanı (TCMB arşivinden ayrı): `scripts/saatlik.mjs` → `public/data/saatlik.json`. Kaynak Open Exchange Rates `latest.json` (USD tabanlı; TL karşılığı = `rates.TRY / rates.KOD`). Dosyada son değer, son 24 saatlik seri (`saatler`, `seri`) ve 24 saatlik değişim (`g24`) bulunur. Aynı zaman damgası gelirse dosya yazılmaz (gereksiz commit/yayın olmaz). Piyasa kapalıyken (Cuma 22:00 – Pazar 21:00 UTC) istek atılmaz; ayda yaklaşık 550 istek, ücretsiz kota 1.000. Hata olursa dosya değiştirilmez; ön yüz 3 saatten eski veride "güncellenemedi" yazar. Ön yüz: `public/assets/js/piyasa.js`, yer tutucular `[data-piyasa="liste"]` ve `[data-piyasa="tek"]`. Hesaplayıcılar, grafikler ve uyarılar TCMB bültenini kullanmaya devam eder.
- Hafta sonu/tatil: önceki son bülten kullanılır, nedeni sonuçta yazılır.
- Yuvarlama: yalnızca gösterimde; hesaplar tam değerle.
- Tarayıcıda: son bilinen veri localStorage'a kopyalanır; çevrimdışıyken bu gösterilir ve belirtilir. Servis çalışanı `/data/*.json` için önce ağ, olmazsa önbellek kullanır.
