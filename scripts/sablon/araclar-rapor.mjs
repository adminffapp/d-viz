import { sayfa } from './layout.mjs';
export async function uret(c, ekle) {
  ekle('/rapor/', sayfa({ yol: '/rapor/', baslik: 'Rapor', aciklama: 'Hesaplama ve kur raporu: yazdır ya da PDF olarak kaydet.', govde: '<div class="rapor" id="rapor"><p class="soluk">Rapor hazırlanıyor…</p></div>', js: ['rapor.js'], surum: c.surum, noindex: true }), { sitemap: false });
}
