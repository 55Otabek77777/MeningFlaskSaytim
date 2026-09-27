#!/usr/bin/env node
/* Build the single-file site.
   node build.mjs                      -> dist/index.html (all parts)
   node build.mjs --only hero,ticker   -> dist/preview-hero-ticker.html (only those parts)
   node build.mjs --release            -> also copies dist/index.html to ./index.html
   node build.mjs --full-three         -> skip THREE tree-shaking (debug)
   Parts live in src/parts/NN-name/ : part.html, *.css (sorted), *.js (sorted; *.mjs ignored). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const r = (...p) => path.join(ROOT, ...p);
const read = p => fs.readFileSync(p, 'utf8');
const args = process.argv.slice(2);
const flag = n => args.includes('--' + n);
const opt = n => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };

const GSAP_FILES = ['gsap', 'ScrollTrigger', 'SplitText', 'MotionPathPlugin', 'DrawSVGPlugin', 'CustomEase', 'Flip',
  'Observer', 'ScrambleTextPlugin', 'MorphSVGPlugin', 'ScrollToPlugin', 'Draggable', 'InertiaPlugin'];

const THREE_ADDONS = {
  EffectComposer: 'three/examples/jsm/postprocessing/EffectComposer.js',
  RenderPass: 'three/examples/jsm/postprocessing/RenderPass.js',
  UnrealBloomPass: 'three/examples/jsm/postprocessing/UnrealBloomPass.js',
  OutputPass: 'three/examples/jsm/postprocessing/OutputPass.js',
  ShaderPass: 'three/examples/jsm/postprocessing/ShaderPass.js',
  RoundedBoxGeometry: 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
};
const THREE_NAMESPACES = { BufferGeometryUtils: 'three/examples/jsm/utils/BufferGeometryUtils.js' };

/* ------------------------------------------------------------ collect parts */
const partsDir = r('src/parts');
let dirs = fs.readdirSync(partsDir).filter(d => /^\d\d-/.test(d) && fs.statSync(path.join(partsDir, d)).isDirectory()).sort();
const only = opt('only');
if (only) {
  const want = only.split(',').map(s => s.trim()).filter(Boolean);
  dirs = dirs.filter(d => want.includes(d) || want.includes(d.replace(/^\d\d-/, '')));
  if (!dirs.length) { console.error('No parts matched --only', only); process.exit(1); }
}

const parts = dirs.map(d => {
  const dir = path.join(partsDir, d);
  const files = fs.readdirSync(dir).sort();
  const html = files.includes('part.html') ? read(path.join(dir, 'part.html')) : '';
  const css = files.filter(f => f.endsWith('.css')).map(f => `/* ---- ${d}/${f} ---- */\n` + read(path.join(dir, f))).join('\n');
  const js = files.filter(f => f.endsWith('.js')).map(f => ({ name: `${d}/${f}`, code: read(path.join(dir, f)) }));
  return { d, html, css, js };
});

/* sanity: every top-level element in part.html should carry data-part */
for (const p of parts) {
  if (!p.html.trim()) continue;
  if (!/data-part=/.test(p.html)) console.warn(`⚠  ${p.d}/part.html has no data-part attribute`);
}

