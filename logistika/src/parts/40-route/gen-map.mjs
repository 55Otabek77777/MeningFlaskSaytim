#!/usr/bin/env node
/* Build-time generator for the route map (part 40-route).
   node src/parts/40-route/gen-map.mjs [--debug]
   -> src/parts/40-route/a-map-data.js  (window.muRouteMap = {...})
   Projects Europe → East Asia with a Lambert conformal conic (d3-geo), rasterises land into a hex dot grid
   (run-length encoded), and emits borders / Uzbekistan outline / graticule / corridor + historic caravan route. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature, mesh } from 'topojson-client';
import { geoConicConformal, geoPath, geoDistance } from 'd3-geo';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, '../../..');
const debug = process.argv.includes('--debug');
const topo50 = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/world-atlas/countries-50m.json'), 'utf8'));
const topo110 = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/world-atlas/countries-110m.json'), 'utf8'));

/* ------------------------------------------------------------------ projection */
const W = 2000;
const EXT = { lon: [-14, 150], lat: [4, 76] };
const edge = [];
for (let lon = EXT.lon[0]; lon <= EXT.lon[1]; lon += 2) edge.push([lon, EXT.lat[0]], [lon, EXT.lat[1]]);
for (let lat = EXT.lat[0]; lat <= EXT.lat[1]; lat += 2) edge.push([EXT.lon[0], lat], [EXT.lon[1], lat]);
const proj = geoConicConformal().parallels([30, 52]).rotate([-66, 0]).precision(0.2);
/* fit the corridor region, then crop to a rectangle a bit smaller than the fan */
proj.fitWidth(W, { type: 'MultiPoint', coordinates: edge });
const bb = geoPath(proj).bounds({ type: 'MultiPoint', coordinates: edge });
/* crop: keep full width; vertical crop between projected lat ~6 (south, centre) and lat ~68 (north, centre) */
const yTop = proj([66, 77])[1], yBot = proj([66, 7])[1];
const tx = proj.translate();
proj.translate([tx[0] - bb[0][0], tx[1] - yTop]);
const H = Math.round(yBot - yTop);
proj.clipExtent([[-4, -4], [W + 4, H + 4]]);
const P = pt => proj(pt);

const r1 = v => Math.round(v * 10) / 10;
const r0 = v => Math.round(v);

/* ------------------------------------------------------------------ helpers */
function rings(geo, projection = proj) {
  const out = []; let cur = null;
  const ctx = {
    moveTo(x, y) { cur = [[x, y]]; out.push(cur); },
    lineTo(x, y) { cur.push([x, y]); },
    closePath() { if (cur) cur.closed = true; },
    arc() {}
  };
  geoPath(projection, ctx)(geo);
  return out;
}
function dp(points, tol) { /* Douglas–Peucker */
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length); keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a], [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
    let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / len;
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return points.filter((_, i) => keep[i]);
}
/* relative path encoding with rounding: "M x y l dx dy dx dy ... (z)" */
function encodeLines(lines, tol, dec = 0, minLen = 0) {
  const f = 10 ** dec;
  const out = [];
  for (const line of lines) {
    let pts = dp(line, tol).map(([x, y]) => [Math.round(x * f), Math.round(y * f)]);
    pts = pts.filter((p, i) => !i || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
    if (pts.length < 2) continue;
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (len / f < minLen) continue;
    const s = v => (v / f).toString();
    let d = `M${s(pts[0][0])} ${s(pts[0][1])}l`;
    const rel = [];
    for (let i = 1; i < pts.length; i++) rel.push(s(pts[i][0] - pts[i - 1][0]), s(pts[i][1] - pts[i - 1][1]));
    d += rel.join(' ').replace(/ -/g, '-');
    if (line.closed) d += 'z';
    out.push(d);
  }
  return out.join('');
}

/* ------------------------------------------------------------------ hex dot grid (scanline even-odd fill) */
const B36 = n => { if (n < 0 || n >= 1296) throw new Error('b36 range ' + n); return n.toString(36).padStart(2, '0'); };
function scan(rs, PITCH) {
  const ROWH = PITCH * Math.sqrt(3) / 2;
  const ROWS = Math.floor(H / ROWH);
  const COLS = Math.floor(W / PITCH);
  const edges = [];
  for (const ring of rs) {
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      if (a[1] !== b[1]) edges.push([a[0], a[1], b[0], b[1]]);
    }
  }
  const rows = [];
  let count = 0;
  for (let j = 0; j < ROWS; j++) {
    const y = (j + 0.5) * ROWH, off = (j % 2) * PITCH / 2;
    const xs = [];
    for (const [x1, y1, x2, y2] of edges) {
      if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
    xs.sort((a, b) => a - b);
    const runs = [];
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const c0 = Math.max(0, Math.ceil((xs[k] - off - PITCH / 2) / PITCH));
      const c1 = Math.min(COLS - 1, Math.floor((xs[k + 1] - off - PITCH / 2) / PITCH));
      if (c1 >= c0) {
        if (runs.length && runs[runs.length - 1][0] + runs[runs.length - 1][1] >= c0) {
          const last = runs[runs.length - 1]; last[1] = Math.max(last[1], c1 - last[0] + 1);
        } else runs.push([c0, c1 - c0 + 1]);
      }
    }
    runs.forEach(r => { count += r[1]; });
    rows.push(runs.map(([c, n]) => B36(c) + B36(n)).join(''));
  }
  return { rows: rows.join(','), count, pitch: PITCH, rowH: Math.round(ROWH * 10000) / 10000 };
}

