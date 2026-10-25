import { $ } from './ui.js';
import { cevirici } from './cevirici.js';
cevirici($('#cevirici')).catch(e => { console.error(e); $('#cevirici').insertAdjacentHTML('afterbegin', '<p class="hata-metni" role="alert">Veri yüklenemedi. Sayfayı yenileyin.</p>'); });
