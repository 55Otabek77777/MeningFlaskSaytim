// Haqiqiy osmon: d3-celestial (BSD-3) ma’lumotlari — Yale Bright Star katalogi yulduzlari va yulduz turkumlari chiziqlari.
// Samarqanddan (39,67° sh.k.) ko’rinadigan (dec > −50°), 5,6 kattalikkacha yulduzlar → a-sky.js (ixcham butun sonlar).
// Ishga tushirish: node src/parts/27-rasadxona/gen-sky.mjs [ma’lumot papkasi]  (bo’lmasa GitHub raw’dan yuklaydi)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/';
const dir = process.argv[2];
const load = async f => (dir ? JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) : (await fetch(BASE + f)).json());
const stars = (await load('stars.6.json')).features
  .map(f => ({ ra: (f.geometry.coordinates[0] + 360) % 360, dec: f.geometry.coordinates[1], mag: f.properties.mag, bv: parseFloat(f.properties.bv) }))
  .filter(s => s.dec > -50 && isFinite(s.mag))
  .filter(s => s.mag <= 5.6)
  .sort((a, b) => a.mag - b.mag);
const S = [];
stars.forEach(s => S.push(Math.round(s.ra * 10), Math.round(s.dec * 10), Math.round(s.mag * 10), Math.round((isFinite(s.bv) ? s.bv : 0.6) * 10)));
const lines = (await load('constellations.lines.json')).features.flatMap(f => f.geometry.coordinates.map(line => line.flatMap(([ra, dec]) => [Math.round(((ra + 360) % 360) * 10), Math.round(dec * 10)])))
  .filter(l => l.length >= 4);
const out = `/* Haqiqiy osmon (gen-sky.mjs): Yale Bright Star katalogi, d3-celestial (BSD-3, O. Frohn). ${stars.length} yulduz (≤ 5,6 kattalik): [ra×10, dec×10, mag×10, bv×10] … */\n`
  + `window.muSky = ${JSON.stringify({ s: S, l: lines })};\n`;
fs.writeFileSync(path.join(here, 'a-sky.js'), out);
console.log('a-sky.js', (out.length / 1024).toFixed(1) + ' KB', stars.length, 'yulduz, eng xira mag', stars[stars.length - 1].mag, '·', lines.length, 'chiziq');
