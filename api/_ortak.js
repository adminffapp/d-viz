// Uyarı API'si ortak yardımcıları. Gizli anahtarlar yalnızca ortam değişkenlerinden okunur.
import { createHash, randomBytes } from 'node:crypto';
import { anahtarKaynagi } from './_firestore.js';

export const ORIGIN = () => process.env.SITE_ORIGIN || 'https://doviz.ffapplabs.com';
export const SURE_GUN = 180; // kayıt saklama süresi (KVKK: gereğinden uzun tutulmaz)
export const HEPSI_KODLAR = ['USD', 'AUD', 'DKK', 'EUR', 'GBP', 'CHF', 'SEK', 'CAD', 'KWD', 'NOK', 'SAR', 'JPY', 'RON', 'RUB', 'CNY', 'PKR', 'QAR', 'KRW', 'AZN', 'AED'];

const depoVar = () => !!anahtarKaynagi() || !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
export const yapilandirildi = () => !!(depoVar() && process.env.RESEND_API_KEY && process.env.RESEND_FROM);
export const rastgele = (n = 24) => randomBytes(n).toString('hex');
export const ozet = s => createHash('sha256').update(String(s).toLowerCase()).digest('hex').slice(0, 32);
export const kacis = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const epostaGecerli = s => typeof s === 'string' && s.length <= 254 && /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(s);

/** Depo komutu: komut(['SET','k','v']). FIREBASE_SERVICE_ACCOUNT varsa Firestore, yoksa Upstash Redis REST. */
export async function komut(args) {
  if (anahtarKaynagi()) return (await (await import('./_firestore.js')).firestoreKomutuAl())(args);
  const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.UPSTASH_REDIS_REST_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  if (!r.ok) throw new Error('depo hatası ' + r.status);
  return (await r.json()).result;
}
export async function epostaGonder({ to, subject, html, text }) {
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.RESEND_FROM, to: [to], subject, html, text }) });
  if (!r.ok) throw new Error('e-posta gönderilemedi ' + r.status);
}
export function istemciIp(req) { return String((req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || 'bilinmiyor').trim(); }
export async function hizSiniri(anahtar, sinir, sn) {
  const n = await komut(['INCR', anahtar]);
  if (n === 1) await komut(['EXPIRE', anahtar, sn]);
  return n <= sinir;
}
export function json(res, kod, nesne) { res.statusCode = kod; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(nesne)); }
export function sayfaYanit(res, kod, baslik, metin) {
  res.statusCode = kod; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
  res.end(`<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${kacis(baslik)} | Forex</title><body style="font:18px/1.6 system-ui,sans-serif;max-width:560px;margin:15vh auto;padding:0 20px;background:#0F0B08;color:#E4D5B7"><h1 style="font-weight:300">${kacis(baslik)}</h1><p>${kacis(metin)}</p><p><a style="color:#D4E27A" href="${ORIGIN()}/uyarilar/">Uyarılara dön</a></p></body></html>`);
}
export const kayitAnahtar = id => `uyari:${id}`;
