import { $ } from './ui.js';
import { zamanMakinesi } from './zaman.js';
import { faturaDemo, hizliDemo, grafikDemo, karsiDemo } from './demolar.js';
import { ortam, paraSecenekleri } from './ortak.js';
import { alarmlar } from './kisisel.js';
import { tutarOku, kurYaz } from './hesap.js';
import { toast, olay } from './ui.js';

const hata = (kap, e) => { console.error(e); if (kap) kap.insertAdjacentHTML('beforeend', '<p class="hata-metni" role="alert">Bu bölüm yüklenemedi. Sayfayı yenileyin.</p>'); };
const calistir = (sel, f, ...a) => { const k = $(sel); if (k) f(k, ...a).catch(e => hata(k, e)); };

calistir('#zaman', zamanMakinesi);
// Hesaplayıcı kutuları canlı görünür; gerçek hesap kendi sayfasında: kutunun her yerine tıklamak oraya götürür.
document.querySelectorAll('.hero-kutu').forEach(kutu => {
  const git = kutu.dataset.git || '/gecmis-kur/';
  kutu.querySelectorAll('input,select,button').forEach(e => e.setAttribute('tabindex', '-1'));
  kutu.addEventListener('mousedown', e => e.preventDefault());
  kutu.addEventListener('click', e => { e.preventDefault(); location.href = git; });
});
calistir('[data-demo=fatura]', faturaDemo);
calistir('[data-demo=hizli]', hizliDemo);
calistir('[data-demo=grafik]', grafikDemo);
calistir('[data-demo=karsi]', karsiDemo);

// Hero madeni: geniş ekranda gerçek 3B (sürükleyerek döndürülür); olmazsa düz görsel kalır.
const madeni = $('#madeni');
const uc = madeni && matchMedia('(min-width: 981px)').matches && !(navigator.connection && navigator.connection.saveData);
if (uc) {
  const baslat3 = () => import('./forex3d.js').then(m => { if (!m.forexKur(madeni, '/assets/forex-yuz.webp', { intro: !matchMedia('(prefers-reduced-motion: reduce)').matches, onHata: () => {} })) throw 0; }).catch(() => {});
  ('requestIdleCallback' in window ? requestIdleCallback(baslat3, { timeout: 2500 }) : setTimeout(baslat3, 1200));
}

// Cümledeki boşluk: "Dolar [ ] olunca haber ver"
const cumle = $('#uyari-cumle');
if (cumle) ortam().then(o => {
  const kod = $('[name=kod]', cumle), deger = $('[name=deger]', cumle);
  kod.innerHTML = paraSecenekleri(o, 'USD', { tl: false, yalnizPopuler: true }).replace(/ · [^<]+/g, '');
  const guncelle = () => { const r = o.son.kurlar[kod.value]; if (r) deger.placeholder = kurYaz(r[0] / (o.birim[kod.value].birim || 1)).replace(/\d$/, ''); };
  kod.addEventListener('change', guncelle); guncelle();
  cumle.addEventListener('submit', e => {
    e.preventDefault();
    const d = tutarOku(deger.value);
    if (d == null || d <= 0) { deger.focus(); toast('Hedef kuru yazın, örneğin ' + deger.placeholder, 'hata'); return; }
    const sonKur = o.son.kurlar[kod.value][0] / (o.birim[kod.value].birim || 1);
    olay('uyari-cumle', { kod: kod.value });
    location.href = `/uyarilar/?kod=${kod.value}&deger=${encodeURIComponent(d)}&yon=${d >= sonKur ? 'ustu' : 'altina'}`;
  });
});