const land50 = feature(topo50, topo50.objects.land);
const countries50 = feature(topo50, topo50.objects.countries);
const uzb = countries50.features.find(f => f.id === '860');
const PITCH_D = 4.4, PITCH_M = 6.2;
const landRings = rings(land50), uzbRings = rings(uzb);
const landDots = scan(landRings, PITCH_D), uzbDots = scan(uzbRings, PITCH_D);
const landDotsM = scan(landRings, PITCH_M), uzbDotsM = scan(uzbRings, PITCH_M);
const PITCH = PITCH_D, ROWH = landDots.rowH;

/* ------------------------------------------------------------------ lines */
const borders = encodeLines(rings(mesh(topo110, topo110.objects.countries, (a, b) => a !== b)), 0.9, 0, 3);
const uzbOutline = encodeLines(rings(uzb), 0.35, 1);
const coast = encodeLines(rings(feature(topo110, topo110.objects.land)), 1.1, 0, 14);

/* graticule: conic → meridians are straight lines through the apex, parallels are concentric circles */
const apex = P([66, 90]);
const parallels = [];
for (let lat = 10; lat <= 70; lat += 10) {
  const p = P([66, lat]);
  parallels.push([lat, r1(Math.hypot(p[0] - apex[0], p[1] - apex[1]))]);
}
const meridians = [];
for (let lon = -10; lon <= 150; lon += 10) {
  const a = P([lon, 0]), b = P([lon, 80]);
  meridians.push([lon, r1(a[0]), r1(a[1]), r1(b[0]), r1(b[1])]);
}

