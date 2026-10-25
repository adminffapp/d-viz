import { $ } from './ui.js';
import { kurTablo } from './kur-tablo.js';
const k = $('#kur-tablo'); if (k) kurTablo(k, { gorunum: 'tum' }).catch(e => { console.error(e); k.insertAdjacentHTML('afterbegin', '<p class="hata-metni" role="alert">Veri yüklenemedi.</p>'); });
