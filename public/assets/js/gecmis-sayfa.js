import { $ } from './ui.js';
import { gecmis } from './gecmis.js';
gecmis($('#gecmis')).catch(e => { console.error(e); $('#gecmis').insertAdjacentHTML('afterbegin', '<p class="hata-metni" role="alert">Veri yüklenemedi. Sayfayı yenileyin.</p>'); });
