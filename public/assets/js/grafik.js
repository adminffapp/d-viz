// Bağımlılıksız SVG çizgi grafiği: imleç (fare, dokunma, klavye), en yüksek/en düşük işareti, çoklu seri.
import { tarihYaz, AYLAR, satirIdx } from './hesap.js';

const NS = 'http://www.w3.org/2000/svg';
const sv = (ad, ozellik = {}, ...cocuk) => {
  const el = document.createElementNS(NS, ad);
  for (const [k, v] of Object.entries(ozellik)) if (v != null) el.setAttribute(k, v);
  el.append(...cocuk); return el;
};
const gun = iso => Date.parse(iso + 'T00:00:00Z') / 864e5;

function guzelAdim(aralik, hedef = 4) {
  const ham = aralik / hedef;
  const us = 10 ** Math.floor(Math.log10(ham));
  const f = ham / us;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * us;
}
function xEtiketleri(ilk, son) {
  const span = son - ilk;
  const d0 = new Date(ilk * 864e5), out = [];
  const kisaAy = a => AYLAR[a].slice(0, 3);
  if (span <= 45) {
    const adim = span <= 10 ? 2 : 7;
    for (let g = Math.ceil(ilk / adim) * adim; g <= son; g += adim) { const d = new Date(g * 864e5); out.push([g, `${d.getUTCDate()} ${kisaAy(d.getUTCMonth())}`]); }
  } else if (span <= 800) {
    const ayAdim = span <= 130 ? 1 : span <= 400 ? 2 : 4;
    let y = d0.getUTCFullYear(), m = d0.getUTCMonth() + 1;
    for (;;) {
      if (m > 11) { m -= 12; y++; }
      const g = Date.UTC(y, m, 1) / 864e5; if (g > son) break;
      if (g >= ilk && (m % ayAdim === 0)) out.push([g, m === 0 ? String(y) : `${kisaAy(m)}${span > 130 ? ' ' + String(y).slice(2) : ''}`]);
      m++;
    }
  } else {
    const yilAdim = span > 3300 ? 2 : 1;
    for (let y = d0.getUTCFullYear() + 1; ; y++) { const g = Date.UTC(y, 0, 1) / 864e5; if (g > son) break; if (y % yilAdim === 0) out.push([g, String(y)]); }
  }
  return out;
}

export { sparkYol } from './grafik-saf.js';

/**
 * kap: üzerinde çizilecek öğe.
 * opts.seriler: [{ad, renk:'var(--seri1)', noktalar:[[iso, deger], ...], alan?:bool}]
 * opts.yaz(v) → eksen/ipucu metni; opts.yukseklik; opts.uclar; opts.imlecDegisti(iso, [{ad,deger}])
 */
