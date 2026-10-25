# Forex — Genel bakış

Alım satım yapmayan, TCMB gösterge kurlarına dayanan bir kur sitesi. Google'ın kur kutusundan farkı: çevirmek, geçmişle karşılaştırmak, izlemek, uyarı kurmak ve rapor almak için yan yana araçlar sunması.

- **Teknoloji:** statik site (Vercel), düz ES modülleri, çerçeve yok. Sayfaları `scripts/uret.mjs` üretir. E-posta uyarıları için `api/` altında 3 küçük sunucusuz fonksiyon.
- **Veri:** TCMB günlük bülten, `public/data/` altında JSON arşivi. Günlük güncellemeyi GitHub Action yapar.
- **Tasarım:** marka renklerine yakın koyu kahve zemin, yumuşak limon vurgu; koyu/açık tema; Work Sans.
- **Sayfalar:** Ana sayfa, Kurlar, 20 para birimi detayı, Çevirici, Geçmiş kur, Karşılaştır, Takip, Uyarılar, Rapor, tutar sayfaları (`/cevir/…`), yıllık kur sayfaları, Rehber (6 yazı), Hakkımızda/Veri kaynağı/Yasal uyarı/Gizlilik/İletişim, Yönetim (sağlık).
- **Komutlar:** `npm run ornek` (örnek veri), `npm run arsiv` (gerçek veri, kendi bilgisayarınızda), `npm run dev`, `npm run uret`, `npm test`, `npm run saglik`.
