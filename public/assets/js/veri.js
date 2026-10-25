// Veri yükleyici: son.json / ozet.json / meta.json / arsiv/KOD.json. Bellek önbelleği + son bilinen veri yedeği.
import { depo } from './ui.js';
const onbellek = new Map();
let cevrimdisi = false;
export const cevrimdisiMi = () => cevrimdisi;

async function getir(url, yedekAnahtar) {
  if (onbellek.has(url)) return onbellek.get(url);
  const p = (async () => {
    try {
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if (yedekAnahtar) depo.yaz(yedekAnahtar, j);
      return j;
    } catch (e) {
      const y = yedekAnahtar && depo.oku(yedekAnahtar);
      if (y) { cevrimdisi = true; return y; }
      throw e;
    }
  })();
  onbellek.set(url, p);
  p.catch(() => onbellek.delete(url));
  return p;
}
export const metaYukle = () => getir('/data/meta.json', 'meta');
export const sonYukle = () => getir('/data/son.json', 'son');
export const ozetYukle = () => getir('/data/ozet.json', 'ozet');
export const durumYukle = () => getir('/data/durum.json').catch(() => null);
export const arsivYukle = kod => getir(`/data/arsiv/${kod}.json`);

/** Sayfa için gereken temel veri. */
export async function temel() {
  const [meta, son] = await Promise.all([metaYukle(), sonYukle()]);
  const birim = Object.fromEntries(meta.map(m => [m.kod, m]));
  return { meta, birim, son };
}
/** Bir para biriminin, kur türü idx için ŞU ANKİ (son bülten) 1 birimlik TL karşılığı. */
export function guncelTl(son, birim, kod, idx = 1) {
  if (kod === 'TRY') return 1;
  const r = son.kurlar[kod];
  if (!r) return null;
  const v = r[idx - 1] ?? r[0];
  return v / (birim[kod]?.birim || 1);
}