/* ------------------------------------------------------------------ cities, corridor, caravan route */
/* name, lon, lat, day, km, mode of the leg that STARTS here (0 poyezd,1 fura,2 parom), country */
const CITIES = [
  ['Shanghai', 121.47, 31.23, 1, 0, 0, 'Xitoy'],
  ['Sian', 108.94, 34.34, 2, 1250, 0, 'Xitoy'],
  ['Urumchi', 87.62, 43.83, 4, 3400, 0, 'Xitoy'],
  ['Qorgʻos', 80.41, 44.21, 5, 4050, 1, 'Qozogʻiston'],
  ['Olmaota', 76.89, 43.24, 6, 4400, 1, 'Qozogʻiston'],
  ['Toshkent', 69.24, 41.31, 7, 5150, 1, 'Oʻzbekiston'],
  ['Samarqand', 66.96, 39.65, 8, 5450, 1, 'Oʻzbekiston'],
  ['Buxoro', 64.42, 39.77, 9, 5720, 1, 'Oʻzbekiston'],
  ['Turkmanboshi', 52.97, 40.02, 10, 6700, 2, 'Turkmaniston'],
  ['Boku', 49.87, 40.41, 11, 7000, 0, 'Ozarbayjon'],
  ['Tbilisi', 44.79, 41.72, 12, 7550, 0, 'Gruziya'],
  ['Istanbul', 28.98, 41.01, 14, 8800, 0, 'Turkiya'],
  ['Duisburg', 6.76, 51.43, 18, 11000, 0, 'Germaniya']
];
/* waypoints: [lon, lat, cityIndex|-1, country] — intermediate points shape a realistic line */
const WP = [
  [121.47, 31.23, 0], [118.8, 32.06, -1, 'Xitoy'], [116.4, 33.6, -1, 'Xitoy'], [113.65, 34.75, -1, 'Xitoy'], [108.94, 34.34, 1],
  [103.83, 36.06, -1, 'Xitoy'], [101.2, 37.9, -1, 'Xitoy'], [98.3, 39.8, -1, 'Xitoy'], [93.5, 42.8, -1, 'Xitoy'], [87.62, 43.83, 2],
  [84.3, 44.5, -1, 'Xitoy'], [80.41, 44.21, 3], [76.89, 43.24, 4], [74.6, 43.0, -1, 'Qozogʻiston'], [71.4, 42.9, -1, 'Qozogʻiston'], [69.24, 41.31, 5],
  [66.96, 39.65, 6], [64.42, 39.77, 7], [63.6, 39.08, -1, 'Turkmaniston'], [61.83, 37.62, -1, 'Turkmaniston'], [58.38, 37.95, -1, 'Turkmaniston'],
  [55.6, 39.5, -1, 'Turkmaniston'], [52.97, 40.02, 8], [51.6, 40.3, -1, 'Kaspiy dengizi'], [49.87, 40.41, 9], [46.36, 40.68, -1, 'Ozarbayjon'],
  [44.79, 41.72, 10], [43.1, 40.6, -1, 'Turkiya'], [41.27, 39.9, -1, 'Turkiya'], [37.0, 39.75, -1, 'Turkiya'], [32.85, 39.93, -1, 'Turkiya'],
  [28.98, 41.01, 11], [26.5, 42.1, -1, 'Bolgariya'], [23.32, 42.7, -1, 'Bolgariya'], [20.46, 44.8, -1, 'Serbiya'], [19.04, 47.5, -1, 'Vengriya'],
  [16.37, 48.2, -1, 'Avstriya'], [11.08, 49.45, -1, 'Germaniya'], [8.68, 50.11, -1, 'Germaniya'], [6.76, 51.43, 12]
];
const CARAVAN = [
  [112.45, 34.62], [108.94, 34.34], [103.83, 36.06], [98.5, 39.7], [94.66, 40.14], [89.2, 41.6], [82.96, 41.72], [75.99, 39.47],
  [72.8, 40.53], [70.94, 40.53], [66.96, 39.65], [64.42, 39.77], [61.83, 37.62], [58.8, 36.21], [54.35, 36.2], [51.43, 35.6],
  [48.51, 34.8], [44.37, 33.31], [40.9, 34.4], [38.27, 34.55], [36.16, 36.2], [32.49, 37.87], [30.1, 40.2], [28.98, 41.01]
];

