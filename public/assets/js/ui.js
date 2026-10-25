// Küçük arayüz yardımcıları.
export const $ = (s, k = document) => k.querySelector(s);
export const $$ = (s, k = document) => [...k.querySelectorAll(s)];
export function kacis(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
/** localStorage; kapalıysa bellekte çalışır, hata fırlatmaz. */
const bellek = new Map();
export const depo = {
  oku(k, varsayilan = null) {
    try { const v = localStorage.getItem('ffd:' + k); return v == null ? varsayilan : JSON.parse(v); }
    catch { return bellek.has(k) ? bellek.get(k) : varsayilan; }
  },
  yaz(k, v) {
    bellek.set(k, v);
    try { localStorage.setItem('ffd:' + k, JSON.stringify(v)); return true; } catch { return false; }
  },
  sil(k) { bellek.delete(k); try { localStorage.removeItem('ffd:' + k); } catch { /* yok say */ } },
};
export function toast(mesaj, tur = 'bilgi') {
  let kap = $('#toastlar');
  if (!kap) { kap = document.createElement('div'); kap.id = 'toastlar'; kap.setAttribute('role', 'status'); kap.setAttribute('aria-live', 'polite'); document.body.append(kap); }
  const t = document.createElement('div');
  t.className = 'toast toast-' + tur; t.textContent = mesaj; kap.append(t);
  setTimeout(() => { t.classList.add('gidiyor'); setTimeout(() => t.remove(), 300); }, 3200);
}
export async function kopyala(metin, mesaj = 'Kopyalandı') {
  try { await navigator.clipboard.writeText(metin); }
  catch {
    const ta = document.createElement('textarea'); ta.value = metin; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.append(ta); ta.select(); try { document.execCommand('copy'); } catch { /* yok say */ } ta.remove();
  }
  toast(mesaj);
}
export async function paylas({ baslik, metin, url }) {
  if (navigator.share) { try { await navigator.share({ title: baslik, text: metin, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  await kopyala(url, 'Bağlantı kopyalandı');
}
export function indir(ad, icerik, tur = 'text/csv;charset=utf-8') {
  const blob = new Blob([icerik], { type: tur });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = ad; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
export const gecikme = (f, ms = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };
/** URL sorgusundan başlangıç durumu, duruma göre adres güncelleme (paylaşılabilir hesaplar). */
export const sorgu = () => Object.fromEntries(new URLSearchParams(location.search));
export function sorguYaz(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) if (v != null && v !== '') p.set(k, v);
  const s = p.toString();
  history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
}
export const olay = (ad, veri) => { try { window.va && window.va('event', { name: ad, data: veri }); } catch { /* yok say */ } };
