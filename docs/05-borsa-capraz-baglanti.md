# Borsa sitesiyle çapraz bağlantı

Her sitenin altında diğerinin üç anahtar değeri küçük kartlarla gösterilir; tıklanınca o site açılır.

Bu sitenin sunduğu sözleşme: `/data/ozet-dis.json`
```json
{ "site": "FF Döviz", "kaynak": "TCMB", "tarih": "2026-10-23", "ornek": false,
  "degerler": [ { "kod": "USD", "ad": "ABD Doları", "deger": 39.7040, "degisim": 0.12 }, … 3 adet ] }
```
Borsa sitesi aynı biçimde kendi `/data/ozet-dis.json` dosyasını sunmalı (aynı CORS yaklaşımı: `Access-Control-Allow-Origin: https://doviz.ffapplabs.com`). Hazır olunca `ayar.js` içinde `borsa.hazir = true` yapın. O zamana kadar kartın yerinde "Borsa sitesi hazırlanıyor" notu görünür; uydurma değer gösterilmez.
