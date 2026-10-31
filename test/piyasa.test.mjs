import test from 'node:test';
import assert from 'node:assert/strict';
import { ayristir, birlestir, piyasaKapali, getir, SERI_UZUNLUK } from '../scripts/lib/piyasa.mjs';

const yanit = (ts, tr = 49.6) => ({ base: 'USD', timestamp: ts, rates: { TRY: tr, EUR: 0.8935, GBP: 0.75, JPY: 157.2, CHF: 0.82, KRW: 1333.4, XYZ: 5 } });

test('çapraz kur: 1 birim kaç TL', () => {
  const r = ayristir(yanit(1793458800));
  assert.equal(r.kurlar.USD, 49.6);
  assert.equal(r.kurlar.EUR, Number((49.6 / 0.8935).toPrecision(6)));
  assert.equal(r.kurlar.JPY, Number((49.6 / 157.2).toPrecision(6)));
  assert.equal(r.kurlar.XYZ, undefined, 'künyede olmayan kod alınmaz');
  assert.equal(r.zaman, new Date(1793458800 * 1000).toISOString());
});

test('bozuk yanıt reddedilir', () => {
  assert.throws(() => ayristir({ error: true, description: 'Invalid App ID' }), /rates yok/);
  assert.throws(() => ayristir({ base: 'EUR', rates: { TRY: 1 } }), /baz/);
  assert.throws(() => ayristir({ base: 'USD', rates: { EUR: 1 } }), /TRY/);
});

test('aynı zaman damgası yeniden yazılmaz', () => {
  const a = birlestir(null, ayristir(yanit(1000)));
  assert.equal(birlestir(a, ayristir(yanit(1000))), null);
});

test('24 saatlik seri ve değişim', () => {
  let d = null;
  for (let h = 0; h <= 30; h++) d = birlestir(d, ayristir(yanit(h * 3600, 49 + h * 0.1)));
  assert.equal(d.saatler.length, SERI_UZUNLUK);
  assert.equal(d.seri.USD.length, SERI_UZUNLUK);
  const beklenen = Math.round(((52 - 49.6) / 49.6) * 1e6) / 1e4; // 30. saat vs 6. saat
  assert.ok(Math.abs(d.g24.USD - beklenen) < 1e-3, `${d.g24.USD} ≈ ${beklenen}`);
});

test('ilk ölçümde değişim yok', () => {
  const d = birlestir(null, ayristir(yanit(5000)));
  assert.equal(d.g24.USD, null);
});

test('piyasa saatleri', () => {
  assert.equal(piyasaKapali(new Date('2026-10-31T12:00:00Z')), true);  // Cumartesi
  assert.equal(piyasaKapali(new Date('2026-11-01T20:00:00Z')), true);  // Pazar akşam öncesi
  assert.equal(piyasaKapali(new Date('2026-11-01T21:30:00Z')), false); // Pazar açılış
  assert.equal(piyasaKapali(new Date('2026-11-02T09:00:00Z')), false); // Pazartesi
  assert.equal(piyasaKapali(new Date('2026-10-30T22:30:00Z')), true);  // Cuma kapanış
});

test('anahtar yoksa ve kota dolunca açık hata', async () => {
  await assert.rejects(getir(''), /OXR_APP_ID/);
  const sahte = async () => ({ status: 429, ok: false, json: async () => ({}) });
  await assert.rejects(getir('x', { fetchFn: sahte }), /kotası/);
});

// --- Tarayıcı/e-posta ortak kuralı: uyarı hangi kurla karşılaştırılır ---
import { uyariKuru, kullanilabilir } from '../public/assets/js/saatlik-veri.js';
const SON = { tarih: '2026-10-30', kurlar: { USD: [49.5, 49.6, null, null], JPY: [31.5, 31.7, null, null] } };
const BIRIM = { USD: { birim: 1 }, JPY: { birim: 100 } };
const PZT = Date.parse('2026-11-02T10:00:00Z'); // piyasa açık
const SJ = { zaman: '2026-11-02T09:00:00Z', kurlar: { USD: 50.1, JPY: 0.3172 } };

test('uyarı: taze piyasa verisi varsa piyasa kuru kullanılır', () => {
  const s = uyariKuru({ kod: 'USD', tur: 'hedef' }, SON, BIRIM, SJ, PZT);
  assert.deepEqual(s, { kur: 50.1, kaynak: 'piyasa', zaman: SJ.zaman });
});
test('uyarı: piyasa verisi bayatsa ya da yoksa TCMB bültenine düşülür', () => {
  const bayat = uyariKuru({ kod: 'USD', tur: 'hedef' }, SON, BIRIM, SJ, PZT + 4 * 3600e3);
  assert.equal(bayat.kaynak, 'tcmb'); assert.equal(bayat.kur, 49.5);
  assert.equal(uyariKuru({ kod: 'USD', tur: 'hedef' }, SON, BIRIM, null, PZT).kaynak, 'tcmb');
  const jpy = uyariKuru({ kod: 'JPY', tur: 'hedef' }, SON, BIRIM, null, PZT);
  assert.equal(jpy.kur, 0.315, 'TCMB 100 birimlik kur 1 birime çevrilir');
});
test('uyarı: TCMB bazlı eski yüzde uyarısı TCMB ile, piyasa bazlı olan piyasa ile karşılaştırılır', () => {
  assert.equal(uyariKuru({ kod: 'USD', tur: 'yuzde' }, SON, BIRIM, SJ, PZT).kaynak, 'tcmb');
  assert.equal(uyariKuru({ kod: 'USD', tur: 'yuzde', kaynak: 'piyasa' }, SON, BIRIM, SJ, PZT).kaynak, 'piyasa');
});
test('tazelik: hafta sonu son değer geçerli, hafta içi 3 saat sınırı', () => {
  const cuma = { zaman: '2026-10-30T21:00:00Z' };
  assert.equal(kullanilabilir(cuma, Date.parse('2026-10-31T12:00:00Z')), true);   // Cumartesi
  assert.equal(kullanilabilir(cuma, Date.parse('2026-11-02T10:00:00Z')), false);  // Pazartesi, eski
  assert.equal(kullanilabilir(null), false);
});
