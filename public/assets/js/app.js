// Her sayfada çalışan kabuk: tema, menü, uyarı şeritleri, çapraz bağlantı kartları, hizmet işçisi, ölçüm, reklam tercihi.
import { AYAR } from './ayar.js';
import { $, depo, kacis } from './ui.js';
import { sonYukle, durumYukle, cevrimdisiMi } from './veri.js';
import { guncellikDurumu, tarihYaz, sayiYaz, yuzdeYaz, isaret } from './hesap.js';

/* ---- tema ---- */
const kok = document.documentElement;
const tema = $('#tema-dugme');
const gecerliTema = () => kok.getAttribute('data-tema') || (matchMedia('(prefers-color-scheme: light)').matches ? 'acik' : 'koyu');
if (tema) tema.addEventListener('click', () => {
  const yeni = gecerliTema() === 'acik' ? 'koyu' : 'acik';
  kok.setAttribute('data-tema', yeni); depo.yaz('tema', yeni);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', yeni === 'acik' ? '#F5EFE2' : '#0F0B08');
  window.dispatchEvent(new CustomEvent('tema-degisti'));
});
if (gecerliTema() === 'acik') document.querySelector('meta[name=theme-color]')?.setAttribute('content', '#F5EFE2');

/* ---- menü ---- */
const md = $('#menu-dugme'), mn = $('#menu');
if (md && mn) {
  md.addEventListener('click', () => { const a = mn.classList.toggle('acik'); md.setAttribute('aria-expanded', a); md.setAttribute('aria-label', a ? 'Menüyü kapat' : 'Menüyü aç'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mn.classList.contains('acik')) { mn.classList.remove('acik'); md.setAttribute('aria-expanded', 'false'); md.focus(); } });
}

/* ---- saat, yıl ---- */
const yil = $('#yil'); if (yil) yil.textContent = new Date().getFullYear();
const saat = $('#saat');
if (saat) {
  const f = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
  const t = () => { saat.textContent = f.format(new Date()); }; t(); setInterval(t, 20000);
}

/* ---- giriş animasyonu (yalnızca bir kez, içerik script olmadan da görünür) ---- */
const gir = [...document.querySelectorAll('.gir')];
if (gir.length) {
  if (!('IntersectionObserver' in window)) gir.forEach(x => x.classList.add('goruldu'));
  else {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('goruldu'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    gir.forEach(x => io.observe(x));
  }
}

/* ---- veri durumu şeritleri ---- */
async function seritler() {
  const kap = $('#seritler'); if (!kap) return;
  const ekle = (sinif, html) => { const d = document.createElement('div'); d.className = 'serit ' + sinif; d.innerHTML = `<div class="kap">${html}</div>`; kap.append(d); };
  try {
    const [son, durum] = await Promise.all([sonYukle(), durumYukle()]);
    if (son.ornek) ekle('ornek', '<strong>Örnek veri.</strong> Bu görünümdeki kurlar gerçek TCMB verisi değildir; yalnızca geliştirme içindir.');
    if (cevrimdisiMi()) ekle('uyari', '<strong>Bağlantı yok.</strong> En son kaydedilen veri gösteriliyor.');
    const g = guncellikDurumu(son.tarih);
    if (g.durum === 'eski') ekle('uyari', `<strong>Veri güncel olmayabilir.</strong> Son bülten ${tarihYaz(son.tarih)} tarihli. Resmî tatil dışında yenilenmesi gerekirdi; kaynak kontrol ediliyor.`);
    if (durum && durum.sonSonuc === 'hata') ekle('uyari', `<strong>Kaynak son kontrolde hata verdi.</strong> Gösterilen veri ${tarihYaz(son.tarih)} tarihli bültendir; yenisi alınamadı.`);
  } catch { ekle('uyari', '<strong>Veri yüklenemedi.</strong> Sayfayı yenileyin; sorun sürerse birkaç dakika sonra tekrar deneyin.'); }
}
seritler();

/* ---- çapraz bağlantı: borsa sitesinden 3 anahtar değer ---- */
async function capraz() {
  const kap = $('#capraz-kap'); if (!kap || kap.dataset.yok) return;
  const b = AYAR.borsa;
  let ic = '';
  if (b.hazir) {
    try {
      const r = await fetch(b.origin + b.ozet, { mode: 'cors', cache: 'no-cache', credentials: 'omit' });
      if (!r.ok) throw 0;
      const j = await r.json();
      const dv = (j.degerler || []).slice(0, 3);
      if (!dv.length) throw 0;
      ic = `<div class="capraz-izgara">${dv.map(d => {
        const s = isaret(d.degisim);
        return `<a class="capraz-kart" href="${kacis(b.origin)}/"><span class="a">${kacis(d.ad)}</span><span class="d sayi">${kacis(sayiYaz(Number(d.deger), 2))}</span><span class="degisim ${s > 0 ? 'yuk' : s < 0 ? 'dus' : 'sabit'}">${kacis(yuzdeYaz(Number(d.degisim)))}</span></a>`;
      }).join('')}</div><p class="kucuk soluk" style="margin-top:12px">Kaynak: ${kacis(new URL(b.origin).host)} · ${kacis(j.tarih ? tarihYaz(j.tarih) : '')}</p>`;
    } catch { ic = `<div class="capraz-bos">Borsa özeti şu an alınamadı. <a href="${kacis(b.origin)}/">Borsa sitesini açın</a>.</div>`; }
  } else {
    ic = `<div class="capraz-bos">Borsa sitesi hazırlanıyor. Açıldığında buraya üç anahtar değeri gelecek.</div>`;
  }
  kap.innerHTML = `<section class="capraz" aria-labelledby="capraz-b"><div class="kap"><div class="capraz-ust"><h2 id="capraz-b">Borsa tarafında bugün</h2>${b.hazir ? `<a href="${kacis(b.origin)}/">Borsa sitesini aç</a>` : ''}</div>${ic}</div></section>`;
}
capraz();

/* ---- tarayıcı alarmları: kayıtlı alarm varsa her sayfada kontrol et ---- */
(async () => {
  try {
    const l = depo.oku('alarmlar', []);
    if (!Array.isArray(l) || !l.some(a => a.aktif)) return;
    const [{ kontrolEt }, { temel }] = await Promise.all([import('./alarm.js'), import('./veri.js')]);
    const t = await temel(); kontrolEt(t.son, t.birim);
  } catch { /* alarm kontrolü sessizce atlanır */ }
})();

/* ---- PWA: hizmet işçisi + ana ekrana ekle ---- */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
let bekleyen;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); bekleyen = e; const b = $('#pwa-ekle'); if (b) b.hidden = false; });
$('#pwa-ekle')?.addEventListener('click', async () => { if (!bekleyen) return; bekleyen.prompt(); await bekleyen.userChoice; bekleyen = null; $('#pwa-ekle').hidden = true; });

