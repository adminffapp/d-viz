// Hero madeni parası. Yalnızca gerektiğinde çizer: boşta döngü yok (CPU/GPU 0), çevirme animasyonu sırasında kare kare.
import { WebGLRenderer, Scene, PerspectiveCamera, CylinderGeometry, TorusGeometry, MeshStandardMaterial, Mesh, Group, AmbientLight, DirectionalLight, CanvasTexture, SRGBColorSpace, Color } from 'three';

export function madeniKur(kap, { sembol = '$', onHata } = {}) {
  const gl = document.createElement('canvas');
  let renderer;
  try { renderer = new WebGLRenderer({ canvas: gl, antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch (e) { onHata && onHata(e); return null; }
  const boyut = () => Math.max(160, Math.min(kap.clientWidth, 360));
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  const sahne = new Scene();
  const kamera = new PerspectiveCamera(30, 1, 0.1, 20); kamera.position.set(0, 0, 5.2);
  sahne.add(new AmbientLight(0xffffff, 1.15));
  const ana = new DirectionalLight(0xffffff, 2.2); ana.position.set(2.5, 3, 4); sahne.add(ana);
  const dolgu = new DirectionalLight(0xffe9c4, 0.8); dolgu.position.set(-3, -1, 2); sahne.add(dolgu);

  const stil = () => getComputedStyle(document.documentElement);
  const renkOku = (ad, yedek) => { const v = stil().getPropertyValue(ad).trim(); return v || yedek; };
  const yuzTexture = (s) => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    const zemin = renkOku('--yuzey2', '#241A10'), halka = renkOku('--soluk', '#A89B83'), yazi = renkOku('--yazi', '#E4D5B7');
    x.fillStyle = zemin; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = halka; x.lineWidth = 6; x.beginPath(); x.arc(256, 256, 226, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 3; x.setLineDash([3, 14]); x.beginPath(); x.arc(256, 256, 190, 0, Math.PI * 2); x.stroke(); x.setLineDash([]);
    x.fillStyle = yazi; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const boy = s.length > 2 ? 150 : 250;
    x.font = `300 ${boy}px "Work Sans", system-ui, sans-serif`;
    x.fillText(s, 256, 256 + boy * 0.34);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; return t;
  };
  const gövdeRenk = new Color(renkOku('--soluk', '#A89B83'));
  let yuz = yuzTexture(sembol);
  const yanMat = new MeshStandardMaterial({ color: gövdeRenk, metalness: 0.55, roughness: 0.4 });
  const yuzMat = new MeshStandardMaterial({ map: yuz, metalness: 0.25, roughness: 0.55 });
  const govde = new CylinderGeometry(1, 1, 0.16, 72, 1);
  const para = new Mesh(govde, [yanMat, yuzMat, yuzMat]);
  para.rotation.x = Math.PI / 2; // yüz kameraya baksın
  const kenar = new TorusGeometry(1.0, 0.045, 12, 96);
  const kenarMesh = new Mesh(kenar, yanMat);
  const grup = new Group(); grup.add(para); const k1 = kenarMesh.clone(); k1.position.z = 0.08; const k2 = kenarMesh.clone(); k2.position.z = -0.08; grup.add(k1, k2);
  grup.rotation.set(-0.12, -0.35, 0);
  sahne.add(grup);
  kap.replaceChildren(gl);
  gl.setAttribute('aria-hidden', 'true');

  function boyutla() { const b = boyut(); renderer.setSize(b, b, false); gl.style.width = '100%'; gl.style.height = '100%'; kamera.aspect = 1; kamera.updateProjectionMatrix(); }
  const ciz = () => renderer.render(sahne, kamera);
  boyutla(); ciz();
  const ro = new ResizeObserver(() => { boyutla(); ciz(); }); ro.observe(kap);

  let ani = 0, hedefY = grup.rotation.y, calisiyor = false;
  const adim = (zaman) => {
    const fark = hedefY - grup.rotation.y;
    if (Math.abs(fark) < 0.002) { grup.rotation.y = hedefY; calisiyor = false; ciz(); return; }
    grup.rotation.y += fark * 0.11; ciz(); ani = requestAnimationFrame(adim);
  };
  const baslat = () => { if (!calisiyor) { calisiyor = true; ani = requestAnimationFrame(adim); } };
  gl.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(ani); onHata && onHata(new Error('baglam-kayip')); });

  return {
    cevir(yeniSembol, tur = 1) { // tam tur çevirir; sembol dönüşün ortasında değişir
      if (yeniSembol && yeniSembol !== sembol) { sembol = yeniSembol; const eski = yuz; yuz = yuzTexture(sembol); yuzMat.map = yuz; yuzMat.needsUpdate = true; eski.dispose(); }
      hedefY += Math.PI * 2 * tur; baslat();
    },
    yenile() { const eski = yuz; yuz = yuzTexture(sembol); yuzMat.map = yuz; yuzMat.needsUpdate = true; eski.dispose(); yanMat.color.set(renkOku('--soluk', '#A89B83')); ciz(); },
    yokEt() { cancelAnimationFrame(ani); ro.disconnect(); govde.dispose(); kenar.dispose(); yanMat.dispose(); yuzMat.dispose(); yuz.dispose(); renderer.dispose(); renderer.forceContextLoss(); },
  };
}
