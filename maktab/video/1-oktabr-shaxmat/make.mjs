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
const M = {
  fonts: fs.readFileSync(path.join(here, '../../vendor/fonts.css'), 'utf8'),
  gsap: fs.readFileSync(path.join(here, '../../node_modules/gsap/dist/gsap.min.js'), 'utf8'),
  klip30: uri('klip30.mp4', 'video/mp4'), orbit: uri('yangi-bino-orbit.mp4', 'video/mp4'), pano: uri('hudud-panorama.mp4', 'video/mp4'),
  bino: uri('bino.jpg', 'image/jpeg'), logo: uri('logo.png', 'image/png')
};
let html = fs.readFileSync(path.join(here, 'ssenariy.src.html'), 'utf8');
html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in M ? M[k] : m));
fs.writeFileSync(out, html);
console.log('✔', out, (Buffer.byteLength(html) / 1048576).toFixed(1) + ' MB');
