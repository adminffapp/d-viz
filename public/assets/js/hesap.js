// Saf hesap işlevleri (DOM yok): tarayıcıda ve Node testlerinde aynı dosya kullanılır.
// Arşiv satırı: [tarih, döviz alış, döviz satış, efektif alış, efektif satış]; değerler bültende yayımlandığı gibi,
// 'birim' kadar yabancı para için TL'dir (ör. 100 JPY = 34,0096 TL).

export const TURLER = [
  { ad: 'Döviz alış', kisa: 'DA', idx: 1 },
  { ad: 'Döviz satış', kisa: 'DS', idx: 2 },
  { ad: 'Efektif alış', kisa: 'EA', idx: 3 },
  { ad: 'Efektif satış', kisa: 'ES', idx: 4 },
];
export const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

/* ---------- tarih ---------- */
export const isoGecerli = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z')) && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;
export const haftaGunu = iso => new Date(iso + 'T00:00:00Z').getUTCDay();
export const gunEkle = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const gunFarki = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
export const istanbulBugun = (simdi = new Date()) => new Date(simdi.getTime() + 3 * 3600e3).toISOString().slice(0, 10);
export function tarihYaz(iso, { gun = false, kisa = false } = {}) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const ay = AYLAR[m - 1];
  const s = kisa ? `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}` : `${d} ${ay} ${y}`;
  return gun ? `${s} ${GUNLER[haftaGunu(iso)]}` : s;
}

/* ---------- sayı ---------- */
const fmtCache = new Map();
function fmt(min, max) {
  const k = min + ':' + max;
  if (!fmtCache.has(k)) fmtCache.set(k, new Intl.NumberFormat('tr-TR', { minimumFractionDigits: min, maximumFractionDigits: max }));
  return fmtCache.get(k);
}
/** Yarım-yukarı yuvarlama, ikili kayan nokta hatasına karşı (1,005 → 1,01). */
export function yuvarla(n, d = 2) {
  if (!Number.isFinite(n)) return n;
  const f = 10 ** d;
  const x = Math.abs(n) * f;
  const r = Math.round(x + Number.EPSILON * x * 4);
  return Math.sign(n) * r / f;
}
export const sayiYaz = (n, d = 2) => (n == null || !Number.isFinite(n) ? '—' : fmt(d, d).format(yuvarla(n, d)));
/** Gerekirse 0 ondalığa kadar iner (tutar alanları için). */
export const sayiSerbest = (n, max = 2) => (n == null || !Number.isFinite(n) ? '—' : fmt(0, max).format(yuvarla(n, max)));
/** Kur için okunur hassasiyet: ≥1 → 4 hane; küçük değerlerde en az 4 anlamlı rakam. */
export function kurHane(v) {
  if (!v || v >= 1) return 4;
  return Math.min(8, 4 + Math.floor(-Math.log10(v)));
}
export const kurYaz = v => sayiYaz(v, kurHane(v));
export function yuzdeYaz(p, d = 2) {
  if (p == null || !Number.isFinite(p)) return '—';
  const r = yuvarla(p, d);
  return (r > 0 ? '+' : r < 0 ? '−' : '') + fmt(d, d).format(Math.abs(r)) + '%';
}
export const isaret = p => (p == null || Math.abs(p) < 0.005 ? 0 : p > 0 ? 1 : -1);
export const yuzdeDegisim = (yeni, eski) => (eski ? ((yeni - eski) / eski) * 100 : null);

/** Kullanıcının yazdığı tutarı sayıya çevirir: "1.234,56", "1234.56", "1 234,5" hepsi anlaşılır. */
export function tutarOku(s) {
  if (typeof s === 'number') return s;
  let t = String(s ?? '').trim().replace(/\s| |₺|TL/gi, '');
  if (!t) return null;
  const virgul = t.lastIndexOf(','), nokta = t.lastIndexOf('.');
  if (virgul > -1 && nokta > -1) {
    t = virgul > nokta ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  } else if (virgul > -1) {
    t = t.replace(/\./g, '').replace(',', '.');
  } else if (nokta > -1) {
    const parcalar = t.split('.');
    const binlik = /^\d{1,3}$/.test(parcalar[0]) && parcalar.slice(1).every(p => /^\d{3}$/.test(p));
    if (parcalar.length > 2) { if (!binlik) return null; t = t.replace(/\./g, ''); }
    else if (parcalar.length === 2 && binlik) t = t.replace(/\./g, '');
  }
  const n = Number(t);
  return Number.isFinite(n) && /^-?\d*\.?\d+$/.test(t) ? n : null;
}

