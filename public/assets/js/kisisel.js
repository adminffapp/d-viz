// Tarayıcıda saklanan kişisel veriler (üyelik yok): favoriler, sepet, hesap geçmişi, alarmlar.
import { depo } from './ui.js';

const liste = (anahtar) => ({
  oku: () => { const v = depo.oku(anahtar, []); return Array.isArray(v) ? v : []; },
  yaz: v => depo.yaz(anahtar, v),
});

export const favoriler = {
  ...liste('favoriler'),
  var(kod) { return this.oku().includes(kod); },
  degistir(kod) { const l = this.oku(); const i = l.indexOf(kod); if (i > -1) l.splice(i, 1); else l.push(kod); this.yaz(l); window.dispatchEvent(new CustomEvent('favori-degisti')); return i === -1; },
  tasi(kod, yon) { const l = this.oku(); const i = l.indexOf(kod); const j = i + yon; if (i < 0 || j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; this.yaz(l); window.dispatchEvent(new CustomEvent('favori-degisti')); },
};

export const sepet = {
  ...liste('sepet'),   // [{kod, miktar}]
  ekle(kod, miktar) { const l = this.oku(); const o = l.find(x => x.kod === kod); if (o) o.miktar += miktar; else l.push({ kod, miktar }); this.yaz(l); },
  guncelle(i, kod, miktar) { const l = this.oku(); if (l[i]) { l[i] = { kod, miktar }; this.yaz(l); } },
  sil(i) { const l = this.oku(); l.splice(i, 1); this.yaz(l); },
  temizle() { this.yaz([]); },
  tarih: { oku: () => depo.oku('sepet-tarih', ''), yaz: v => depo.yaz('sepet-tarih', v) },
};

export const gecmis = {
  ...liste('hesap-gecmisi'),
  ekle(kayit) {
    const l = this.oku().filter(x => x.url !== kayit.url);
    l.unshift({ ...kayit, zaman: new Date().toISOString() });
    this.yaz(l.slice(0, 12));
  },
  temizle() { this.yaz([]); },
};

export const alarmlar = {
  ...liste('alarmlar'),
  ekle(a) { const l = this.oku(); l.push({ id: Math.random().toString(36).slice(2, 10), aktif: true, olusturma: new Date().toISOString(), ...a }); this.yaz(l); return l.at(-1); },
  sil(id) { this.yaz(this.oku().filter(x => x.id !== id)); },
  guncelle(id, d) { this.yaz(this.oku().map(x => (x.id === id ? { ...x, ...d } : x))); },
};

/** Tüm kişisel veriyi tek dosyada dışa aktarma / içe alma. */
export const tumu = {
  disaAktar: () => ({ surum: 1, zaman: new Date().toISOString(), favoriler: favoriler.oku(), sepet: sepet.oku(), alarmlar: alarmlar.oku() }),
  iceAl(o) {
    if (!o || o.surum !== 1) throw new Error('Tanınmayan dosya');
    if (Array.isArray(o.favoriler)) favoriler.yaz(o.favoriler.filter(x => /^[A-Z]{3}$/.test(x)));
    if (Array.isArray(o.sepet)) sepet.yaz(o.sepet.filter(x => /^[A-Z]{3}$/.test(x.kod) && Number.isFinite(x.miktar)));
    if (Array.isArray(o.alarmlar)) alarmlar.yaz(o.alarmlar.filter(x => /^[A-Z]{3}$/.test(x.kod)));
  },
};
