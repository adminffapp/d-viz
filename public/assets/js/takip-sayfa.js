import { $ } from './ui.js';
import { takip } from './takip.js';
const k = $('#takip'); takip(k).catch(e => { console.error(e); k.insertAdjacentHTML('afterbegin', '<p class="hata-metni" role="alert">Veri yüklenemedi. Sayfayı yenileyin.</p>'); });
