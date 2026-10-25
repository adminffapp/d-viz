// Kur uyarısı oluşturma ve listeleme. Tarayıcı uyarısı yerel; e-posta uyarısı çift onaylı sunucu hizmetidir.
import { $, $$, kacis, sorgu, toast, olay } from './ui.js';
import { ortam, paraSecenekleri } from './ortak.js';
import { alarmlar } from './kisisel.js';
import { alarmMetni, kontrolEt } from './alarm.js';
import { tutarOku, kurYaz, tarihYaz, sayiYaz, yuzdeYaz, yuzdeDegisim } from './hesap.js';
import { AYAR } from './ayar.js';

export async function uyarilar(kok) {
  const o = await ortam();
  const f = n => $(`[name=${n}]`, kok);
  const [kod, tur, yon, deger] = ['kod', 'tur', 'yon', 'deger'].map(f);
  const eposta = f('eposta'), onay = f('onay'), kTar = f('k-tarayici'), kEp = f('k-eposta'), tuzak = f('web');
  const q = sorgu();
  kod.innerHTML = paraSecenekleri(o, q.kod || 'USD', { tl: false });
  if (q.yon === 'altina') yon.value = 'altina';
  if (q.deger) deger.value = q.deger;
  const guncelKur = () => { const r = o.son.kurlar[kod.value]; return r ? r[0] / o.birim[kod.value].birim : null; };
  function etiketler() {
    const k = guncelKur();
    $('.guncel', kok).textContent = k ? `Şu an: ${kurYaz(k)} ₺ (${tarihYaz(o.sonTarih, { kisa: true })} bülteni, döviz alış)` : '';
    const yuz = tur.value === 'yuzde';
    $('[for=u-deger]', kok).textContent = yuz ? 'Yüzde değişim (%)' : 'Hedef kur (₺)';
    $('.yon-hedef', kok).hidden = yuz; $('.yon-yuzde', kok).hidden = !yuz;
    yon.innerHTML = yuz ? '<option value="ikisi">Artarsa ya da azalırsa</option><option value="ustu">Artarsa</option><option value="altina">Azalırsa</option>' : '<option value="ustu">Şu seviyeye çıkarsa ya da üstüne</option><option value="altina">Şu seviyeye inerse ya da altına</option>';
    if (!yuz && q.yon && !etiketler.once) { yon.value = q.yon === 'altina' ? 'altina' : 'ustu'; }
    etiketler.once = true;
    $('.ep-alan', kok).hidden = !kEp.checked;
  }
  [kod, tur, kEp].forEach(x => x.addEventListener('input', etiketler)); etiketler();

  const durumKapali = AYAR.epostaUyari ? await fetch('/api/uyari').then(r => (r.ok ? r.json() : { acik: false })).then(j => !j.acik).catch(() => true) : true;
  if (durumKapali) { kEp.disabled = true; kEp.checked = false; $('.ep-bilgi', kok).textContent = 'E-posta uyarısı bu sitede şu an etkin değil. Tarayıcı uyarısı çalışır.'; etiketler(); }

  function listele() {
    const l = alarmlar.oku();
    const aktif = l.filter(a => a.aktif), bitmis = l.filter(a => !a.aktif);
    const satir = (a, bitti) => `<li><div class="sol"><b>${kacis(alarmMetni(a, o.birim))}</b><span class="kucuk soluk">${a.tarayici ? 'Tarayıcı' : ''}${a.tarayici && a.eposta ? ' + ' : ''}${a.eposta ? 'E-posta' + (a.epostaDurum === 'onay-bekliyor' ? ' (onay bekleniyor)' : '') : ''}${bitti && a.tetiklendi ? ` · ${tarihYaz(a.tetiklendi.tarih, { kisa: true })} bülteninde ${kurYaz(a.tetiklendi.kur)} ₺` : ''}</span></div><button class="dugme ikincil kucuk" type="button" data-sil="${a.id}" aria-label="Uyarıyı sil">Sil</button></li>`;
    $('.aktif', kok).innerHTML = aktif.length ? aktif.map(a => satir(a, false)).join('') : '<li class="soluk">Aktif uyarı yok.</li>';
    $('.bitmis', kok).innerHTML = bitmis.length ? bitmis.map(a => satir(a, true)).join('') : '<li class="soluk">Henüz tetiklenen uyarı yok.</li>';
  }
  kok.addEventListener('click', e => { const b = e.target.closest('[data-sil]'); if (b) { alarmlar.sil(b.dataset.sil); listele(); } });

  $('form', kok).addEventListener('submit', async e => {
    e.preventDefault();
    const hata = $('.hata-metni', kok); hata.textContent = '';
    const d = tutarOku(deger.value);
    if (d == null || d <= 0) { deger.setAttribute('aria-invalid', 'true'); hata.textContent = tur.value === 'yuzde' ? 'Yüzde değerini yazın (ör. 2).' : 'Hedef kuru yazın (ör. 45,50).'; return; }
    deger.removeAttribute('aria-invalid');
    if (!kTar.checked && !kEp.checked) { hata.textContent = 'En az bir bildirim yolu seçin.'; return; }
    if (kEp.checked && (!eposta.value || !onay.checked)) { hata.textContent = 'E-posta adresinizi yazın ve bilgilendirmeyi onaylayın.'; return; }
    const baz = guncelKur();
    if (tur.value === 'hedef') {
      const yonUygun = (yon.value === 'ustu' && d > baz) || (yon.value === 'altina' && d < baz);
      if (!yonUygun) { hata.textContent = `Hedef, güncel kura (${kurYaz(baz)} ₺) göre ${yon.value === 'ustu' ? 'daha yüksek' : 'daha düşük'} olmalı; yoksa uyarı hemen tetiklenir.`; return; }
    }
    const a = { kod: kod.value, tur: tur.value, yon: yon.value, deger: d, baz, tarayici: kTar.checked, eposta: kEp.checked };
    if (kTar.checked && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch { /* yok say */ } }
    if (kTar.checked && (!('Notification' in window) || Notification.permission !== 'granted')) toast('Tarayıcı bildirimi izni yok; uyarı sayfada bildirim olarak görünür.');
    if (kEp.checked) {
      try {
        const r = await fetch('/api/uyari', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eposta: eposta.value.trim(), kod: a.kod, tur: a.tur, yon: a.yon, deger: a.deger, baz: a.baz, onay: onay.checked, web: tuzak.value }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { hata.textContent = j.mesaj || 'E-posta uyarısı kaydedilemedi.'; return; }
        a.epostaDurum = 'onay-bekliyor'; toast(j.mesaj || 'Onay e-postası gönderildi');
      } catch { hata.textContent = 'E-posta servisine ulaşılamadı. İnternet bağlantınızı kontrol edin.'; return; }
    }
    alarmlar.ekle(a); olay('alarm-olustur', { kod: a.kod, tur: a.tur, eposta: a.eposta }); listele();
    if (!kEp.checked) toast('Uyarı kaydedildi'); deger.value = '';
  });
  kontrolEt(o.son, o.birim); listele();
}
