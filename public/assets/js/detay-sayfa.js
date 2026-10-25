import { $ } from './ui.js';
import { detay } from './detay.js';
const k = $('#detay'); if (k) detay(k).catch(e => { console.error(e); k.insertAdjacentHTML('afterbegin', '<p class="hata-metni" role="alert">Veri yüklenemedi. Sayfayı yenileyin.</p>'); });
