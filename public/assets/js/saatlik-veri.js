// Saatlik piyasa kuru verisi: /data/saatlik.json (GitHub Actions saatte bir yazar).
// Bağımsız modül: başka modülden içe aktarma yapmaz.
export const BAYAT_SAAT = 3;
let soz = null;

/** Veriyi bir kez yükler; dosya yoksa ya da bozuksa null döner (araçlar TCMB'ye düşer). */
export function saatlikYukle({ yenile = false } = {}) {
  if (yenile || !soz) {
    soz = fetch('/data/saatlik.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : null))
      .then(j => (j && j.kurlar && j.zaman ? j : null))
      .catch(() => null);
  }
  return soz;
}

/** Forex piyasası Cuma 22:00 – Pazar 21:00 UTC arası kapalıdır (yaklaşık). */
export const piyasaKapali = (t = new Date()) => { const g = t.getUTCDay(), s = t.getUTCHours(); return g === 6 || (g === 0 && s < 21) || (g === 5 && s >= 22); };

/** 1 birim paranın TL karşılığı (TRY = 1); yoksa null. */
export const piyasaTl = (j, kod) => (kod === 'TRY' ? 1 : j?.kurlar?.[kod] ?? null);

/** Veri kullanılabilir mi: piyasa açıkken 3 saatten eski veri "güncel" sayılmaz; kapalıyken son değer geçerlidir. */
export function kullanilabilir(j, simdi = Date.now()) {
  if (!j) return false;
  const yas = (simdi - Date.parse(j.zaman)) / 3600e3;
  return piyasaKapali(new Date(simdi)) ? yas < 72 : yas <= BAYAT_SAAT;
}

const IST = { timeZone: 'Europe/Istanbul' };
const gunAnahtar = d => new Intl.DateTimeFormat('en-CA', IST).format(d);
export function saatYaz(iso) {
  const d = new Date(iso), s = new Intl.DateTimeFormat('tr-TR', { ...IST, hour: '2-digit', minute: '2-digit' }).format(d);
  if (gunAnahtar(d) === gunAnahtar(new Date())) return 'bugün ' + s;
  if (gunAnahtar(d) === gunAnahtar(new Date(Date.now() - 864e5))) return 'dün ' + s;
  return new Intl.DateTimeFormat('tr-TR', { ...IST, day: 'numeric', month: 'short' }).format(d) + ' ' + s;
}

/** Kısa durum: {sinif: taze|kapali|bayat, metin} */
export function durum(j) {
  const yas = (Date.now() - Date.parse(j.zaman)) / 3600e3;
  if (piyasaKapali()) return { sinif: 'kapali', metin: `Piyasa kapalı · son değer ${saatYaz(j.zaman)}` };
  if (yas > BAYAT_SAAT) return { sinif: 'bayat', metin: `Son ${Math.floor(yas)} saattir güncellenemedi · son değer ${saatYaz(j.zaman)}` };
  return { sinif: 'taze', metin: `Güncellendi ${saatYaz(j.zaman)}` };
}

/**
 * Bir kur uyarısının karşılaştırılacağı kur (tarayıcı ve e-posta aynı kuralı kullanır).
 * Saatlik piyasa verisi kullanılabilirse piyasa kuru; değilse son TCMB bülteni.
 * İstisna: TCMB kuruna göre kurulmuş eski yüzde uyarıları (kaynak alanı yok) TCMB ile karşılaştırılır,
 * çünkü yüzde, kurulduğu kaynağa göre hesaplanmalıdır.
 * Dönüş: {kur, kaynak: 'piyasa'|'tcmb', zaman} ya da null
 */
export function uyariKuru(a, son, birim, saatlik, simdi = Date.now()) {
  const tcmbYuzde = a.tur === 'yuzde' && a.kaynak !== 'piyasa';
  if (!tcmbYuzde && kullanilabilir(saatlik, simdi) && piyasaTl(saatlik, a.kod) != null) return { kur: piyasaTl(saatlik, a.kod), kaynak: 'piyasa', zaman: saatlik.zaman };
  const r = son?.kurlar?.[a.kod];
  if (!r) return null;
  return { kur: r[0] / (birim?.[a.kod]?.birim || 1), kaynak: 'tcmb', zaman: son.tarih };
}
