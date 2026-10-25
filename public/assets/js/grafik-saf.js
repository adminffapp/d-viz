// DOM gerektirmeyen grafik yardımcıları (derleme sırasında da kullanılır).
export function sparkYol(degerler, w = 96, h = 28, pay = 2) {
  const v = (degerler || []).filter(x => x != null);
  if (v.length < 2) return '';
  const mn = Math.min(...v), mx = Math.max(...v), r = mx - mn || 1;
  return v.map((x, i) => `${i ? 'L' : 'M'}${(pay + (i / (v.length - 1)) * (w - 2 * pay)).toFixed(1)} ${(h - pay - ((x - mn) / r) * (h - 2 * pay)).toFixed(1)}`).join('');
}
