// Bazaviy chatdan kelgan hududiy ULUSHLAR (%) → a-hudud.js (faqat DARAJALAR, raqamsiz).
// Saytda o’quvchilar soni ham, foiz ham ko’rsatilmaydi — «kam / o’rta / ko’p / juda ko’p».
// Foizli kirish fayli repoga qo’yilmaydi (maxfiylik): node src/parts/55-geografiya/gen-hudud.mjs <hududlar.json>
// Kirish: {"hududlar": {"2025-2026": {"viloyat": {"Farg’ona": 60.0, ...}, "tuman": {"Uchko’prik": 31.9, ...}}, ...}}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TUMAN } from './gen-tuman.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const src = process.argv[2];
const ap = s => s.replace(/[\u02BB\u02BC'‘`]/g, '’').trim();
const VIL = { 'Andijon': 'andijan', 'Buxoro': 'bukhara', 'Farg’ona': 'fergana', 'Jizzax': 'jizzakh', 'Xorazm': 'xorazm', 'Namangan': 'namangan', 'Navoiy': 'navoiy',
  'Qashqadaryo': 'qashqadaryo', 'Qoraqalpog’iston': 'karakalpakstan', 'Qoraqalpog’iston Respublikasi': 'karakalpakstan', 'Samarqand': 'samarqand', 'Sirdaryo': 'sirdaryo',
  'Surxondaryo': 'surxondaryo', 'Toshkent viloyati': 'tashkent-region', 'Toshkent shahri': 'tashkent-city' };
const tierV = p => (p >= 40 ? 4 : p >= 10 ? 3 : p >= 3 ? 2 : p > 0 ? 1 : 0);   /* viloyat */
const tierT = p => (p >= 15 ? 4 : p >= 5 ? 3 : p >= 1.5 ? 2 : p > 0 ? 1 : 0);  /* tuman */
if (!src || !fs.existsSync(src)) {
  fs.writeFileSync(path.join(here, 'a-hudud.js'), '/* hududiy daraja ma’lumoti yo’q — xarita faktlar bo’yicha 6 hududni ko’rsatadi */\nwindow.muGeoData = null;\n');
  console.log('kirish fayli yo’q → muGeoData = null'); process.exit(0);
}
const d = JSON.parse(fs.readFileSync(src, 'utf8')).hududlar || {};
const years = {};
for (const [y, v] of Object.entries(d)) {
  if (!v || !v.viloyat) continue;
  const vil = {}, tum = {};
  for (const [n, p] of Object.entries(v.viloyat)) { const id = VIL[ap(n)]; if (!id) { console.warn('noma’lum viloyat:', n); continue; } if (tierV(+p)) vil[id] = tierV(+p); }
  for (const [n, p] of Object.entries(v.tuman || {})) {
    let key = ap(n); if (!TUMAN[key]) key = key.replace(/ tumani$/, '');
    const t = TUMAN[key] || TUMAN[key + ' tumani'];
    if (!t) { console.warn('noma’lum tuman:', n); continue; }
    if (tierT(+p)) tum[t[0]] = tierT(+p);
  }
  years[y] = Object.keys(tum).length ? { viloyat: vil, tuman: tum } : { viloyat: vil };
}
const list = Object.keys(years).sort();
fs.writeFileSync(path.join(here, 'a-hudud.js'), `/* gen-hudud.mjs — bazaviy chat (maktab bazasi) ulushlaridan faqat darajalar: 1 kam … 4 juda ko’p. Raqam yo’q. */\nwindow.muGeoData = ${JSON.stringify({ latest: list[list.length - 1], years })};\n`);
console.log('a-hudud.js:', list.join(', '));
