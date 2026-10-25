# Özellik kontrol listesi (PDF'teki 12 başlık)

Durum: **Var** = kodda yapıldı ve örnek veriyle ekranda denendi · **Anahtar/hesap gerekir** = kod hazır, sizin hesabınız/anahtarınız lazım · **Ileride** = bilerek yapılmadı.
"Örnek veriyle denendi": TCMB'ye bu ortamdan erişilemediği için gerçek veriyle denenemedi (bkz. 04-yayina-alma).

| # | Başlık | Durum | Nerede |
|---|---|---|---|
| 1 | Ana sayfa ve canlı kur ekranı: popüler kurlar, tablo, günlük % değişim, yön göstergeleri, son güncelleme/kaynak, ad/kod arama, sıralama, popüler/tümü, detaya tık, mobil tablo | Var | `/`, `/kurlar/` |
| 1 | Borsa sitesi küçük piyasa kutuları | Ileride (borsa sitesi yok; sözleşme hazır) | altbilgi kartları, docs/05 |
| 2 | Çevirici: her para → her para, TL↔döviz, çapraz kur, iki yönlü, hızlı tutarlar, çoklu para, sepet toplamı, kopyala, paylaş, son hesaplar, komisyonlu net tutar, hassasiyet | Var | `/cevirici/` |
| 3 | Geçmiş hesap: tarih seç, tutarın o tarihteki değeri, geçmiş-bugün, iki tarih, TL→döviz ve döviz→TL, nominal ve % fark, hafta sonu/tatil açıklaması, kaynak-tarih | Var | `/gecmis-kur/` |
| 4 | Detay sayfaları: güncel, değişim, 7/30/90 gün – 1 yıl – tümü grafik, grafikte tarih değeri, en yüksek/düşük, ortalama, önceki kapanış, dört kur türü, çapraz kur bağlantıları, geçmiş tablosu | Var (grafik derinliği = arşiv derinliği; "5 yıl" için arşivi 2019'dan çekin) | `/kur/<ad>/` |
| 5 | 20 para birimi (USD, EUR, GBP, CHF, JPY, CAD, AUD, SAR, AED, KWD, QAR, AZN, NOK, SEK, DKK, CNY ve diğerleri), arama, ISO kod/sembol | Var; yeni para = `scripts/lib/meta.mjs`'e bir satır | `/kurlar/` |
| 6 | Favoriler, sıralama, sepet, TL toplam, önceki tarihe göre değişim, yerel depolama, üyeliksiz, listeyi dışa aktarma | Var | `/takip/` |
| 6 | Giriş / cihazlar arası eşitleme | Ileride | — |
| 7 | İki para karşılaştırma, grafikler, % değişim, farklı dönemler, tutarın değer değişimi, en çok yükselen/düşen, günlük/aylık/yıllık tablolar, CSV | Var | `/karsilastir/`, yıllık sayfalar |
| 7 | Döviz–borsa–altın karşılaştırma | Ileride | — |
| 8 | Hedef seviye ve % uyarıları (tarayıcı + isteğe bağlı bildirim), koyu/açık tema, PWA, hızlı açılış ve son bilinen veri, bayat veri uyarısı, klavye erişimi, okunabilir grafikler | Var | `/uyarilar/`, `app.js`, `sw.js` |
| 8 | E-posta uyarıları | Anahtar/hesap gerekir (Upstash + Resend) | `api/`, docs/04 |
| 9 | Raporlar: CSV, tarih aralığı, PDF (yazdırma), sepet raporu, özet/grafik, kaynak ve veri tarihi | Var (PDF tarayıcının "PDF olarak kaydet"i ile) | `/rapor/`, araç sayfalarındaki düğmeler |
| 10 | SEO: dolar sayfası, para sayfaları, tutar sayfaları, geçmiş kur sayfaları, rehber, çapraz kur ve kur farkı yazıları, benzersiz title/meta, canonical, sitemap, yapılandırılmış veri (yalnızca BreadcrumbList/Article/WebSite), iç bağlantılar | Var | `/cevir/…`, `/gecmis-kur/<ad>/<yıl>/`, `/rehber/` |
| 10 | Search Console / organik izleme | Anahtar/hesap gerekir | `ayar.js` `gscToken`, docs/04 |
| 11 | Kaynak ve lisans notu, gösterge kurlar–piyasa ayrımı, güncelleme sıklığı, kaynak tarihi kaydı, günlük arşiv, eksik gün işleme, önbellek, bayat veriyi taze göstermeme, tutarlı yuvarlama, hata izleme, sır yönetimi, gizlilik/saklama politikası, yasal uyarı-iletişim-hakkımızda | Var | docs/03, `/veri-kaynagi/`, `/gizlilik/`, `/yonetim/` |
| 11 | TCMB verisinin kullanım koşullarının hukuki doğrulaması | Sizin kontrol etmeniz gerekir | `/veri-kaynagi/` |
| 12 | Reklam yuvaları (düzeni bozmayan), çerez onayı, ölçüm, yönetim paneli, en çok bakılan para (sayfa sayılarından) | Var; AdSense onayı ve gerçek reklam testi sizde | docs/06 |
| 12 | Sponsorlu içerik | Ileride | — |

## Dürüst notlar
- Gerçek TCMB verisi bu ortamdan çekilemedi; her şey işaretli örnek veriyle denendi. Gerçek veride ilk gün `npm run uret` çıktısını ve `/yonetim/`'i kontrol edin.
- Servis çalışanı, PWA kurulumu, Vercel, Upstash, Resend, GitHub Action ve AdSense gerçek ortamda denenmedi.
- Sayfa fotoğrafı yok: bulunabilir açık görseller bu ortamda erişilemedi; tasarım tipografi, renk ve çizilmiş grafiklerle kuruldu.
