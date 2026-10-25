import { $ } from './ui.js';
import { karsilastir } from './karsilastir.js';
const k = $('#karsi'); karsilastir(k).catch(e => { console.error(e); k.insertAdjacentHTML('afterbegin', '<p class="hata-metni" role="alert">Veri yüklenemedi. Sayfayı yenileyin.</p>'); });
