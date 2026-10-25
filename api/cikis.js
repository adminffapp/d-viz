// GET /api/cikis?id=..&t=..  — uyarıyı iptal eder ve kaydı (e-posta dahil) siler.
import { yapilandirildi, komut, sayfaYanit, kayitAnahtar, ozet } from './_ortak.js';
import { timingSafeEqual } from 'node:crypto';
const esit = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
export default async function handler(req, res) {
  if (!yapilandirildi()) return sayfaYanit(res, 503, 'Servis kapalı', 'E-posta uyarıları bu sitede etkin değil.');
  const { id = '', t = '' } = req.query || {};
  if (!/^[a-f0-9]{16}$/.test(id)) return sayfaYanit(res, 400, 'Geçersiz bağlantı', 'Bağlantı eksik ya da bozuk.');
  try {
    const ham = await komut(['GET', kayitAnahtar(id)]);
    if (!ham) return sayfaYanit(res, 200, 'Uyarı zaten yok', 'Bu uyarı daha önce silinmiş ya da süresi dolmuş.');
    const k = JSON.parse(ham);
    if (!esit(k.cikisToken, t)) return sayfaYanit(res, 403, 'Geçersiz bağlantı', 'İptal kodu eşleşmedi.');
    await komut(['DEL', kayitAnahtar(id)]); await komut(['SREM', 'uyarilar', id]);
    const sayac = Number((await komut(['GET', 'e:' + ozet(k.eposta)])) || 0);
    if (sayac > 0) await komut(['DECR', 'e:' + ozet(k.eposta)]);
    return sayfaYanit(res, 200, 'Uyarı iptal edildi', 'Uyarınız ve e-posta adresiniz sistemden silindi.');
  } catch (e) { console.error('cikis hatasi', e.message); return sayfaYanit(res, 500, 'Hata', 'Şu an işlenemedi. Biraz sonra tekrar deneyin.'); }
}