/* ---- ölçüm (çerezsiz) ---- */
if (AYAR.analitik && !/^(localhost|127\.|\[::1\])/.test(location.hostname) && location.protocol === 'https:') {
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  const s = document.createElement('script'); s.defer = true; s.src = '/_vercel/insights/script.js'; document.head.append(s);
}

/* ---- reklam: yalnızca ayar doluysa ve kullanıcı kabul ettiyse ---- */
function reklamlar() {
  if (!AYAR.adsenseId) return;
  const slotlar = [...document.querySelectorAll('.reklam[data-yuva]')];
  if (!slotlar.length) return;
  const tercih = depo.oku('reklam-tercih');
  const yukle = () => {
    if (document.querySelector('script[data-adsense]')) return;
    const s = document.createElement('script'); s.async = true; s.dataset.adsense = '1'; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(AYAR.adsenseId);
    document.head.append(s);
    for (const el of slotlar) {
      const id = AYAR.adsenseYuvalar[el.dataset.yuva]; if (!id) continue;
      el.classList.add('etkin');
      el.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${kacis(AYAR.adsenseId)}" data-ad-slot="${kacis(id)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* yok say */ }
    }
  };
  if (tercih === 'kabul') return yukle();
  if (tercih === 'red') return;
  const k = document.createElement('div'); k.className = 'tercih'; k.setAttribute('role', 'dialog'); k.setAttribute('aria-label', 'Reklam tercihi');
  k.innerHTML = '<p>Siteyi ücretsiz tutan reklamlar için tarayıcınızda çerez kullanılabilir. Kabul etmezseniz reklam gösterilmez, araçlar aynen çalışır.</p><div class="eylemler"><button class="dugme kucuk" data-k="kabul">Kabul et</button><button class="dugme ikincil kucuk" data-k="red">Reddet</button><a class="dugme ikincil kucuk" href="/gizlilik/">Ayrıntı</a></div>';
  k.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; depo.yaz('reklam-tercih', b.dataset.k); k.remove(); if (b.dataset.k === 'kabul') yukle(); });
  document.body.append(k);
}
reklamlar();
