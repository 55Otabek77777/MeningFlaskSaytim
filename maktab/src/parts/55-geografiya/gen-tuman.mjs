// Farg’ona vodiysi (Farg’ona, Andijon, Namangan) tumanlari chegaralari → a-tuman.js
// Manba: geoBoundaries gbOpen UZB ADM2 (OCHA ROCCA, CC BY 3.0 IGO) — simplified GeoJSON.
// Ishga tushirish: node src/parts/55-geografiya/gen-tuman.mjs <geoBoundaries-UZB-ADM2_simplified.geojson>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
/* o’zbekcha nom → [geoBoundaries shapeName, viloyat] */
export const TUMAN = {
  'Oltiariq': ['Altiarik', 'fergana'], 'Bog’dod': ['Bagdad', 'fergana'], 'Beshariq': ['Besharik', 'fergana'], 'Buvayda': ['Buvayda', 'fergana'],
  'Dang’ara': ['Dangara', 'fergana'], 'Farg’ona tumani': ['Fergana', 'fergana'], 'Furqat': ['Furkat', 'fergana'], 'Qo’shtepa': ['Kushtepa', 'fergana'],
  'Quva': ['Kuva', 'fergana'], 'Rishton': ['Rishtan', 'fergana'], 'So’x': ['Sokh', 'fergana'], 'Toshloq': ['Tashlak', 'fergana'], 'Uchko’prik': ['Uchkuprik', 'fergana'],
  'O’zbekiston': ['Uzbekistan', 'fergana'], 'Yozyovon': ['Yazyavan', 'fergana'], 'Farg’ona shahri': ['Fergana city', 'fergana'], 'Qo’qon shahri': ['Kokand city', 'fergana'],
  'Marg’ilon shahri': ['Margilan city', 'fergana'], 'Quvasoy shahri': ['Kuvasay city', 'fergana'],
  'Andijon tumani': ['Andijan', 'andijan'], 'Andijon shahri': ['Andijan city', 'andijan'], 'Asaka': ['Asaka', 'andijan'], 'Baliqchi': ['Balikchi', 'andijan'],
  'Bo’ston': ['Boz', 'andijan'], 'Buloqboshi': ['Bulakbashi', 'andijan'], 'Izboskan': ['Izboskan', 'andijan'], 'Jalaquduq': ['Djalalkuduk', 'andijan'],
  'Xo’jaobod': ['Khadjaabad', 'andijan'], 'Qo’rg’ontepa': ['Kurgantepa', 'andijan'], 'Marhamat': ['Markhamat', 'andijan'], 'Oltinko’l': ['Altinkul', 'andijan'],
  'Paxtaobod': ['Paxtaabad', 'andijan'], 'Shahrixon': ['Shakhrixan', 'andijan'], 'Ulug’nor': ['Ulugnar', 'andijan'], 'Xonobod shahri': ['Khanabad city', 'andijan'],
  'Chortoq': ['Chartak', 'namangan'], 'Chust': ['Chust', 'namangan'], 'Kosonsoy': ['Kasansay', 'namangan'], 'Mingbuloq': ['Mingbulak', 'namangan'],
  'Namangan tumani': ['Namangan', 'namangan'], 'Namangan shahri': ['Namangan city', 'namangan'], 'Norin': ['Narin', 'namangan'], 'Pop': ['Pap', 'namangan'],
  'To’raqo’rg’on': ['Turakurgan', 'namangan'], 'Uchqo’rg’on': ['Uchkurgan', 'namangan'], 'Uychi': ['Uychi', 'namangan'], 'Yangiqo’rg’on': ['Yangikurgan', 'namangan']
};
const run = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (run) {
  const src = process.argv[2];
  if (!src) { console.error('geojson yo’li kerak'); process.exit(1); }
  const gj = JSON.parse(fs.readFileSync(src, 'utf8'));
  const byShape = {}; for (const [uz, [sh, reg]] of Object.entries(TUMAN)) byShape[sh] = { uz, reg };
  const feats = gj.features.filter(f => byShape[f.properties.shapeName]);
  const miss = Object.values(TUMAN).map(v => v[0]).filter(s => !feats.some(f => f.properties.shapeName === s));
  if (miss.length) console.warn('topilmadi:', miss.join(', '));
  const rings = f => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).flat();
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  feats.forEach(f => rings(f).forEach(r => r.forEach(([lon, lat]) => { x0 = Math.min(x0, lon); x1 = Math.max(x1, lon); y0 = Math.min(y0, lat); y1 = Math.max(y1, lat); })));
  const lat0 = (y0 + y1) / 2 * Math.PI / 180, W = 1000, k = W / ((x1 - x0) * Math.cos(lat0)), H = Math.round((y1 - y0) * k);
  const P = ([lon, lat]) => [(lon - x0) * Math.cos(lat0) * k, (y1 - lat) * k];
  const dp = (pts, eps) => {
    if (pts.length < 4) return pts;
    const [a, b] = [pts[0], pts[pts.length - 1]]; let idx = 0, dmax = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      const d = Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / L; if (d > dmax) { dmax = d; idx = i; }
    }
    return dmax > eps ? dp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(dp(pts.slice(idx), eps)) : [a, b];
  };
  const out = feats.map(f => {
    const { uz, reg } = byShape[f.properties.shapeName];
    /* yopiq halqa: birinchi nuqtadan eng uzoq nuqtada ikkiga bo’lib soddalashtiramiz (aks holda DP chiziq uzunligi 0 bo’ladi) */
    const ring = pts => { let m = 0, dm = -1; pts.forEach((p, i) => { const d = Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]); if (d > dm) { dm = d; m = i; } }); return dp(pts.slice(0, m + 1), 0.5).slice(0, -1).concat(dp(pts.slice(m), 0.5)); };
    const d = rings(f).map(r => ring(r.map(P))).filter(r => r.length > 2).map(r => 'M' + r.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z').join('');
    return { id: f.properties.shapeName, uz, reg, d };
  });
  const js = `/* gen-tuman.mjs — Farg’ona vodiysi tumanlari: geoBoundaries (OCHA ROCCA, CC BY 3.0 IGO) */\nwindow.muValley = ${JSON.stringify({ viewBox: `0 0 ${W} ${H}`, t: out })};\n`;
  fs.writeFileSync(path.join(here, 'a-tuman.js'), js);
  console.log('a-tuman.js', (js.length / 1024).toFixed(1) + ' KB', out.length, 'tuman', `0 0 ${W} ${H}`);
}
