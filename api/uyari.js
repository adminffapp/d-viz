// POST /api/uyari  — e-posta kur uyarısı oluşturur (çift onaylı). Üyelik yok; e-posta yalnızca bu uyarı için saklanır.
import { ORIGIN, SURE_GUN, HEPSI_KODLAR, yapilandirildi, rastgele, ozet, kacis, epostaGecerli, komut, epostaGonder, istemciIp, hizSiniri, json, kayitAnahtar } from './_ortak.js';

const sayi = x => (typeof x === 'number' ? x : Number(String(x).replace(',', '.')));

export default async function handler(req, res) {
  if (req.method === 'GET') return json(res, 200, { acik: yapilandirildi() });
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { hata: 'yontem' }); }
  if (!yapilandirildi()) return json(res, 503, { hata: 'kapali', mesaj: 'E-posta uyarısı bu sitede henüz etkin değil.' });
  let g = req.body;
  if (typeof g === 'string') { try { g = JSON.parse(g); } catch { g = null; } }
  if (!g || typeof g !== 'object') return json(res, 400, { hata: 'gecersiz' });
  if (g.web) return json(res, 200, { tamam: true }); // bot tuzağı (gizli alan dolu): sessizce yut
  const eposta = String(g.eposta || '').trim();
  const kod = String(g.kod || '').toUpperCase();
  const tur = g.tur === 'yuzde' ? 'yuzde' : 'hedef';
  const yon = ['ustu', 'altina', 'ikisi'].includes(g.yon) ? g.yon : 'ustu';
  const deger = sayi(g.deger), baz = sayi(g.baz);
  if (!epostaGecerli(eposta)) return json(res, 400, { hata: 'eposta', mesaj: 'E-posta adresi geçerli görünmüyor.' });
  if (!HEPSI_KODLAR.includes(kod)) return json(res, 400, { hata: 'kod', mesaj: 'Para birimi tanınmadı.' });
  if (!Number.isFinite(deger) || deger <= 0 || deger > 1e9) return json(res, 400, { hata: 'deger', mesaj: 'Hedef değer geçerli değil.' });
  if (tur === 'yuzde' && (!Number.isFinite(baz) || baz <= 0 || deger > 100)) return json(res, 400, { hata: 'deger', mesaj: 'Yüzde değeri 0 ile 100 arasında olmalı.' });
  if (g.onay !== true) return json(res, 400, { hata: 'onay', mesaj: 'E-posta ile bilgilendirilmeyi onaylamanız gerekir.' });
  try {
    const ip = ozet(istemciIp(req));
    if (!(await hizSiniri('hiz:uyari:' + ip, 6, 3600))) return json(res, 429, { hata: 'sinir', mesaj: 'Çok fazla deneme. Bir saat sonra tekrar deneyin.' });
    const eKey = 'e:' + ozet(eposta);
    const mevcut = Number((await komut(['GET', eKey])) || 0);
    if (mevcut >= 5) return json(res, 429, { hata: 'limit', mesaj: 'Bir e-posta adresi için en fazla 5 aktif uyarı tanımlanabilir.' });
    const id = rastgele(8), onayToken = rastgele(16), cikisToken = rastgele(16);
    const kayit = { id, eposta, kod, tur, yon, deger, baz: tur === 'yuzde' ? baz : null, durum: 'bekliyor', onayToken, cikisToken, olusturma: new Date().toISOString() };
    await komut(['SET', kayitAnahtar(id), JSON.stringify(kayit), 'EX', SURE_GUN * 86400]);
    await komut(['SADD', 'uyarilar', id]);
    await komut(['INCR', eKey]); await komut(['EXPIRE', eKey, SURE_GUN * 86400]);
    const onayUrl = `${ORIGIN()}/api/onay?id=${id}&t=${onayToken}`;
    const ozetMetin = tur === 'hedef' ? `${kod}/TL ${yon === 'altina' ? 'altına inerse' : 'üstüne çıkarsa'} ${deger} ₺` : `${kod}/TL kuru ${baz} ₺ düzeyinden %${deger} ${yon === 'ustu' ? 'artarsa' : yon === 'altina' ? 'azalırsa' : 'artarsa ya da azalırsa'}`;
    await epostaGonder({ to: eposta, subject: 'Kur uyarınızı onaylayın', text: `Forex kur uyarısı: ${ozetMetin}.\n\nOnaylamak için: ${onayUrl}\n\nBu e-postayı siz istemediyseniz yok sayın; onaylanmayan kayıt silinir.`, html: `<p>Forex kur uyarısı: <b>${kacis(ozetMetin)}</b>.</p><p><a href="${onayUrl}">Uyarıyı onayla</a></p><p style="color:#666;font-size:13px">Bu e-postayı siz istemediyseniz yok sayın; onaylanmayan kayıt ${SURE_GUN} gün içinde silinir.</p>` });
    return json(res, 200, { tamam: true, mesaj: 'Onay bağlantısı e-posta adresinize gönderildi.' });
  } catch (e) {
    console.error('uyari hatasi', e.message);
    return json(res, 500, { hata: 'sunucu', mesaj: 'Şu an kaydedilemedi. Biraz sonra tekrar deneyin.' });
  }
}
