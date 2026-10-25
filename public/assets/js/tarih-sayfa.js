// Tarihe göre kur: seçilen günün kuru, dört kur türü, hafta sonu/tatil açıklaması ve komşu bültenler.
import { $, $$, kopyala, sorgu, sorguYaz } from './ui.js';
import { ortam, paraSecenekleri, turAdi } from './ortak.js';
import { arsivYukle } from './veri.js';
import { degisimHTML } from './kur-satir.js';
import { kurBul, kurYaz, tarihYaz, nedenMetni, isoGecerli, gunEkle, yuzdeDegisim, satirIdx } from './hesap.js';

async function baslat(kok) {
  const o = await ortam();
  const tarih = $('[name=tarih]', kok), kod = $('[name=kod]', kok), q = sorgu();
  kod.innerHTML = paraSecenekleri(o, q.kod || 'USD', { tl: false });
  tarih.min = o.ilkTarih; tarih.max = gunEkle(o.sonTarih, 14);
  tarih.value = isoGecerli(q.tarih) ? q.tarih : o.sonTarih;
  let sonCumle = '';
  async function goster() {
    const err = $('.hata-metni', kok); err.textContent = ''; tarih.removeAttribute('aria-invalid');
    if (!isoGecerli(tarih.value) || tarih.value < o.ilkTarih) { tarih.setAttribute('aria-invalid', 'true'); err.textContent = `Tarih ${tarihYaz(o.ilkTarih, { kisa: true })} ile bugün arasında olmalı.`; return; }
    const a = await arsivYukle(kod.value), birim = a.birim || 1;
    const r = kurBul(a, tarih.value, 1);
    if (r.hata) { err.textContent = 'Bu tarih için kur bulunamadı.'; return; }
    const ad = o.birim[kod.value].ad, tl = r.kur / birim;
    $('.t-gun', kok).textContent = tarihYaz(tarih.value, { gun: true });
    $('.t-kur', kok).textContent = `${birim > 1 ? birim + ' ' : '1 '}${kod.value} = ${kurYaz(r.kur)} ₺`;
    $('.t-kaynak', kok).textContent = `Kaynak: TCMB ${turAdi(1).toLowerCase()} · bülten ${tarihYaz(r.tarih)}`;
    const n = $('.t-not', kok), m = nedenMetni(r); n.hidden = !m; n.textContent = m;
    const son = a.gunler[a.gunler.length - 1][1];
    $('.t-bugun', kok).innerHTML = r.tarih === a.gunler[a.gunler.length - 1][0] ? 'Bu, son yayımlanan bülten.' : `Bugünkü kura göre ${degisimHTML(yuzdeDegisim(son, r.kur))}`;
    const satir = a.gunler[r.idx];
    $('.t-bulten', kok).textContent = tarihYaz(r.tarih, { kisa: true });
    $('.t-turler', kok).innerHTML = [1, 2, 3, 4].map(i => `<tr><td>${turAdi(i)}</td><td class="s sayi">${satir[i] == null ? '—' : kurYaz(satir[i])}</td></tr>`).join('');
    const bas = Math.max(0, r.idx - 3), bit = Math.min(a.gunler.length, r.idx + 4);
    $('.t-komsu', kok).innerHTML = a.gunler.slice(bas, bit).map((g, k) => `<tr${bas + k === r.idx ? ' aria-current="true" style="font-weight:600"' : ''}><td>${tarihYaz(g[0], { gun: true })}</td><td class="s sayi">${g[1] == null ? '—' : kurYaz(g[1])}</td></tr>`).join('');
    $('.t-gecmis', kok).href = `/gecmis-kur/?kod=${kod.value}&tarih=${r.tarih}`;
    sonCumle = `${tarihYaz(tarih.value)} tarihinde ${ad} kuru (TCMB döviz alış) ${kurYaz(r.kur)} ₺ idi${r.neden === 'tam' ? '' : ` (${tarihYaz(r.tarih)} tarihli bülten)`}.`;
    sorguYaz({ kod: kod.value, tarih: tarih.value === o.sonTarih ? '' : tarih.value });
  }
  const tetik = () => goster().catch(e => { console.error(e); $('.hata-metni', kok).textContent = 'Hesaplanamadı; sayfayı yenileyin.'; });
  [tarih, kod].forEach(el => el.addEventListener('input', tetik));
  $$('[data-geri]', kok).forEach(b => b.addEventListener('click', () => { const n = Number(b.dataset.geri); tarih.value = gunEkle(o.sonTarih, -n); tetik(); }));
  $('[data-kopyala]', kok).addEventListener('click', () => kopyala(sonCumle));
  await goster();
}
const kok = $('#tarih');
baslat(kok).catch(e => { console.error(e); kok.insertAdjacentHTML('afterbegin', '<p class="hata-metni" role="alert">Veri yüklenemedi. Sayfayı yenileyin.</p>'); });
