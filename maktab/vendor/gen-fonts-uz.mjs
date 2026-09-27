// Yangi alifbo harflari (Ğ ğ Ş ş) uchun shriftlarning latin-ext qismidan kichik subset yasaydi va
// vendor/fonts.css oxiriga «@font-face (uz)» bloklarini qo‘shadi (Ö ö Ç ç latin qismida allaqachon bor).
// Ishlatish: node vendor/gen-fonts-uz.mjs <node_modules papkasi>
//   (u yerda @fontsource-variable/unbounded, @fontsource-variable/manrope, @fontsource/jetbrains-mono, subset-font bo‘lsin)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const nm = path.resolve(process.argv[2] || 'node_modules');
const require = createRequire(path.join(nm, 'x.js'));
const subsetFont = require('subset-font');
const CHARS = 'ĞğŞş';
const RANGE = 'U+011E-011F, U+015E-015F';
const FACES = [
  ['Unbounded', 'normal', '300 900', '@fontsource-variable/unbounded/files/unbounded-latin-ext-wght-normal.woff2'],
  ['Manrope', 'normal', '300 800', '@fontsource-variable/manrope/files/manrope-latin-ext-wght-normal.woff2'],
  ['JetBrains Mono', 'normal', '400', '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-ext-400-normal.woff2'],
  ['JetBrains Mono', 'normal', '600', '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-ext-600-normal.woff2']
];
const cssPath = path.join(here, 'fonts.css');
let css = fs.readFileSync(cssPath, 'utf8').replace(/\n\/\* uz-alifbo:start \*\/[\s\S]*\/\* uz-alifbo:end \*\/\n?/, '');
let out = '\n/* uz-alifbo:start — Ğ ğ Ş ş (yangi o‘zbek alifbosi) */\n';
for (const [fam, style, weight, file] of FACES) {
  const buf = fs.readFileSync(path.join(nm, file));
  const sub = await subsetFont(buf, CHARS, { targetFormat: 'woff2', variationAxes: undefined });
  out += `@font-face {\n  font-family: '${fam}';\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url(data:font/woff2;base64,${sub.toString('base64')}) format('woff2');\n  unicode-range: ${RANGE};\n}\n`;
  console.log(fam, weight, buf.length, '→', sub.length, 'bayt');
}
out += '/* uz-alifbo:end */\n';
fs.writeFileSync(cssPath, css + out);
