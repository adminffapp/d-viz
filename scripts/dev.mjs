import http from 'node:http'; import { readFile, stat } from 'node:fs/promises'; import path from 'node:path';
const kok = path.resolve(process.argv[2] || 'public'); const port = Number(process.argv[3] || 4173);
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer(async (q, s) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  let f = path.join(kok, p);
  try { if ((await stat(f)).isDirectory()) { if (!p.endsWith('/')) { s.writeHead(308, { Location: p + '/' }); return s.end(); } f = path.join(f, 'index.html'); } } catch { /* 404 */ }
  try { const b = await readFile(f); s.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); s.end(b); }
  catch { try { const b = await readFile(path.join(kok, '404.html')); s.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); s.end(b); } catch { s.writeHead(404); s.end('yok'); } }
}).listen(port, () => console.log('http://localhost:' + port));
