// GET /api/onay?id=..&t=..  — e-posta onayı (çift onay). Onaylanmadan uyarı gönderilmez.
import { yapilandirildi, komut, sayfaYanit, kayitAnahtar } from './_ortak.js';
import { timingSafeEqual } from 'node:crypto';
const esit = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
export default async function handler(req, res) {
  if (!yapilandirildi()) return sayfaYanit(res, 503, 'Servis kapalı', 'E-posta uyarıları bu sitede etkin değil.');
  const { id = '', t = '' } = req.query || {};
  if (!/^[a-f0-9]{16}$/.test(id)) return sayfaYanit(res, 400, 'Geçersiz bağlantı', 'Bağlantı eksik ya da bozuk.');
  try {
    const ham = await komut(['GET', kayitAnahtar(id)]);
    if (!ham) return sayfaYanit(res, 404, 'Uyarı bulunamadı', 'Bu uyarı süresi dolduğu için silinmiş ya da daha önce iptal edilmiş olabilir.');
    const k = JSON.parse(ham);
    if (!esit(k.onayToken, t)) return sayfaYanit(res, 403, 'Geçersiz bağlantı', 'Onay kodu eşleşmedi.');
    if (k.durum !== 'onayli') { k.durum = 'onayli'; k.onay = new Date().toISOString(); const ttl = await komut(['TTL', kayitAnahtar(id)]); await komut(['SET', kayitAnahtar(id), JSON.stringify(k), 'EX', ttl > 0 ? ttl : 86400 * 180]); }
    return sayfaYanit(res, 200, 'Uyarınız onaylandı', 'Kur koşula ulaştığında e-posta alacaksınız. Uyarı tek seferliktir; her e-postada iptal bağlantısı bulunur.');
  } catch (e) { console.error('onay hatasi', e.message); return sayfaYanit(res, 500, 'Hata', 'Şu an işlenemedi. Biraz sonra tekrar deneyin.'); }
}
