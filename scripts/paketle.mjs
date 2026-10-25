// Three.js'ten yalnızca kullanılan parçaları tek küçük dosyaya paketler (public/assets/js/coin3d.js).
import { build } from 'esbuild';
import { statSync } from 'node:fs';
for (const [giris, cikis] of [['src/coin3d.src.js', 'coin3d.js'], ['src/forex3d.src.js', 'forex3d.js']]) {
  await build({ entryPoints: [giris], bundle: true, minify: true, format: 'esm', target: 'es2020', outfile: 'public/assets/js/' + cikis, legalComments: 'none', treeShaking: true });
  console.log(cikis, Math.round(statSync('public/assets/js/' + cikis).size / 1024) + ' KB');
}
