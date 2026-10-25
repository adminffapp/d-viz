# Bakım ve sağlık

- `/yonetim/`: veri tazeliği, arşiv bütünlüğü, eksik günler, ani sıçramalar, kaynak hata geçmişi, tarayıcı hata kaydı. Arama motorlarına kapalıdır (noindex).
- `npm run saglik`: tüm sayfaları tarar (kırık iç bağlantı, eksik/yinelenen başlık-açıklama, h1, canonical); sonucu `public/data/saglik.json`'a yazar. Action içinde her gün çalışır.
- Kaynak hatası olursa Action başarısız görünür ve GitHub size e-posta atar; site eski veriyi uyarıyla gösterir.
- Sağlık metrikleri (Core Web Vitals): Vercel Speed Insights veya PageSpeed Insights ile ayda bir bakın. Yapılan önlemler: tek CSS, kendi barındırdığımız font, 3D madeni para tembel yüklenir ve `prefers-reduced-motion`'da kapanır.
- Sırlar kodda yok; yalnızca ortam değişkenlerinde (`docs/04`).