/* ------------------------------------------------------------ THREE (tree-shaken) */
async function threeBundle(allJs) {
  const names = new Set();
  for (const m of allJs.matchAll(/\bTHREE\.([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of allJs.matchAll(/\{([^{}]*)\}\s*=\s*(?:window\.|MU\.)?THREE\b/g)) {
    m[1].split(',').map(s => s.split(':')[0].trim()).filter(s => /^[A-Za-z_$][\w$]*$/.test(s)).forEach(n => names.add(n));
  }
  if (!names.size && !/\bTHREE\b/.test(allJs)) return '';
  const full = flag('full-three');
  const list = [...names].sort();
  const key = crypto.createHash('md5').update(full ? 'FULL' : list.join(',')).digest('hex').slice(0, 10);
  const cacheDir = r('vendor/.cache');
  fs.mkdirSync(cacheDir, { recursive: true });
  const out = path.join(cacheDir, `three-${key}.js`);
  if (fs.existsSync(out)) return read(out);
  let entry;
  if (full) {
    entry = read(r('vendor/three-entry.js'));
  } else {
    const core = list.filter(n => !THREE_ADDONS[n] && !THREE_NAMESPACES[n]);
    const lines = [`import { ${core.join(', ')} } from 'three';`];
    const exp = [...core];
    for (const n of list) {
      if (THREE_ADDONS[n]) { lines.push(`import { ${n} } from '${THREE_ADDONS[n]}';`); exp.push(n); }
      if (THREE_NAMESPACES[n]) { lines.push(`import * as ${n} from '${THREE_NAMESPACES[n]}';`); exp.push(n); }
    }
    lines.push(`window.THREE = { ${exp.join(', ')} };`);
    entry = lines.join('\n');
  }
  const res = await esbuild({
    stdin: { contents: entry, resolveDir: ROOT, sourcefile: 'three-entry.js' },
    bundle: true, minify: true, format: 'iife', write: false, legalComments: 'none', logLevel: 'silent'
  }).catch(e => { console.error('THREE bundle failed — unknown THREE.* name?\n', e.message); process.exit(1); });
  const code = res.outputFiles[0].text;
  fs.writeFileSync(out, code);
  return code;
}

/* ------------------------------------------------------------ assemble */
const esc = s => s.replace(/<\/script/gi, '<\\/script');
const allJs = parts.map(p => p.js.map(j => j.code).join('\n')).join('\n');

const vendorParts = GSAP_FILES.map(n => read(r(`node_modules/gsap/dist/${n}.min.js`)));
vendorParts.push(read(r('node_modules/lenis/dist/lenis.min.js')));
const three = await threeBundle(allJs);
if (three) vendorParts.push(three);
const vendor = vendorParts.map(esc).join('\n;\n');

const css = read(r('src/base/base.css')) + '\n' + parts.map(p => p.css).filter(Boolean).join('\n');
const html = parts.map(p => p.html ? `<!-- ===== ${p.d} ===== -->\n${p.html.trim()}` : '').filter(Boolean).join('\n\n');
const js = parts.flatMap(p => p.js).map(j =>
  `/* ===== ${j.name} ===== */\ntry {\n${j.code}\n} catch (e) { console.error('[MU] script ${j.name} failed:', e); }`).join('\n\n');

const fonts = fs.existsSync(r('vendor/fonts.css')) ? read(r('vendor/fonts.css')) : '';
const tpl = read(r('src/template.html'));
const outHtml = tpl
  .replace('/*@FONTS*/', () => fonts)
  .replace('/*@CSS*/', () => css)
  .replace('<!--@HTML-->', () => html)
  .replace('/*@VENDOR*/', () => vendor)
  .replace('/*@BOOT*/', () => esc(read(r('src/base/bootstrap.js'))))
  .replace('/*@JS*/', () => esc(js));

fs.mkdirSync(r('dist'), { recursive: true });
const outName = opt('out') || (only ? `preview-${dirs.map(d => d.replace(/^\d\d-/, '')).join('-')}.html` : 'index.html');
const outPath = path.isAbsolute(outName) ? outName : r('dist', outName);
fs.writeFileSync(outPath, outHtml);

const kb = s => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
console.log(`✔ built ${path.relative(ROOT, outPath)}  (${kb(outHtml)})`);
console.log(`  parts: ${dirs.join(', ')}`);
console.log(`  vendor ${kb(vendor)} (three ${three ? kb(three) : '—'}) · fonts ${kb(fonts)} · css ${kb(css)} · html ${kb(html)} · js ${kb(js)}`);
if (flag('release')) {
  fs.copyFileSync(outPath, r('index.html'));
  console.log('✔ released → index.html');
}