/* ---------- arşiv sorguları ---------- */
/** gunler içinde ≤ iso olan son satırın indeksi (yoksa -1). */
export function satirIdx(gunler, iso) {
  let lo = 0, hi = gunler.length - 1, bul = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (gunler[m][0] <= iso) { bul = m; lo = m + 1; } else hi = m - 1; }
  return bul;
}
/**
 * İstenen tarihteki kur. Bülten yayımlanmayan günlerde (hafta sonu, tatil) bir önceki yayımlanan bülten kullanılır;
 * 'neden' bunun nedenini döndürür ki arayüz doğru açıklama yapabilsin.
 */
export function kurBul(arsiv, iso, turIdx = 1, { turYedek = true } = {}) {
  const g = arsiv.gunler;
  if (!g.length) return { hata: 'bos' };
  if (iso < g[0][0]) return { hata: 'baslangic-oncesi', ilk: g[0][0] };
  const i = satirIdx(g, iso);
  const satir = g[i];
  let kullanilanTur = turIdx, kur = satir[turIdx];
  let turDegisti = false;
  if (kur == null && turYedek) { kur = satir[1]; kullanilanTur = 1; turDegisti = kur != null; }
  if (kur == null) return { hata: 'tur-yok', tarih: satir[0] };
  const tam = satir[0] === iso;
  let neden = 'tam';
  if (!tam) {
    const hg = haftaGunu(iso);
    const sonTarih = g[g.length - 1][0];
    if (i === g.length - 1 && iso > sonTarih) neden = hg === 0 || hg === 6 ? 'hafta-sonu' : 'bulten-yok-guncel';
    else neden = hg === 0 || hg === 6 ? 'hafta-sonu' : 'bulten-yok';
  }
  return { tarih: satir[0], istenen: iso, kur, birim: arsiv.birim || 1, tam, neden, tur: kullanilanTur, turDegisti, idx: i };
}
export const nedenMetni = (r) => {
  if (!r || r.hata) return '';
  const t = tarihYaz(r.tarih, { gun: true });
  switch (r.neden) {
    case 'tam': return '';
    case 'hafta-sonu': return `${tarihYaz(r.istenen, { gun: true })} hafta sonuna denk geliyor; TCMB bülten yayımlamaz. Bir önceki bülten (${t}) kullanıldı.`;
    case 'bulten-yok': return `${tarihYaz(r.istenen, { gun: true })} için bülten yok (resmî tatil ya da yayım yapılmayan gün). Bir önceki bülten (${t}) kullanıldı.`;
    case 'bulten-yok-guncel': return `${tarihYaz(r.istenen, { gun: true })} için bülten henüz yayımlanmadı ya da yayımlanmayacak. Son yayımlanan bülten (${t}) kullanıldı.`;
    default: return '';
  }
};

/**
 * 1 birim YABANCI PARA'nın TL karşılığı (birim bölmesi yapılmış).
 * kod==='TRY' → 1.
 */
export const tlBirim = (kur, birim = 1) => kur / birim;

/** from→to çevirisi; kurFrom/kurTo = 1 birimin TL karşılığı. */
export function cevir(tutar, tlFrom, tlTo) {
  return (tutar * tlFrom) / tlTo;
}

/** Komisyon: yüzde (ör. 1.5) ve sabit ücret (hedef birimde) düşer. */
export function netTutar(brut, komisyonYuzde = 0, sabitUcret = 0) {
  const kesinti = brut * (komisyonYuzde / 100) + sabitUcret;
  return { net: brut - kesinti, kesinti };
}

