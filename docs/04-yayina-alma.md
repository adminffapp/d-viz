# Yayına alma

1. **Gerçek veri (kendi bilgisayarınızda; TCMB'ye buradan erişilemedi):** klasörde `npm install`, sonra `npm run arsiv`. Bu komut 2019'dan bugüne bültenleri çeker (uzun sürebilir, kesilirse kaldığı yerden `--from=YYYY-MM-DD` ile devam eder). Ardından `public/data` içindeki örnek verinin gerçekle değiştiğini `npm run uret` çıktısında ("ÖRNEK" ibaresi yok) doğrulayın. Gerekirse arşiv başlangıç yılını `scripts/arsiv-olustur.mjs` içinde artırarak daha eski veri alın (5 yıl+ grafikler arşiv derinliğine bağlıdır).
2. `npm test` ve `npm run yayin-uret` (örnek veri varsa reddeder) çalıştırın.
3. GitHub'a yeni bir depo olarak yükleyin; Vercel'de içe aktarın (Output Directory `public`, `vercel.json` hazır).
4. Alan adı: `forex.ffapplabs.com`. Farklıysa `public/assets/js/ayar.js` içindeki `origin` ve `vercel.json`/CORS değerini güncelleyin.
5. E-posta uyarıları için depo + gönderici gerekir. **Firestore kullanıyorsanız:** Firebase konsolu → Proje ayarları → Hizmet hesapları → "Yeni özel anahtar oluştur"; inen JSON dosyasının tüm içeriğini `FIREBASE_SERVICE_ACCOUNT` olarak (Vercel + GitHub Secrets) girin, Firestore'u "production mode" ile açın (istemci erişimi kapalı kalır; yalnızca sunucu hesabı yazar). E-posta göndermek için ayrıca `RESEND_API_KEY` ve `RESEND_FROM` gerekir. Firestore yerine Upstash kullanılacaksa: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM`, `SITE_ORIGIN`. Bunlar yoksa e-posta uyarısı formu "şu an kapalı" der; tarayıcı uyarıları çalışır.
6. GitHub Action (`.github/workflows/gunluk.yml`) hafta içi 15:45 TR'de çalışır; ilk gün elle `Run workflow` ile deneyin.
7. Vercel'de Web Analytics'i açın (isteğe bağlı). Search Console'da alan adını doğrulayıp `ayar.js` içindeki `gscToken` alanına meta değerini yazın, `sitemap.xml` gönderin.
8. AdSense onayı alınınca `adsenseId` ve `adsenseYuvalar` doldurulur; boşken hiç reklam kodu yüklenmez.
