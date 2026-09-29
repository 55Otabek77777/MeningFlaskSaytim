// Ko’rib chiqish uchun bitta HTML: shriftlar, GSAP va media data: URI sifatida ichiga joylanadi.
// node make.mjs <assets papkasi> <chiqish.html>
// assets: klip30.mp4 (asl videoning 0:00–0:30), yangi-bino-orbit.mp4, hudud-panorama.mp4, bino.jpg, logo.png
// Asl olimpiada kadrlari repoga qo’yilmaydi (begona efir) — assets faqat lokal.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const [assets, out] = process.argv.slice(2);
if (!assets || !out) { console.error('node make.mjs <assets> <out.html>'); process.exit(1); }
const uri = (f, mime) => `data:${mime};base64,${fs.readFileSync(path.join(assets, f)).toString('base64')}`;
const ri0 = process.argv.indexOf('--render') > 0;
const M = {
  fonts: fs.readFileSync(path.join(here, '../../vendor/fonts.css'), 'utf8'),
  gsap: fs.readFileSync(path.join(here, '../../node_modules/gsap/dist/gsap.min.js'), 'utf8'),
  ...(ri0 ? {} : { klip30: uri('klip30.mp4', 'video/mp4'), orbit: uri('yangi-bino-orbit.mp4', 'video/mp4'), pano: uri('hudud-panorama.mp4', 'video/mp4'),
    bino: uri('bino.jpg', 'image/jpeg'), logo: uri('logo.png', 'image/png') })
};
/* --render <papka>: kadrma-kadr render uchun — media data: URI emas, <papka>/fr/{clip,orbit,pano}/NNNNN.jpg kadrlari */
const ri = process.argv.indexOf('--render');
if (ri > 0) {
  const dir = process.argv[ri + 1], n = d => fs.readdirSync(path.join(dir, 'fr', d)).filter(f => f.endsWith('.jpg')).length;
  Object.assign(M, { klip30: '', orbit: '', pano: '', bino: 'bino.jpg', logo: 'logo.png' });
  M.renderCfg = `<script>window.RENDER=${JSON.stringify({ fps: 30, dfps: 60, clip: 'fr/clip', clipN: n('clip'), orbit: 'fr/orbit60', orbitN: n('orbit60'), pano: 'fr/pano60', panoN: n('pano60') })};</script>`;
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
