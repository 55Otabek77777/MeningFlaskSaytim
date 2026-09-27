#!/usr/bin/env node
/* Faqat KO’RIB CHIQISH uchun: dist/index.html dagi https://mirzoulugbek.app/... rasmlarni assets/ dan
   data: URI ga almashtiradi (internetsiz yoki artefaktda ham rasmlar ko’rinsin). DEPLOY uchun index.html ishlatiladi. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MAP = { '/logo.png': 'logo.png', '/icon.png': 'icon.png', '/og-image.png': 'og-image.png',
  '/photos/founder.webp': 'asoschi.webp', '/photos/director.webp': 'direktor.webp', '/photos/history-1994.webp': 'bino-asosiy.webp' };
const MIME = { png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg' };
/* assets/ da yo‘q bo‘lsa — DIGITAL yuklagan jonli sayt fayllari (JONLI-SAYT/MEDIA/<yo‘l>); video URL o‘zgarmaydi (poster ko‘rinadi) */
const fileFor = p => { const a = MAP[p] && path.join(ROOT, 'assets', MAP[p]); if (a && fs.existsSync(a)) return a; const b = path.join(ROOT, 'JONLI-SAYT/MEDIA', p); return fs.existsSync(b) ? b : null; };
let html = fs.readFileSync(path.join(ROOT, 'dist/index.html'), 'utf8');
const cache = {};
html = html.replace(/https:\/\/mirzoulugbek\.app(\/[\w\-./]+\.(?:png|webp|jpg))/g, (m, p) => {
  const f = fileFor(p);
  if (!f) return m;
  if (!cache[p]) cache[p] = `data:${MIME[f.split('.').pop()]};base64,${fs.readFileSync(f).toString('base64')}`;
  return cache[p];
});
fs.writeFileSync(path.join(ROOT, 'dist/preview-inline.html'), html);
/* artefakt uchun: tashqi <html>/<head>/<body> o’ramini olib tashlaymiz (platforma o’zi o’raydi) */
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset="utf-8">\s*/, '').replace(/<meta name="viewport"[^>]*>\s*/, '')
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Mirzo Ulug’bek maktabi</title>');
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
fs.writeFileSync(path.join(ROOT, 'dist/artifact.html'), head.trim() + '\n' + body.trim() + '\n');
console.log('✔ dist/preview-inline.html', (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB · dist/artifact.html');
