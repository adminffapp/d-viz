// Para birimi künyesi. TCMB'nin yayımladığı kodlar (XDR hariç) + Türkçe ad, URL adı, sembol.
// 'populer' = ana sayfada "Popüler" görünümünde listelenenler.
export const BIRIMLER = [
  { kod: 'USD', ad: 'ABD Doları',            kisa: 'Dolar',            slug: 'dolar',             sembol: '$',   populer: true,  sira: 1 },
  { kod: 'EUR', ad: 'Euro',                  kisa: 'Euro',             slug: 'euro',              sembol: '€',   populer: true,  sira: 2 },
  { kod: 'GBP', ad: 'İngiliz Sterlini',      kisa: 'Sterlin',          slug: 'sterlin',           sembol: '£',   populer: true,  sira: 3 },
  { kod: 'CHF', ad: 'İsviçre Frangı',        kisa: 'İsviçre frangı',   slug: 'isvicre-frangi',    sembol: 'Fr.', populer: true,  sira: 4 },
  { kod: 'JPY', ad: 'Japon Yeni',            kisa: 'Japon yeni',       slug: 'japon-yeni',        sembol: '¥',   populer: true,  sira: 5 },
  { kod: 'CAD', ad: 'Kanada Doları',         kisa: 'Kanada doları',    slug: 'kanada-dolari',     sembol: 'C$',  populer: true,  sira: 6 },
  { kod: 'AUD', ad: 'Avustralya Doları',     kisa: 'Avustralya doları',slug: 'avustralya-dolari', sembol: 'A$',  populer: true,  sira: 7 },
  { kod: 'SAR', ad: 'Suudi Arabistan Riyali',kisa: 'Suudi riyali',     slug: 'suudi-riyali',      sembol: 'SR',  populer: true,  sira: 8 },
  { kod: 'AED', ad: 'BAE Dirhemi',           kisa: 'BAE dirhemi',      slug: 'bae-dirhemi',       sembol: 'DH',  populer: true,  sira: 9 },
  { kod: 'CNY', ad: 'Çin Yuanı',             kisa: 'Çin yuanı',        slug: 'cin-yuani',         sembol: 'CN¥', populer: true,  sira: 10 },
  { kod: 'AZN', ad: 'Azerbaycan Manatı',     kisa: 'Azerbaycan manatı',slug: 'azerbaycan-manati', sembol: 'AZN', populer: false, sira: 11 },
  { kod: 'KWD', ad: 'Kuveyt Dinarı',         kisa: 'Kuveyt dinarı',    slug: 'kuveyt-dinari',     sembol: 'KD',  populer: false, sira: 12 },
  { kod: 'QAR', ad: 'Katar Riyali',          kisa: 'Katar riyali',     slug: 'katar-riyali',      sembol: 'QR',  populer: false, sira: 13 },
  { kod: 'NOK', ad: 'Norveç Kronu',          kisa: 'Norveç kronu',     slug: 'norvec-kronu',      sembol: 'kr',  populer: false, sira: 14 },
  { kod: 'SEK', ad: 'İsveç Kronu',           kisa: 'İsveç kronu',      slug: 'isvec-kronu',       sembol: 'kr',  populer: false, sira: 15 },
  { kod: 'DKK', ad: 'Danimarka Kronu',       kisa: 'Danimarka kronu',  slug: 'danimarka-kronu',   sembol: 'kr',  populer: false, sira: 16 },
  { kod: 'RUB', ad: 'Rus Rublesi',           kisa: 'Rus rublesi',      slug: 'rus-rublesi',       sembol: '₽',   populer: false, sira: 17 },
  { kod: 'RON', ad: 'Romen Leyi',            kisa: 'Romen leyi',       slug: 'romen-leyi',        sembol: 'lei', populer: false, sira: 19 },
  { kod: 'KRW', ad: 'Güney Kore Wonu',       kisa: 'Güney Kore wonu',  slug: 'guney-kore-wonu',   sembol: '₩',   populer: false, sira: 20 },
  { kod: 'PKR', ad: 'Pakistan Rupisi',       kisa: 'Pakistan rupisi',  slug: 'pakistan-rupisi',   sembol: 'Rs',  populer: false, sira: 21 },
];
export const KODLAR = BIRIMLER.map(b => b.kod);
export const BIRIM = Object.fromEntries(BIRIMLER.map(b => [b.kod, b]));
export const SLUG = Object.fromEntries(BIRIMLER.map(b => [b.slug, b]));
// Kur türü sırası, arşiv satırlarındaki sütun sırasıdır: [tarih, db, ds, eb, es]
export const TURLER = ['Döviz alış', 'Döviz satış', 'Efektif alış', 'Efektif satış'];