/* ---------- seri istatistikleri ---------- */
export function aralikBaslangic(ad, sonTarih, ilkTarih) {
  const gun = { '7g': 7, '30g': 30, '90g': 90, '1y': 365, '5y': 1826 }[ad];
  if (!gun) return ilkTarih;
  const b = gunEkle(sonTarih, -gun);
  return b < ilkTarih ? ilkTarih : b;
}
export function aralikSatirlari(gunler, bas, bit) {
  const i0 = satirIdx(gunler, gunEkle(bas, -1)) + 1;
  const i1 = satirIdx(gunler, bit);
  return i1 >= i0 ? gunler.slice(i0, i1 + 1) : [];
}
export function istatistik(satirlar, idx = 1) {
  const v = satirlar.filter(r => r[idx] != null);
  if (!v.length) return null;
  let min = v[0], max = v[0], toplam = 0;
  for (const r of v) { if (r[idx] < min[idx]) min = r; if (r[idx] > max[idx]) max = r; toplam += r[idx]; }
  const ilk = v[0], son = v[v.length - 1];
  return {
    n: v.length, ilk: ilk[idx], ilkTarih: ilk[0], son: son[idx], sonTarih: son[0],
    min: min[idx], minTarih: min[0], max: max[idx], maxTarih: max[0],
    ortalama: toplam / v.length, fark: son[idx] - ilk[idx], yuzde: yuzdeDegisim(son[idx], ilk[idx]),
  };
}
/** Her ayın son bülteni (aylık değişim tablosu için). */
export function aylikSon(gunler, idx = 1) {
  const m = new Map();
  for (const r of gunler) if (r[idx] != null) m.set(r[0].slice(0, 7), r);
  return [...m.values()];
}
export function yillikSon(gunler, idx = 1) {
  const m = new Map();
  for (const r of gunler) if (r[idx] != null) m.set(r[0].slice(0, 4), r);
  return [...m.values()];
}
/** Seriyi en çok maxN noktaya indirger (grafik için); ilk ve son nokta korunur, uç değerler kaybolmasın diye aralık başına min/max seçilir. */
export function indirge(satirlar, idx, maxN = 400) {
  if (satirlar.length <= maxN) return satirlar;
  const kova = Math.ceil(satirlar.length / (maxN / 2));
  const out = [satirlar[0]];
  for (let i = 1; i < satirlar.length - 1; i += kova) {
    const dilim = satirlar.slice(i, Math.min(i + kova, satirlar.length - 1)).filter(r => r[idx] != null);
    if (!dilim.length) continue;
    let lo = dilim[0], hi = dilim[0];
    for (const r of dilim) { if (r[idx] < lo[idx]) lo = r; if (r[idx] > hi[idx]) hi = r; }
    (lo[0] < hi[0] ? [lo, hi] : [hi, lo]).forEach(r => { if (r !== out[out.length - 1]) out.push(r); });
  }
  out.push(satirlar[satirlar.length - 1]);
  return out;
}

/* ---------- CSV ---------- */
/** excelTR: ayraç ';', ondalık virgül (Türkçe Excel). Aksi halde ',' ve nokta. UTF-8 BOM eklenir. */
export function csvUret(basliklar, satirlar, { excelTR = true } = {}) {
  const ayrac = excelTR ? ';' : ',';
  const hucre = v => {
    if (v == null) return '';
    let s = typeof v === 'number' ? (excelTR ? String(v).replace('.', ',') : String(v)) : String(v);
    if (/["\n\r]/.test(s) || s.includes(ayrac)) s = '"' + s.replace(/"/g, '""') + '"';
    // CSV enjeksiyonu: formül gibi başlayan metni etkisizleştir
    else if (typeof v === 'string' && /^[=+\-@]/.test(s)) s = "'" + s;
    return s;
  };
  return '﻿' + [basliklar, ...satirlar].map(r => r.map(hucre).join(ayrac)).join('\r\n') + '\r\n';
}

/* ---------- güncellik ---------- */
/** Beklenen son bülten tarihi: hafta içi 15:30'dan (TR) sonra bugünkü, öncesinde önceki iş günü. Tatilleri bilmez. */
export function beklenenBulten(simdi = new Date()) {
  const tr = new Date(simdi.getTime() + 3 * 3600e3);
  let gun = tr.toISOString().slice(0, 10);
  const dk = tr.getUTCHours() * 60 + tr.getUTCMinutes();
  const hg = haftaGunu(gun);
  const yayinli = hg >= 1 && hg <= 5 && dk >= 15 * 60 + 40;
  if (!yayinli) gun = gunEkle(gun, -1);
  while ([0, 6].includes(haftaGunu(gun))) gun = gunEkle(gun, -1);
  return gun;
}
/** 'guncel' | 'bekleniyor' | 'eski' */
export function guncellikDurumu(sonTarih, simdi = new Date()) {
  const beklenen = beklenenBulten(simdi);
  if (sonTarih >= beklenen) return { durum: 'guncel', beklenen };
  const fark = gunFarki(sonTarih, istanbulBugun(simdi));
  return { durum: fark > 4 ? 'eski' : 'bekleniyor', beklenen, fark };
}

/* ---------- alarm ---------- */
/**
 * a: {tur:'hedef'|'yuzde', yon:'ustu'|'altina'|'ikisi', deger, baz}
 * kur: kontrol edilen kurun 1 birim TL karşılığı. Dönüş: {tetik:boolean, fark?:yüzde}
 */
export function alarmDurumu(a, kur) {
  if (!Number.isFinite(kur) || !Number.isFinite(a.deger)) return { tetik: false };
  if (a.tur === 'hedef') {
    const tetik = a.yon === 'altina' ? kur <= a.deger : kur >= a.deger;
    return { tetik };
  }
  const fark = yuzdeDegisim(kur, a.baz);
  if (fark == null) return { tetik: false };
  const tetik = a.yon === 'ustu' ? fark >= a.deger : a.yon === 'altina' ? fark <= -a.deger : Math.abs(fark) >= a.deger;
  return { tetik, fark };
}
