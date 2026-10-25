// Hero madeni parasını yükler ve hesaplayıcıya bağlar. Başarısız olursa SVG çizimi kalır.
import { ortam } from './ortak.js';

export async function madeniBaslat(kap) {
  const svg = kap.innerHTML;
  const { madeniKur } = await import('./coin3d.js');
  const o = await ortam();
  const m = madeniKur(kap, { sembol: '$', onHata: () => { kap.innerHTML = svg; } });
  if (!m) { kap.innerHTML = svg; return; }
  const kod = document.querySelector('#zaman [name=kod]'), tarih = document.querySelector('#zaman [name=tarih]');
  kod?.addEventListener('change', () => m.cevir(o.birim[kod.value]?.sembol || kod.value));
  tarih?.addEventListener('change', () => m.cevir(null));
  window.addEventListener('tema-degisti', () => m.yenile());
  addEventListener('pagehide', () => m.yokEt(), { once: true });
}
