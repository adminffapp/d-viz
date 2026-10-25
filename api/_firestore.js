// Firestore deposu: Upstash komutlarının küçük bir alt kümesini Firestore üzerinde yapar.
// Anahtar-değer kayıtları `ffd_kv`, kümeler `ffd_set_<ad>` koleksiyonlarında tutulur.
// Süre sonu `exp` alanındadır (ms); okunurken süresi geçmiş kayıt yok sayılıp silinir.
// İsterseniz Firestore konsolundan `ffd_kv` için `exp_ts` alanına TTL ilkesi ekleyerek eski kayıtları kendiliğinden temizletebilirsiniz.

const KV = 'ffd_kv';
const kimlik = k => encodeURIComponent(String(k));

export function firestoreKomut(db, simdi = () => Date.now()) {
  const ref = k => db.collection(KV).doc(kimlik(k));
  async function oku(k) {
    const s = await ref(k).get();
    if (!s.exists) return null;
    const d = s.data();
    if (d.exp && d.exp <= simdi()) { await ref(k).delete(); return null; }
    return d;
  }
  const yaz = (k, v, exp) => ref(k).set({ v, exp: exp || null, exp_ts: exp ? new Date(exp) : null });

  return async function komut(args) {
    const [c, a, b] = args;
    switch (c) {
      case 'GET': { const d = await oku(a); return d ? d.v : null; }
      case 'SET': {
        // SET k v EX sn  => args: ['SET', k, v, 'EX', sn]
        const ex = args[3] === 'EX' ? Number(args[4]) : 0;
        await yaz(a, b, ex ? simdi() + ex * 1000 : null); return 'OK';
      }
      case 'DEL': { const d = await oku(a); if (d) await ref(a).delete(); return d ? 1 : 0; }
      case 'INCR': case 'DECR': {
        const adim = c === 'INCR' ? 1 : -1;
        return db.runTransaction(async t => {
          const s = await t.get(ref(a)); let n = 0, exp = null;
          if (s.exists) { const d = s.data(); if (!d.exp || d.exp > simdi()) { n = Number(d.v) || 0; exp = d.exp || null; } }
          n += adim; t.set(ref(a), { v: String(n), exp, exp_ts: exp ? new Date(exp) : null }); return n;
        });
      }
      case 'EXPIRE': {
        const d = await oku(a); if (!d) return 0;
        const exp = simdi() + Number(b) * 1000; await ref(a).update({ exp, exp_ts: new Date(exp) }); return 1;
      }
      case 'TTL': {
        const d = await oku(a); if (!d) return -2; if (!d.exp) return -1;
        return Math.max(1, Math.ceil((d.exp - simdi()) / 1000));
      }
      case 'SADD': await db.collection('ffd_set_' + a).doc(kimlik(b)).set({ m: String(b) }); return 1;
      case 'SREM': await db.collection('ffd_set_' + a).doc(kimlik(b)).delete(); return 1;
      case 'SMEMBERS': { const s = await db.collection('ffd_set_' + a).get(); return s.docs.map(d => d.data().m); }
      default: throw new Error('desteklenmeyen komut ' + c);
    }
  };
}

import { existsSync, readFileSync } from 'node:fs';
const YEREL = new URL('../firebase-adminsdk.json', import.meta.url); // yalnızca yerel çalıştırma için; .gitignore'da

/** Anahtar: önce ortam değişkeni, yoksa proje kökündeki yerel dosya. Yoksa null. */
export function anahtarKaynagi() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) return process.env.FIREBASE_SERVICE_ACCOUNT;
  if (process.env.VERCEL) return null; // canlı ortamda yerel dosya okunmaz
  try { return existsSync(YEREL) ? readFileSync(YEREL, 'utf8') : null; } catch { return null; }
}

let _komut;
/** Ortam değişkeni FIREBASE_SERVICE_ACCOUNT: hizmet hesabı JSON'u (düz metin ya da base64). */
export async function firestoreKomutuAl() {
  if (_komut) return _komut;
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  let ham = anahtarKaynagi().trim();
  if (!ham.startsWith('{')) ham = Buffer.from(ham, 'base64').toString('utf8');
  const hesap = JSON.parse(ham);
  if (hesap.private_key) hesap.private_key = hesap.private_key.replace(/\\n/g, '\n');
  if (!getApps().length) initializeApp({ credential: cert(hesap) });
  _komut = firestoreKomut(getFirestore());
  return _komut;
}
