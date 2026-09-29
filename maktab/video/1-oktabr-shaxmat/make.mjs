// Ko’rib chiqish uchun bitta HTML: shriftlar, GSAP va media data: URI sifatida ichiga joylanadi.
// node make.mjs <assets papkasi> <chiqish.html> [--render <render papkasi>] [--vo-dur 2.1,7.9,…]
// assets: klip30.mp4 (asl videoning 0:00–0:30), cheer.mp4 va social.mp4 (maktab videosidan bo’laklar),
//         yangi-bino-orbit.mp4, hudud-panorama.mp4, yangi-bino-tepadan.mp4, sinf1.jpg, sinf2.jpg, sinf3.jpg, fasad.jpg, logo.png
// Asl olimpiada kadrlari repoga qo’yilmaydi (begona efir) — assets faqat lokal.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const [assets, out] = process.argv.slice(2);
if (!assets || !out) { console.error('node make.mjs <assets> <out.html>'); process.exit(1); }
const uri = (f, mime) => `data:${mime};base64,${fs.readFileSync(path.join(assets, f)).toString('base64')}`;
const VIDS = { klip30: 'klip30.mp4', cheer: 'cheer.mp4', orbit: 'yangi-bino-orbit.mp4', pano: 'hudud-panorama.mp4', tepa: 'yangi-bino-tepadan.mp4', social: 'social.mp4' };
const IMGS = { sinf1: 'sinf1.jpg', sinf2: 'sinf2.jpg', sinf3: 'sinf3.jpg', fasad: 'fasad.jpg', logo: 'logo.png' };
const ri = process.argv.indexOf('--render');
const M = {
  fonts: fs.readFileSync(path.join(here, '../../vendor/fonts.css'), 'utf8'),
  gsap: fs.readFileSync(path.join(here, '../../node_modules/gsap/dist/gsap.min.js'), 'utf8')
};
if (ri > 0) {
  /* --render <papka>: kadrma-kadr render uchun — media data: URI emas, <papka>/fr/<nom>/NNNNN.jpg kadrlari va rasm fayllari */
  const dir = process.argv[ri + 1], n = d => fs.readdirSync(path.join(dir, 'fr', d)).filter(f => f.endsWith('.jpg')).length;
  for (const k of Object.keys(VIDS)) M[k] = '';
  for (const [k, f] of Object.entries(IMGS)) { fs.copyFileSync(path.join(assets, f), path.join(dir, f)); M[k] = f; }
  const cfg = { fps: 30, dfps: 60, clip: 'fr/clip', clipN: n('clip') };
  for (const k of ['cheer', 'orbit', 'pano', 'tepa', 'social']) Object.assign(cfg, { [k]: `fr/${k}60`, [k + 'N']: n(k + '60') });
  M.renderCfg = `<script>window.RENDER=${JSON.stringify(cfg)};</script>`;
} else {
  for (const [k, f] of Object.entries(VIDS)) M[k] = uri(f, 'video/mp4');
  for (const [k, f] of Object.entries(IMGS)) M[k] = uri(f, f.endsWith('.png') ? 'image/png' : 'image/jpeg');
}
/* --vo-dur 2.1,7.9,… : diktor gaplarining haqiqiy uzunligi (s) — sahnalar shunga moslanadi */
const vi = process.argv.indexOf('--vo-dur');
const voDur = vi > 0 ? `<script>window.VO_DUR=${JSON.stringify(process.argv[vi + 1].split(',').map(Number))};</script>` : '';
let html = fs.readFileSync(path.join(here, 'ssenariy.src.html'), 'utf8');
if (voDur) html = html.replace('</head>', voDur + '\n</head>');
if (M.renderCfg) html = html.replace('</head>', M.renderCfg + '\n</head>');
html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in M ? M[k] : m));
fs.writeFileSync(out, html);
console.log('✔', out, (Buffer.byteLength(html) / 1048576).toFixed(1) + ' MB');
