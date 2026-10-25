// Tek yerden ayar. Boş bırakılan alanlar özelliği kapatır; sitede sahte değer gösterilmez.
export const AYAR = {
  site: 'Forex',
  origin: 'https://doviz.ffapplabs.com',   // yayın alan adı (değişirse docs/04-yayina-alma.md)
  anaSite: 'https://ffapplabs.com',
  hub: 'https://hub.ffapplabs.com',
  eposta: 'contact@ffapplabs.com',
  // Borsa sitesi hazır olunca: kendi /data/ozet-dis.json dosyasından 3 anahtar değer okunur.
  borsa: { origin: 'https://borsa.ffapplabs.com', ozet: '/data/ozet-dis.json', hazir: false },
  // Uyarı (e-posta) servisi: /api/uyari kapalıysa form bunu söyler, tarayıcı uyarıları çalışmaya devam eder.
  epostaUyari: true,
  // Google Search Console doğrulama meta değeri (yalnızca değer, tag değil). Boşsa eklenmez.
  gscToken: '',
  // Reklam: boşsa hiç yüklenmez. Onay verilmeden (çerez tercihi) yüklenmez.
  adsenseId: '',
  adsenseYuvalar: { orta: '', alt: '' },   // AdSense reklam birimi numaraları
  // Vercel Web Analytics: çerezsiz; Vercel panelinden etkinleştirildiğinde veri toplar.
  analitik: true,
};
