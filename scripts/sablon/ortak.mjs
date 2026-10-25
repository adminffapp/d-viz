import { e } from './layout.mjs';
export const kirinti = (...ogeler) => `<nav class="kirinti" aria-label="Sayfa yolu"><ol><li><a href="/">Ana sayfa</a></li>${ogeler.map(([h, ad]) => `<li>${h ? `<a href="${h}">${e(ad)}</a>` : `<span aria-current="page">${e(ad)}</span>`}</li>`).join('')}</ol></nav>`;
export const ustBolum = ({ kirintiHtml = '', baslik, giris = '' }) => `<div class="kap sayfa-ust">${kirintiHtml}<h1>${e(baslik)}</h1>${giris ? `<p class="giris">${giris}</p>` : ''}</div>`;
export const kirintiLd = (ogeler, origin) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['/', 'Ana sayfa'], ...ogeler].map(([h, ad], i) => ({ '@type': 'ListItem', position: i + 1, name: ad, item: origin + h })) });
export const reklam = yuva => `<div class="kap"><div class="reklam" data-yuva="${yuva}" aria-label="Reklam alanı"></div></div>`;
export const HIZLI = [10, 50, 100, 500, 1000, 5000];
export const turSecenek = `<option value="1">Döviz alış</option><option value="2">Döviz satış</option><option value="3">Efektif alış</option><option value="4">Efektif satış</option>`;