function catmull(pts, alpha = 0.5) {
  /* centripetal Catmull–Rom -> cubic beziers (port of d3-shape curveCatmullRom) */
  const segs = [];
  const ext = [[2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]], ...pts,
    [2 * pts[pts.length - 1][0] - pts[pts.length - 2][0], 2 * pts[pts.length - 1][1] - pts[pts.length - 2][1]]];
  for (let i = 1; i < ext.length - 2; i++) {
    const [p0, p1, p2, p3] = [ext[i - 1], ext[i], ext[i + 1], ext[i + 2]];
    const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), d3 = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
    const a1 = d1 ** alpha, a2 = d2 ** alpha, a3 = d3 ** alpha, b1 = d1 ** (2 * alpha), b2 = d2 ** (2 * alpha), b3 = d3 ** (2 * alpha);
    let c1 = p1.slice(), c2 = p2.slice();
    if (a1 > 1e-6) {
      const A = 2 * b1 + 3 * a1 * a2 + b2, N = 3 * a1 * (a1 + a2);
      c1 = [(p1[0] * A - p0[0] * b2 + p2[0] * b1) / N, (p1[1] * A - p0[1] * b2 + p2[1] * b1) / N];
    }
    if (a3 > 1e-6) {
      const B = 2 * b3 + 3 * a3 * a2 + b2, M = 3 * a3 * (a3 + a2);
      c2 = [(p2[0] * B + p1[0] * b3 - p3[0] * b2) / M, (p2[1] * B + p1[1] * b3 - p3[1] * b2) / M];
    }
    segs.push([p1, c1, c2, p2]);
  }
  return segs;
}
const bez = (s, t) => {
  const u = 1 - t;
  return [0, 1].map(k => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]);
};
function segsToPath(segs) {
  let d = `M${r1(segs[0][0][0])} ${r1(segs[0][0][1])}`;
  for (const s of segs) d += `C${r1(s[1][0])} ${r1(s[1][1])} ${r1(s[2][0])} ${r1(s[2][1])} ${r1(s[3][0])} ${r1(s[3][1])}`;
  return d;
}
function segLengths(segs) {
  return segs.map(s => { let L = 0, prev = s[0]; for (let i = 1; i <= 48; i++) { const p = bez(s, i / 48); L += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p; } return L; });
}

const wpProj = WP.map(w => P([w[0], w[1]]));
const corSegs = catmull(wpProj);
const corLens = segLengths(corSegs);
const corTotal = corLens.reduce((a, b) => a + b, 0);
let acc = 0;
const wpOut = WP.map((w, i) => {
  const frac = acc / corTotal;
  if (i < corLens.length) acc += corLens[i];
  const country = w[2] >= 0 ? CITIES[w[2]][6] : w[3];
  return [r1(wpProj[i][0]), r1(wpProj[i][1]), w[0], w[1], Math.round(frac * 10000) / 10000, w[2], country];
});
const caravanSegs = catmull(CARAVAN.map(P));

/* km per map unit (around Toshkent) */
const a = P([69, 41.3]), b = P([70, 41.3]);
const kmPerUnit = geoDistance([69, 41.3], [70, 41.3]) * 6371 / Math.hypot(b[0] - a[0], b[1] - a[1]);

const LABELS = [
  ['XITOY', 103.5, 31.4, 'c'], ['MOʻGʻULISTON', 102, 46.6, 'c'], ['QOZOGʻISTON', 67.5, 48.4, 'c'], ['OʻZBEKISTON', 61.2, 42.9, 'u'],
  ['TURKMANISTON', 58.6, 39.2, 's'], ['EYRON', 54, 32.4, 'c'], ['TURKIYA', 35.6, 38.3, 'c'], ['ROSSIYA', 62, 57.5, 'c'],
  ['GERMANIYA', 10.4, 52.9, 's'], ['HINDISTON', 78.5, 22.5, 'c'], ['AFGʻONISTON', 66, 34, 's'], ['POLSHA', 19.3, 52.2, 's'],
  ['Kaspiy dengizi', 50.6, 43.6, 'w'], ['Qora dengiz', 34.2, 43.3, 'w'], ['Oʻrta yer dengizi', 18.5, 35.6, 'w'],
  ['Arab dengizi', 63.5, 16.5, 'w'], ['Sariq dengiz', 123.5, 36.2, 'w']
].map(([t, lon, lat, k]) => { const p = P([lon, lat]); return [t, r0(p[0]), r0(p[1]), k]; });

