import { $ } from './ui.js';
import { uyarilar } from './uyarilar.js';
const k = $('#uyari'); uyarilar(k).catch(e => { console.error(e); k.insertAdjacentHTML('afterbegin', '<p class="hata-metni" role="alert">Veri yüklenemedi. Sayfayı yenileyin.</p>'); });
