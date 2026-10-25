// FOREX madeni parası: gerçek 3B silindir, fareyle sürükleyerek döndürülür. Yalnızca gerektiğinde çizer (boşta 0 CPU/GPU).
import { WebGLRenderer, Scene, PerspectiveCamera, CylinderGeometry, MeshStandardMaterial, Mesh, Group, TorusGeometry, BufferGeometry, BufferAttribute, AmbientLight, DirectionalLight, CanvasTexture, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';

export function forexKur(kap, yuzUrl, { onHata, intro = true } = {}) {
  const gl = document.createElement('canvas');
  let r;
  try { r = new WebGLRenderer({ canvas: gl, antialias: true, alpha: true, powerPreference: 'low-power' }); } catch (e) { onHata && onHata(e); return null; }
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); r.setClearColor(0, 0); r.outputColorSpace = SRGBColorSpace;
  const sahne = new Scene();
  const kam = new PerspectiveCamera(28, 1, .1, 20); kam.position.set(0, 0, 4.5);
  sahne.add(new AmbientLight(0xffffff, 1.0));
  const ana = new DirectionalLight(0xfff1d6, 2.4); ana.position.set(2.5, 3, 4); sahne.add(ana);
  const dolgu = new DirectionalLight(0xffd9a0, .9); dolgu.position.set(-3, -1.5, 2); sahne.add(dolgu);

  // yan yüzey: tırtıllı altın
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#9c7a3e'; x.fillRect(0, 0, 256, 64);
  for (let i = 0; i < 256; i += 4) { x.fillStyle = i % 8 ? '#d9b46a' : '#6f5428'; x.fillRect(i, 0, 2, 64); }
  const yanTex = new CanvasTexture(c); yanTex.colorSpace = SRGBColorSpace; yanTex.wrapS = RepeatWrapping; yanTex.repeat.set(12, 1);
  const yan = new MeshStandardMaterial({ map: yanTex, metalness: .75, roughness: .38 });
  const yuz = new MeshStandardMaterial({ metalness: .25, roughness: .5, emissive: 0xffffff, emissiveIntensity: .6, });
  const arka = new MeshStandardMaterial({ metalness: .25, roughness: .5, emissive: 0xffffff, emissiveIntensity: .6, });
  const geo = new CylinderGeometry(1, 1, .16, 128, 1);
  const kapak = new MeshStandardMaterial({ color: 0x3a2c14, metalness: .7, roughness: .5 });
  const para = new Mesh(geo, [yan, kapak, kapak]); para.rotation.x = Math.PI / 2;
  const grup = new Group(); sahne.add(grup);
  // yükseltilmiş kenar çerçevesi (iki yüzde)
  const cerceveGeo = new TorusGeometry(.975, .035, 24, 160);
  const cerceve = new MeshStandardMaterial({ map: yanTex, metalness: .8, roughness: .3, color: 0xe6c27a });
  const c1 = new Mesh(cerceveGeo, cerceve); c1.position.z = .1; const c2 = new Mesh(cerceveGeo, cerceve); c2.position.z = -.1; 

  const yedek = () => {
    grup.add(para);
    // görselin açık/koyu bilgisinden yükseklik, ondan normal haritası (Sobel)
    const normalYap = (img, guc = 1.5) => {
      const n = 512, k = document.createElement('canvas'); k.width = k.height = n; const g = k.getContext('2d', { willReadFrequently: true });
      g.filter = 'blur(2.2px)'; g.drawImage(img, 0, 0, n, n); g.filter = 'none';
      const d = g.getImageData(0, 0, n, n).data, h = new Float32Array(n * n);
      for (let i = 0; i < n * n; i++) h[i] = (d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11) / 255;
      const o = g.createImageData(n, n), at = (x, y) => h[Math.min(n - 1, Math.max(0, y)) * n + Math.min(n - 1, Math.max(0, x))];
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
        const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
        let nx = -dx * guc, ny = dy * guc, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
        const i = (y * n + x) * 4; o.data[i] = (nx * .5 + .5) * 255; o.data[i + 1] = (ny * .5 + .5) * 255; o.data[i + 2] = (nz * .5 + .5) * 255; o.data[i + 3] = 255;
      }
      g.putImageData(o, 0, 0);
      // yükseklik: açık (altın yüzey) yukarı, koyu zemin aşağı
      const kh = document.createElement('canvas'); kh.width = kh.height = n; const gh = kh.getContext('2d'); const oh = gh.createImageData(n, n);
      for (let i = 0; i < n * n; i++) { let v = (h[i] - .12) / .5; v = Math.max(0, Math.min(1, v)); v = v * v * (3 - 2 * v); oh.data[i * 4] = oh.data[i * 4 + 1] = oh.data[i * 4 + 2] = v * 255; oh.data[i * 4 + 3] = 255; }
      gh.putImageData(oh, 0, 0);
      const hy = new Float32Array(n * n); for (let i = 0; i < n * n; i++) hy[i] = oh.data[i * 4] / 255;
      return { normal: new CanvasTexture(k), yuk: hy, n };
    };

    // dairesel kutupsal ağ: merkezden kenara halkalar; yükseklik görselden örneklenir, kenar düz kalır
    const diskYap = (yuk, n) => {
      const R = 4, S = 160, ol = 0, v = [], uv = [], idx = [];
      const ornek = (u, w) => { const x = Math.min(n - 1.001, Math.max(0, u * (n - 1))), y = Math.min(n - 1.001, Math.max(0, (1 - w) * (n - 1))); const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
        return (yuk[y0 * n + x0] * (1 - fx) + yuk[y0 * n + x0 + 1] * fx) * (1 - fy) + (yuk[(y0 + 1) * n + x0] * (1 - fx) + yuk[(y0 + 1) * n + x0 + 1] * fx) * fy; };
      for (let i = 0; i <= R; i++) { const rr = i / R; for (let j = 0; j <= S; j++) { const a = j / S * Math.PI * 2, cx = Math.cos(a), sy = Math.sin(a), u = .5 + .5 * rr * cx, w = .5 + .5 * rr * sy;
        const kenar = Math.min(1, Math.max(0, (.97 - rr) / .04)); // kenara doğru düzleş
        v.push(rr * cx, rr * sy, ornek(u, w) * ol * kenar); uv.push(u, w); } }
      for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = i * (S + 1) + j, b = a + S + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
      const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(new Float32Array(v), 3)); g.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
    };
    let diskGeo = null;
    new TextureLoader().load(yuzUrl, t => {
      t.colorSpace = SRGBColorSpace; t.anisotropy = 4;
      const { yuk, n } = normalYap(t.image); diskGeo = diskYap(yuk, n);
      for (const m of [yuz, arka]) { m.map = t; m.emissiveMap = t; m.needsUpdate = true; }
      const on = new Mesh(diskGeo, yuz); on.position.z = .081; const ar = new Mesh(diskGeo, arka); ar.position.z = -.081; ar.rotation.y = Math.PI;
      grup.add(on, ar); ciz();
    }, undefined, e => onHata && onHata(e));


  };
  yedek();

  let ry = intro ? -Math.PI * 2 : 0, rx = 0, hy = 0, hx = 0, hiz = 0, hizx = 0, surukle = false, raf = 0, bx = 0, by = 0;
  const boyut = () => { const w = Math.max(160, Math.min(kap.clientWidth, 360)); r.setSize(w, w, false); gl.style.width = gl.style.height = '100%'; };
  const ciz = () => { grup.rotation.y = ry + hy; grup.rotation.x = rx + hx; r.render(sahne, kam); };
  const dongu = () => {
    raf = 0;
    if (!surukle) {
      if (intro) { ry += (0 - ry) * .05 + .003; if (ry > -.003) { ry = 0; intro = false; } }
      else {
        ry += hiz; rx += hizx; hiz *= .94; hizx *= .9;
        if (Math.abs(hiz) < .004) { const hedef = Math.round(ry / Math.PI) * Math.PI; ry += (hedef - ry) * .06; rx += (0 - rx) * .08; }
      }
    }
    ciz();
    const hareket = surukle || intro || Math.abs(hiz) > .0004 || Math.abs(ry - Math.round(ry / Math.PI) * Math.PI) > .002 || Math.abs(rx) > .002 || intro;
    if (hareket) raf = requestAnimationFrame(dongu);
  };
  const baslat = () => { if (!raf) raf = requestAnimationFrame(dongu); };

  kap.querySelector('img')?.remove(); kap.appendChild(gl);
  kap.style.cursor = 'grab'; kap.style.touchAction = 'pan-y';
  boyut(); kam.aspect = 1; kam.updateProjectionMatrix();
  const ro = new ResizeObserver(() => { boyut(); ciz(); }); ro.observe(kap);
  kap.addEventListener('pointerdown', e => { surukle = true; bx = e.clientX; by = e.clientY; hiz = 0; hizx = 0; intro = false; kap.setPointerCapture(e.pointerId); kap.style.cursor = 'grabbing'; baslat(); });
  kap.addEventListener('pointermove', e => {
    if (surukle) { const dx = e.clientX - bx, dy = e.clientY - by; bx = e.clientX; by = e.clientY; ry += dx * .012; rx = Math.max(-.7, Math.min(.7, rx + dy * .008)); hiz = dx * .012; hizx = 0; baslat(); }
    else { const b = kap.getBoundingClientRect(); const nx = ((e.clientX - b.left) / b.width - .5) * 2, ny = ((e.clientY - b.top) / b.height - .5) * 2; hy = nx * .22; hx = ny * .16; ciz(); }
  });
  const birak = () => { surukle = false; kap.style.cursor = 'grab'; baslat(); };
  kap.addEventListener('pointerup', birak); kap.addEventListener('pointercancel', birak);
  kap.addEventListener('pointerleave', () => { hy = 0; hx = 0; ciz(); });
  if (intro) baslat();
  return { yokEt() { cancelAnimationFrame(raf); ro.disconnect(); r.dispose(); geo.dispose(); diskGeo && diskGeo.dispose(); gl.remove(); }, yenile: ciz };
}
