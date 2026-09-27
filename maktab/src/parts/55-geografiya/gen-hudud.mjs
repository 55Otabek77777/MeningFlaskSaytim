// Bazaviy chatdan kelgan hududiy ULUSHLAR (%) → a-hudud.js. Barcha o’quv yillari BIRLASHTIRILADI:
// har bir viloyat ulushi yillar bo’yicha o’rtachalanadi (yilda `jami` bo’lsa — o’quvchilar soni bilan tortiladi),
// so’ng faqat rang to’qligi DARAJASI (1…10) va tartib yoziladi. Saytda raqam ham, foiz ham, «kam/ko’p» ham yo’q.
// Foizli kirish fayli repoga qo’yilmaydi (maxfiylik): node src/parts/55-geografiya/gen-hudud.mjs <hududlar.json>
// Kirish: {"hududlar": {"2025-2026": {"jami"?: N, "viloyat": {"Farg’ona": 60.0, ...}}, ...}}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'a-hudud.js');
const src = process.argv[2];
const ap = s => s.replace(/[ʻʼ'‘`]/g, '’').trim();
const VIL = { 'Andijon': 'andijan', 'Buxoro': 'bukhara', 'Farg’ona': 'fergana', 'Jizzax': 'jizzakh', 'Xorazm': 'xorazm', 'Namangan': 'namangan', 'Navoiy': 'navoiy',
  'Qashqadaryo': 'qashqadaryo', 'Qoraqalpog’iston': 'karakalpakstan', 'Qoraqalpog’iston Respublikasi': 'karakalpakstan', 'Samarqand': 'samarqand', 'Sirdaryo': 'sirdaryo',
  'Surxondaryo': 'surxondaryo', 'Toshkent viloyati': 'tashkent-region', 'Toshkent shahri': 'tashkent-city' };
if (!src || !fs.existsSync(src)) {
  fs.writeFileSync(out, '/* hududiy ma’lumot yo’q — xarita faktlar bo’yicha 6 hududni ko’rsatadi */\nwindow.muGeoData = null;\n');
  console.log('kirish fayli yo’q → muGeoData = null'); process.exit(0);
}
const d = JSON.parse(fs.readFileSync(src, 'utf8')).hududlar || {};
const sum = {}, years = [];
let wsum = 0;
for (const [y, v] of Object.entries(d)) {
  if (!v || !v.viloyat) continue;
  const w = +v.jami > 0 ? +v.jami : 1;
  years.push(y); wsum += w;
  for (const [n, p] of Object.entries(v.viloyat)) {
    const id = VIL[ap(n)]; if (!id) { console.warn('noma’lum viloyat:', n); continue; }
    sum[id] = (sum[id] || 0) + w * +p;
  }
}
const share = Object.fromEntries(Object.entries(sum).map(([k, s]) => [k, s / wsum]).filter(([, s]) => s > 0));
const ids = Object.keys(share).sort((a, b) => share[b] - share[a]);
/* rang to’qligi: ildiz (hajm) va logarifm (kichik hududlar ham ko’rinsin) aralashmasi → 1…10 */
const mx = share[ids[0]], mn = share[ids[ids.length - 1]];
const lvl = {};
for (const id of ids) {
  const sq = Math.sqrt(share[id] / mx), lg = mx === mn ? 1 : Math.log(share[id] / mn) / Math.log(mx / mn);
  lvl[id] = Math.max(1, Math.min(10, Math.round(1 + 9 * (0.5 * sq + 0.5 * lg))));
}
const ys = years.sort().map(y => y.replace('-', '–'));
fs.writeFileSync(out, `/* gen-hudud.mjs — maktab bazasi (${ys.join(', ')}) jamlangan: faqat tartib va rang to’qligi darajasi 1…10. Raqam yo’q. */\nwindow.muGeoData = ${JSON.stringify({ years: ys, order: ids, level: lvl })};\n`);
console.log('a-hudud.js:', ids.map(i => i + ':' + lvl[i]).join(' '));