export function grafik(kap, opts) {
  let seriler = opts.seriler || [];
  const yaz = opts.yaz || (v => String(v));
  const yEksenYaz = opts.yEksenYaz || yaz;
  let imlecGun = null, genislik = 0, cizim = null;
  kap.classList.add('grafik-kap');
  kap.setAttribute('tabindex', '0');
  kap.setAttribute('role', 'group');
  kap.setAttribute('aria-roledescription', 'çizgi grafik');
  const yonerge = document.createElement('span'); yonerge.className = 'gizli-okur'; yonerge.id = 'g-y-' + Math.random().toString(36).slice(2, 7);
  yonerge.textContent = 'Tarihlere göz atmak için sol ve sağ ok tuşlarını kullanın. Başa ve sona gitmek için Home ve End.';
  const canli = document.createElement('div'); canli.className = 'gizli-okur'; canli.setAttribute('aria-live', 'polite');
  kap.setAttribute('aria-describedby', yonerge.id);
  const svg = sv('svg', { role: 'presentation' });
  const ipucu = document.createElement('div'); ipucu.className = 'g-ipucu'; ipucu.hidden = true;
  kap.replaceChildren(svg, ipucu, yonerge, canli);

  function ozet() {
    const s = seriler[0]; if (!s || !s.noktalar.length) return 'Grafik için veri yok';
    const a = s.noktalar[0], b = s.noktalar.at(-1);
    return `${opts.ad || s.ad} grafiği, ${tarihYaz(a[0])} – ${tarihYaz(b[0])}. Başlangıç ${yaz(a[1])}, son ${yaz(b[1])}.`;
  }

  function ciz() {
    genislik = Math.max(260, Math.floor(kap.clientWidth));
    const h = opts.yukseklik || (genislik < 520 ? 240 : 320);
    const m = { u: 14, s: 14, a: 28, l: 56 };
    if (genislik < 420) m.l = 48;
    const iw = genislik - m.l - m.s, ih = h - m.u - m.a;
    svg.replaceChildren(); svg.setAttribute('viewBox', `0 0 ${genislik} ${h}`); svg.setAttribute('width', genislik); svg.setAttribute('height', h);
    const tum = seriler.flatMap(s => s.noktalar);
    if (!tum.length) { svg.append(sv('text', { x: genislik / 2, y: h / 2, 'text-anchor': 'middle', class: 'g-etiket' }, document.createTextNode('Bu aralık için veri yok'))); cizim = null; return; }
    let xMin = Math.min(...tum.map(p => gun(p[0]))), xMax = Math.max(...tum.map(p => gun(p[0])));
    if (xMax === xMin) xMax = xMin + 1;
    let yMin = Math.min(...tum.map(p => p[1])), yMax = Math.max(...tum.map(p => p[1]));
    if (yMax === yMin) { yMax += Math.abs(yMax) * .01 || 1; yMin -= Math.abs(yMin) * .01 || 1; }
    const pad = (yMax - yMin) * .08; yMin -= pad; yMax += pad;
    const adim = guzelAdim(yMax - yMin, ih < 240 ? 3 : 4);
    const x = g => m.l + ((g - xMin) / (xMax - xMin)) * iw;
    const y = v => m.u + ih - ((v - yMin) / (yMax - yMin)) * ih;
    const izg = sv('g', { class: 'g-izgara' });
    for (let t = Math.ceil(yMin / adim) * adim; t <= yMax; t += adim) {
      izg.append(sv('line', { x1: m.l, x2: m.l + iw, y1: y(t), y2: y(t) }));
      izg.append(sv('text', { x: m.l - 8, y: y(t) + 4, 'text-anchor': 'end', class: 'g-etiket' }, document.createTextNode(yEksenYaz(t))));
    }
    for (const [g, et] of xEtiketleri(xMin, xMax)) {
      if (x(g) < m.l + 10 || x(g) > m.l + iw - 10) continue;
      izg.append(sv('text', { x: x(g), y: h - 8, 'text-anchor': 'middle', class: 'g-etiket' }, document.createTextNode(et)));
    }
    svg.append(izg);
    const haritalar = seriler.map(s => new Map(s.noktalar));
    seriler.forEach((s, i) => {
      if (!s.noktalar.length) return;
      const d = s.noktalar.map((p, j) => `${j ? 'L' : 'M'}${x(gun(p[0])).toFixed(1)} ${y(p[1]).toFixed(1)}`).join('');
      if (s.alan !== false && seriler.length === 1) svg.append(sv('path', { class: 'g-alan', d: `${d}L${x(gun(s.noktalar.at(-1)[0])).toFixed(1)} ${m.u + ih}L${x(gun(s.noktalar[0][0])).toFixed(1)} ${m.u + ih}Z`, style: `fill:${s.renk}` }));
      svg.append(sv('path', { class: 'g-cizgi', d, style: `stroke:${s.renk}` }));
    });
    // en yüksek / en düşük (tek seride)
    if (opts.uclar !== false && seriler.length === 1) {
      const n = seriler[0].noktalar;
      let lo = n[0], hi = n[0]; for (const p of n) { if (p[1] < lo[1]) lo = p; if (p[1] > hi[1]) hi = p; }
      for (const [p, ust] of [[hi, true], [lo, false]]) {
        const px = x(gun(p[0])), py = y(p[1]);
        const sol = px < m.l + 70, sag = px > m.l + iw - 70;
        svg.append(sv('circle', { cx: px, cy: py, r: 3.5, style: `fill:${seriler[0].renk}`, class: 'g-nokta' }));
        svg.append(sv('text', { x: px + (sol ? 6 : sag ? -6 : 0), y: py + (ust ? -9 : 17), 'text-anchor': sol ? 'start' : sag ? 'end' : 'middle', class: 'g-uc' }, document.createTextNode(yaz(p[1]))));
      }
    }
    const imlec = sv('g', { class: 'g-imlec', visibility: 'hidden' }, sv('line', { y1: m.u, y2: m.u + ih }));
    const noktalar = seriler.map(s => { const c = sv('circle', { r: 5, style: `fill:${s.renk}`, class: 'g-nokta' }); imlec.append(c); return c; });
    svg.append(imlec);
    cizim = { m, iw, ih, h, xMin, xMax, x, y, imlec, noktalar, haritalar };
    if (imlecGun) goster(imlecGun, false);
  }

  function enYakin(g) {
    const n = seriler[0]?.noktalar; if (!n?.length) return null;
    let lo = 0, hi = n.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (gun(n[mid][0]) <= g) lo = mid; else hi = mid; }
    return Math.abs(gun(n[lo][0]) - g) <= Math.abs(gun(n[hi][0]) - g) ? lo : hi;
  }
  function goster(iso, oku = true) {
    if (!cizim) return;
    const { x, y, imlec, noktalar, haritalar, m, iw } = cizim;
    const px = x(gun(iso));
    imlec.setAttribute('visibility', 'visible');
    imlec.querySelector('line').setAttribute('x1', px); imlec.querySelector('line').setAttribute('x2', px);
    const degerler = [];
    seriler.forEach((s, i) => {
      let v = haritalar[i].get(iso);
      if (v == null) { const j = satirIdx(s.noktalar, iso); v = j >= 0 ? s.noktalar[j][1] : null; }
      if (v == null) { noktalar[i].setAttribute('visibility', 'hidden'); return; }
      noktalar[i].setAttribute('visibility', 'visible'); noktalar[i].setAttribute('cx', px); noktalar[i].setAttribute('cy', y(v));
      degerler.push({ ad: s.ad, renk: s.renk, deger: v });
    });
    ipucu.hidden = false;
    ipucu.innerHTML = `<b>${tarihYaz(iso, { gun: true })}</b>` + degerler.map(d => `<div><i style="display:inline-block;width:10px;height:3px;border-radius:2px;background:${d.renk};margin-right:6px;vertical-align:middle"></i>${degerler.length > 1 ? d.ad + ': ' : ''}${yaz(d.deger)}</div>`).join('');
    const w = ipucu.offsetWidth;
    const sol = Math.min(Math.max(px, w / 2 + 4), genislik - w / 2 - 4);
    ipucu.style.left = sol + 'px'; ipucu.style.top = Math.max(y(degerler[0]?.deger ?? 0) - 10, ipucu.offsetHeight + 4) + 'px';
    imlecGun = iso;
    if (oku) canli.textContent = `${tarihYaz(iso, { gun: true })}: ` + degerler.map(d => `${degerler.length > 1 ? d.ad + ' ' : ''}${yaz(d.deger)}`).join(', ');
    opts.imlecDegisti && opts.imlecDegisti(iso, degerler);
  }
  function gizle() { if (!cizim) return; cizim.imlec.setAttribute('visibility', 'hidden'); ipucu.hidden = true; imlecGun = null; opts.imlecDegisti && opts.imlecDegisti(null, []); }

  const gun2iso = g => new Date(g * 864e5).toISOString().slice(0, 10);
  function isaretci(e) {
    if (!cizim) return;
    const r = svg.getBoundingClientRect();
    const px = e.clientX - r.left;
    const g = cizim.xMin + ((px - cizim.m.l) / cizim.iw) * (cizim.xMax - cizim.xMin);
    const i = enYakin(Math.min(cizim.xMax, Math.max(cizim.xMin, g)));
    if (i != null) goster(seriler[0].noktalar[i][0], false);
  }
  svg.addEventListener('pointermove', isaretci);
  svg.addEventListener('pointerdown', e => { isaretci(e); });
  svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && document.activeElement !== kap) gizle(); });
  kap.addEventListener('blur', () => gizle());
  kap.addEventListener('keydown', e => {
    const n = seriler[0]?.noktalar; if (!n?.length) return;
    let i = imlecGun ? enYakin(gun(imlecGun)) : n.length - 1;
    const adim = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowLeft') i = Math.max(0, i - adim);
    else if (e.key === 'ArrowRight') i = Math.min(n.length - 1, i + adim);
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n.length - 1;
    else if (e.key === 'Escape') { gizle(); return; }
    else return;
    e.preventDefault(); goster(n[i][0]);
  });

  const ro = new ResizeObserver(() => { if (Math.abs(kap.clientWidth - genislik) > 1) ciz(); });
  ro.observe(kap);
  ciz();
  kap.setAttribute('aria-label', ozet());
  return {
    guncelle(yeni, ad) { seriler = yeni; if (ad) opts.ad = ad; imlecGun = null; ipucu.hidden = true; ciz(); kap.setAttribute('aria-label', ozet()); },
    imlec(iso) { goster(iso); },
    yokEt() { ro.disconnect(); },
  };
}
