// Kadrma-kadr render: make.mjs --render bilan yig'ilgan index.html ni 1920×1080 da ochib,
// har bir kadrni (30 kadr/s) JPEG qilib saqlaydi. Keyin ffmpeg bilan videoga yig'iladi.
// node render.mjs <render papkasi> [--times 1.5,12,...]  |  [--from 0 --to 2040]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../node_modules/playwright'));
const dir = path.resolve(process.argv[2]);
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const out = path.join(dir, arg('--times') ? 'test' : 'out');
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: +(arg('--scale') ?? 1) });  /* --scale 0.4445 → 854×480 oldindan ko’rish */
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.join(dir, 'index.html'));
await p.evaluate(() => document.fonts.ready);
const D = await p.evaluate(() => window.RENDER_D);
const FPS = +(arg('--fps') ?? 30);
fs.writeFileSync(path.join(dir, 'timing.json'), JSON.stringify({ ...(await p.evaluate(() => window.TIMING)), fps: FPS }));
const list = arg('--times') ? arg('--times').split(',').map(Number).map(t => Math.round(t * FPS))
  : Array.from({ length: (+(arg('--to') ?? Math.round(D * FPS))) - (+(arg('--from') ?? 0)) }, (_, k) => k + +(arg('--from') ?? 0));
const t0 = Date.now();
for (const [k, i] of list.entries()) {
  await p.evaluate(t => window.renderAt(t), i / FPS);
  await p.screenshot({ path: path.join(out, String(i + 1).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
  if (k % 150 === 0) console.log(`kadr ${i + 1}/${list.length} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
console.log('tayyor:', list.length, 'kadr,', ((Date.now() - t0) / 1000).toFixed(0), 's; xatolar:', JSON.stringify(errs));
await b.close();
