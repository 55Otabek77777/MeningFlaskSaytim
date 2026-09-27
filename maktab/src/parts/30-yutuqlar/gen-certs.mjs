// Sertifikatlar snapshot’ini (JONLI-SAYT/API/sertifikatlar.json) a-certs.js ga aylantiradi.
// Ishga tushirish: node src/parts/30-yutuqlar/gen-certs.mjs  (build .mjs fayllarni qo‘shmaydi)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../../../JONLI-SAYT/API/sertifikatlar.json');
const BASE = 'https://storage.googleapis.com/ulugbek-perfect-edu-7b4fa-certs/certificates/';
const list = JSON.parse(fs.readFileSync(src, 'utf8'))
  .filter(c => c.imageUrl && c.imageUrl.startsWith(BASE))
  .map(c => [c.name, c.subject, c.grade, c.imageUrl.slice(BASE.length), c.width || 1420, c.height || 2000]);
const out = `/* Jonli saytdagi sertifikatlar ro‘yxati (snapshot, ${list.length} ta). gen-certs.mjs yaratadi — qo‘lda tahrirlamang. */\n`
  + `window.muCerts = { base: '${BASE}', list: ${JSON.stringify(list)} };\n`;
fs.writeFileSync(path.join(here, 'a-certs.js'), out);
console.log('a-certs.js:', list.length, 'ta sertifikat');