const data = {
  w: W, h: H,
  grid: {
    d: { pitch: PITCH_D, rowH: landDots.rowH, land: landDots.rows, uzb: uzbDots.rows },
    m: { pitch: PITCH_M, rowH: landDotsM.rowH, land: landDotsM.rows, uzb: uzbDotsM.rows }
  },
  borders, coast, uzbOutline,
  apex: [r1(apex[0]), r1(apex[1])], parallels, meridians,
  cities: CITIES.map(c => { const p = P([c[1], c[2]]); return [c[0], r1(p[0]), r1(p[1]), c[3], c[4], c[5], c[6], c[1], c[2]]; }),
  wp: wpOut,
  corridor: segsToPath(corSegs),
  caravan: segsToPath(caravanSegs),
  kmPerUnit: Math.round(kmPerUnit * 1000) / 1000,
  labels: LABELS
};

const js = `/* generated by gen-map.mjs — do not edit */\nwindow.muRouteMap = ${JSON.stringify(data)};\n`;
fs.writeFileSync(path.join(DIR, 'a-map-data.js'), js);
console.log(`a-map-data.js ${(js.length / 1024).toFixed(1)} KB · map ${W}×${H} · dots desktop ${landDots.count} (uzb ${uzbDots.count}) · mobile ${landDotsM.count}`);
console.log(`  sizes: land ${(landDots.rows.length / 1024).toFixed(1)}K borders ${(borders.length / 1024).toFixed(1)}K coast ${(coast.length / 1024).toFixed(1)}K uzb ${(uzbOutline.length / 1024).toFixed(1)}K corridor ${(data.corridor.length / 1024).toFixed(1)}K`);
console.log(`  kmPerUnit ${data.kmPerUnit} · corridor length ${corTotal.toFixed(0)} units ≈ ${(corTotal * kmPerUnit).toFixed(0)} km`);

if (debug) {
  /* quick SVG preview for eyeballing the projection */
  const dots = [];
  data.grid.d.land.split(',').forEach((row, j) => {
    for (let k = 0; k < row.length; k += 4) {
      const c = parseInt(row.slice(k, k + 2), 36), n = parseInt(row.slice(k + 2, k + 4), 36);
      for (let i = c; i < c + n; i++) dots.push(`M${((i + 0.5) * PITCH + (j % 2) * PITCH / 2).toFixed(1)} ${((j + 0.5) * ROWH).toFixed(1)}h0`);
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="background:#03050c">
<path d="${dots.join('')}" stroke="#4a5d8f" stroke-width="3.2" stroke-linecap="round"/>
<path d="${borders}" fill="none" stroke="#7f95d0" stroke-width="1"/>
<path d="${coast}" fill="none" stroke="#2ee6d6" stroke-opacity=".5" stroke-width="1"/>
<path d="${uzbOutline}" fill="rgba(255,200,97,.25)" stroke="#ffc861" stroke-width="2"/>
<path d="${data.caravan}" fill="none" stroke="#ffc861" stroke-dasharray="6 6" stroke-width="2"/>
<path d="${data.corridor}" fill="none" stroke="#2ee6d6" stroke-width="3"/>
${data.cities.map(c => `<circle cx="${c[1]}" cy="${c[2]}" r="5" fill="#fff"/><text x="${c[1] + 8}" y="${c[2] - 8}" fill="#fff" font-size="16">${c[0]}</text>`).join('')}
${data.labels.map(l => `<text x="${l[1]}" y="${l[2]}" fill="#8899cc" font-size="14" text-anchor="middle">${l[0]}</text>`).join('')}
${parallels.map(([, r]) => `<circle cx="${apex[0]}" cy="${apex[1]}" r="${r}" fill="none" stroke="#334" />`).join('')}
${meridians.map(m => `<line x1="${m[1]}" y1="${m[2]}" x2="${m[3]}" y2="${m[4]}" stroke="#334"/>`).join('')}
</svg>`;
  fs.mkdirSync(path.join(ROOT, 'qa/E'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'qa/E/map-debug.svg'), svg);
  console.log('  debug → qa/E/map-debug.svg');
}
