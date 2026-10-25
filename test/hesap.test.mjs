import test from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../public/assets/js/hesap.js';

const arsiv = { kod: 'USD', birim: 1, gunler: [
  ['2024-03-01', 30.0, 30.1, 29.8, 30.3],
  ['2024-03-04', 30.5, 30.6, null, null],
  ['2024-03-05', 31.0, 31.1, null, null],
  ['2024-03-08', 31.4, 31.5, null, null],
] };

test('yuvarla: yarım yukarı ve kayan nokta', () => {
  assert.equal(H.yuvarla(1.005, 2), 1.01);
  assert.equal(H.yuvarla(2.675, 2), 2.68);
  assert.equal(H.yuvarla(-1.005, 2), -1.01);
  assert.equal(H.yuvarla(0.1 + 0.2, 2), 0.3);
});
test('tutarOku: Türkçe ve İngilizce biçimler', () => {
  assert.equal(H.tutarOku('1.234,56'), 1234.56);
  assert.equal(H.tutarOku('1,234.56'), 1234.56);
  assert.equal(H.tutarOku('1234,5'), 1234.5);
  assert.equal(H.tutarOku('1.000'), 1000);
  assert.equal(H.tutarOku('12.5'), 12.5);
  assert.equal(H.tutarOku('1 000 000'), 1000000);
  assert.equal(H.tutarOku('abc'), null);
  assert.equal(H.tutarOku(''), null);
  assert.equal(H.tutarOku('1.2.3'), null);
});
test('sayiYaz tr-TR', () => {
  assert.equal(H.sayiYaz(1234.5, 2), '1.234,50');
  assert.equal(H.kurHane(39.7), 4);
  assert.equal(H.kurHane(0.0047), 6);
});
test('kurBul: tam gün, hafta sonu, tatil, başlangıç öncesi', () => {
  let r = H.kurBul(arsiv, '2024-03-05');
  assert.equal(r.tarih, '2024-03-05'); assert.equal(r.neden, 'tam'); assert.equal(r.kur, 31.0);
  r = H.kurBul(arsiv, '2024-03-02'); // cumartesi
  assert.equal(r.tarih, '2024-03-01'); assert.equal(r.neden, 'hafta-sonu');
  r = H.kurBul(arsiv, '2024-03-06'); // çarşamba, bülten yok
  assert.equal(r.tarih, '2024-03-05'); assert.equal(r.neden, 'bulten-yok');
  r = H.kurBul(arsiv, '2024-02-01');
  assert.equal(r.hata, 'baslangic-oncesi');
  r = H.kurBul(arsiv, '2024-03-10'); // arşivin sonundan sonra, pazar
  assert.equal(r.tarih, '2024-03-08'); assert.equal(r.neden, 'hafta-sonu');
});
test('kurBul: efektif yoksa döviz alışa düşer ve bildirir', () => {
  let r = H.kurBul(arsiv, '2024-03-05', 3);
  assert.equal(r.turDegisti, true); assert.equal(r.kur, 31.0);
  r = H.kurBul(arsiv, '2024-03-05', 3, { turYedek: false });
  assert.equal(r.hata, 'tur-yok');
});
test('nedenMetni hafta sonunu ve tatili ayırır', () => {
  assert.match(H.nedenMetni(H.kurBul(arsiv, '2024-03-02')), /hafta sonu/);
  assert.match(H.nedenMetni(H.kurBul(arsiv, '2024-03-06')), /tatil/);
  assert.equal(H.nedenMetni(H.kurBul(arsiv, '2024-03-05')), '');
});
test('cevir ve net tutar', () => {
  assert.equal(H.yuvarla(H.cevir(100, 31, 1), 2), 3100);
  assert.equal(H.yuvarla(H.cevir(3100, 1, 31), 2), 100);
  const n = H.netTutar(1000, 1.5, 10);
  assert.equal(n.kesinti, 25); assert.equal(n.net, 975);
});
test('istatistik ve yüzde', () => {
  const s = H.istatistik(arsiv.gunler, 1);
  assert.equal(s.min, 30); assert.equal(s.max, 31.4); assert.equal(s.ilk, 30); assert.equal(s.son, 31.4);
  assert.equal(H.yuvarla(s.yuzde, 4), 4.6667);
  assert.equal(H.yuzdeYaz(4.6667), '+4,67%');
  assert.equal(H.yuzdeYaz(-0.004), '0,00%');
  assert.equal(H.yuzdeYaz(-1.5), '−1,50%');
});
test('aylikSon / indirge', () => {
  assert.equal(H.aylikSon(arsiv.gunler).length, 1);
  const buyuk = Array.from({ length: 2000 }, (_, i) => [H.gunEkle('2020-01-01', i), 10 + Math.sin(i / 20) * 3, 0, 0, 0]);
  const k = H.indirge(buyuk, 1, 400);
  assert.ok(k.length <= 420);
  assert.equal(k[0], buyuk[0]); assert.equal(k.at(-1), buyuk.at(-1));
  const maks = Math.max(...buyuk.map(r => r[1])), kMaks = Math.max(...k.map(r => r[1]));
  assert.ok(maks - kMaks < 0.05); // uç değerler kaybolmuyor
});
test('csvUret: Excel TR ve enjeksiyon', () => {
  const c = H.csvUret(['a', 'b'], [['=1+1', 1.5], ['x;y', 2]]);
  assert.ok(c.startsWith('﻿'));
  assert.ok(c.includes("'=1+1;1,5"));
  assert.ok(c.includes('"x;y";2'));
  const e = H.csvUret(['a'], [[1.5]], { excelTR: false });
  assert.ok(e.includes('1.5'));
});
test('beklenenBulten ve güncellik', () => {
  const cuma1600 = new Date('2026-10-23T13:00:00Z'); // TR 16:00 cuma
  assert.equal(H.beklenenBulten(cuma1600), '2026-10-23');
  const cuma1000 = new Date('2026-10-23T07:00:00Z');
  assert.equal(H.beklenenBulten(cuma1000), '2026-10-22');
  const pazar = new Date('2026-10-25T09:00:00Z');
  assert.equal(H.beklenenBulten(pazar), '2026-10-23');
  assert.equal(H.guncellikDurumu('2026-10-23', pazar).durum, 'guncel');
  assert.equal(H.guncellikDurumu('2026-10-22', pazar).durum, 'bekleniyor');
  assert.equal(H.guncellikDurumu('2026-10-15', pazar).durum, 'eski');
});
test('tarih işlevleri', () => {
  assert.equal(H.gunEkle('2024-02-28', 2), '2024-03-01');
  assert.equal(H.gunFarki('2024-01-01', '2024-03-01'), 60);
  assert.equal(H.isoGecerli('2024-02-30'), false);
  assert.equal(H.tarihYaz('2024-03-02', { gun: true }), '2 Mart 2024 Cumartesi');
});
test('alarmDurumu: hedef ve yüzde', () => {
  assert.equal(H.alarmDurumu({ tur: 'hedef', yon: 'ustu', deger: 40 }, 40.01).tetik, true);
  assert.equal(H.alarmDurumu({ tur: 'hedef', yon: 'ustu', deger: 40 }, 39.99).tetik, false);
  assert.equal(H.alarmDurumu({ tur: 'hedef', yon: 'altina', deger: 40 }, 39.5).tetik, true);
  const y = H.alarmDurumu({ tur: 'yuzde', yon: 'ikisi', deger: 2, baz: 40 }, 39.1);
  assert.equal(y.tetik, true); assert.ok(y.fark < -2);
  assert.equal(H.alarmDurumu({ tur: 'yuzde', yon: 'ustu', deger: 2, baz: 40 }, 39.1).tetik, false);
  assert.equal(H.alarmDurumu({ tur: 'hedef', yon: 'ustu', deger: NaN }, 40).tetik, false);
});
