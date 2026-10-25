// "O gün X kaçtı?" hesaplayıcısı (ana sayfa). Geçmişteki bir tutarın o günkü ve son bülten TL karşılığı.
import { $, kacis, olay } from './ui.js';
import { ortam, paraSecenekleri, tlKuru, kaynakSatiri } from './ortak.js';
import { arsivYukle } from './veri.js';
import { tutarOku, sayiYaz, sayiSerbest, kurYaz, yuzdeDegisim, yuzdeYaz, isaret, tarihYaz, nedenMetni, gunEkle, aralikSatirlari, indirge } from './hesap.js';
import { degisimHTML } from './kur-satir.js';
import { sparkYol } from './grafik-saf.js';

export async function zamanMakinesi(kok) {
  const o = await ortam();
  const tutar = $('[name=tutar]', kok), kod = $('[name=kod]', kok), tarih = $('[name=tarih]', kok);
  const hata = $('.hata-metni', kok), sonuc = $('.zaman-govde', kok);
  kod.innerHTML = paraSecenekleri(o, 'USD', { tl: false });
  tarih.min = o.ilkTarih; tarih.max = gunEkle(o.sonTarih, -1);
  tarih.value = gunEkle(o.sonTarih, -365);

  const tbody = $('.z-donemler', kok);
  const DONEMLER = [['1 ay önce', 30], ['6 ay önce', 182], ['1 yıl önce', 365], ['3 yıl önce', 1095], ['5 yıl önce', 1825]];
  async function tabloDoldur(t, simdi) {
    if (!tbody) return;
    const satirlar = [];
    for (const [ad, gun] of DONEMLER) {
      const tar = gunEkle(o.sonTarih, -gun); if (tar < o.ilkTarih) continue;
      const g = await tlKuru(o, kod.value, tar); if (g.bilgi.hata || g.tl == null) continue;
      const tlG = t * g.tl, yz = yuzdeDegisim(t * simdi.tl, tlG);
      satirlar.push(`<li><span class="et">${ad}</span><span class="sayi dg">${sayiYaz(tlG, 0)} ₺</span>${degisimHTML(yz)}</li>`);
    }
    tbody.innerHTML = satirlar.join('');
  }

  async function hesapla() {
    const t = tutarOku(tutar.value);
    hata.textContent = '';
    tutar.removeAttribute('aria-invalid'); tarih.removeAttribute('aria-invalid');
    if (t == null || t <= 0) { tutar.setAttribute('aria-invalid', 'true'); hata.textContent = 'Geçerli bir tutar yazın (ör. 1.000).'; return; }
    if (!tarih.value || tarih.value < o.ilkTarih || tarih.value > o.sonTarih) { tarih.setAttribute('aria-invalid', 'true'); hata.textContent = `Tarih ${tarihYaz(o.ilkTarih, { kisa: true })} ile ${tarihYaz(o.sonTarih, { kisa: true })} arasında olmalı.`; return; }
    const [gec, simdi] = await Promise.all([tlKuru(o, kod.value, tarih.value), tlKuru(o, kod.value, o.sonTarih)]);
    if (gec.bilgi.hata || simdi.tl == null) { hata.textContent = 'Bu tarih için kur bulunamadı.'; return; }
    const tlGec = t * gec.tl, tlSimdi = t * simdi.tl;
    const yuzde = yuzdeDegisim(tlSimdi, tlGec);
    const fark = tlSimdi - tlGec;
    const s = isaret(yuzde);
    $('.o-gun', kok).textContent = tarihYaz(gec.bilgi.tarih, { gun: true });
    $('.o-tl', kok).textContent = sayiYaz(tlGec, 2) + ' ₺';
    $('.o-kur', kok).textContent = `1 ${kod.value} = ${kurYaz(gec.tl)} ₺`;
    $('.b-gun', kok).textContent = tarihYaz(simdi.bilgi.tarih, { gun: true });
    $('.b-tl', kok).textContent = sayiYaz(tlSimdi, 2) + ' ₺';
    $('.b-kur', kok).textContent = `1 ${kod.value} = ${kurYaz(simdi.tl)} ₺`;
    $('.z-degisim', kok).innerHTML = degisimHTML(yuzde) + `<span class="sayi soluk">${fark >= 0 ? '+' : '−'}${sayiSerbest(Math.abs(fark), 2)} ₺</span>`;
    $('.z-cumle', kok).textContent = s === 0 ? 'Tutar iki tarihte hemen hemen aynı TL değerinde.' : `${sayiSerbest(t, 2)} ${kod.value}, o günden bu yana ${s > 0 ? 'daha fazla' : 'daha az'} TL ediyor.`;
    const nm = nedenMetni(gec.bilgi);
    $('.z-not', kok).textContent = nm || kaynakSatiri(gec.bilgi, o);
    if (nm) $('.z-not', kok).textContent = nm + ' ' + kaynakSatiri(gec.bilgi, o);
    tabloDoldur(t, simdi).catch(() => {});
    // mini çizgi
    const a = gec.arsiv || await arsivYukle(kod.value);
    const satirlar = indirge(aralikSatirlari(a.gunler, tarih.value, o.sonTarih), 1, 160);
    const yol = sparkYol(satirlar.map(r => r[1]), 400, 56, 4);
    $('.z-yol', kok).setAttribute('d', yol);
    $('.z-yol', kok).style.stroke = s >= 0 ? 'var(--yuk)' : 'var(--dus)';
    olay('zaman-makinesi', { kod: kod.value });
  }
  const tetik = () => hesapla().catch(() => { hata.textContent = 'Hesaplanamadı. Sayfayı yenileyip tekrar deneyin.'; });
  [tutar, kod, tarih].forEach(el => el.addEventListener('input', tetik));
  kok.querySelectorAll('[data-geri]').forEach(b => b.addEventListener('click', () => {
    const [n, birim] = [Number(b.dataset.geri.slice(0, -1)), b.dataset.geri.slice(-1)];
    tarih.value = gunEkle(o.sonTarih, -(birim === 'a' ? n * 30 : n * 365));
    if (tarih.value < o.ilkTarih) tarih.value = o.ilkTarih;
    kok.querySelectorAll('[data-geri]').forEach(x => x.setAttribute('aria-pressed', x === b));
    tetik();
  }));
  tetik();
}
