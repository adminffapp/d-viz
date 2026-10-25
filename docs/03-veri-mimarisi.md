# Veri mimarisi

- Kaynak: `https://www.tcmb.gov.tr/kurlar/today.xml` ve `…/YYYYMM/DDMMYYYY.xml` (hafta sonu/tatilde 404 = bülten yok).
- Arşiv: `public/data/arsiv/<KOD>.json`; satır = `[tarih, döviz alış, döviz satış, efektif alış, efektif satış]`. Değerler yayımlandığı gibi saklanır; `birim` alanı (JPY gibi 100 birimlik) ayrı tutulur. Birim değişirse içe aktarma hata verir.
- Türevler: `son.json`, `ozet.json`, `meta.json`, `ozet-dis.json` (borsa sitesi için), `durum.json` (her kontrolün sonucu), `saglik.json`.
- Hata davranışı: kaynak okunamazsa `durum.json`'a hata yazılır; site eski veriyi "güncel" göstermez, uyarı şeridi çıkar. Örnek veri varsa üstte kalıcı "Örnek veri" şeridi görünür ve `--yayin` kipi üretimi reddeder.
- Hafta sonu/tatil: önceki son bülten kullanılır, nedeni sonuçta yazılır.
- Yuvarlama: yalnızca gösterimde; hesaplar tam değerle.
- Tarayıcıda: son bilinen veri localStorage'a kopyalanır; çevrimdışıyken bu gösterilir ve belirtilir. Servis çalışanı `/data/*.json` için önce ağ, olmazsa önbellek kullanır.
