// Bosh sahifadagi Telegram postlari snapshot’ini (JONLI-SAYT/API/telegram-news-bosh-sahifa.json) a-news.js ga aylantiradi.
// /api/telegram-news keshi eskirgan paytda sahifa shu ro‘yxatni ko‘rsatadi. Ishga tushirish: node src/parts/65-yangiliklar/gen-news.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../../../JONLI-SAYT/API/telegram-news-bosh-sahifa.json');
const d = JSON.parse(fs.readFileSync(src, 'utf8'));
/* sahifadagi bilan bir xil: unicode qalin harflar → oddiy (NFKC), barcha apostroflar → ’ */
const clean = t => (t || '').normalize('NFKC').replace(/[\u02BB\u02BC'\u2018`\u00B4]/g, '’');
const posts = d.posts.map(p => ({
  id: p.id,
  text: clean(p.text || p.title).replace(/…$/, '').trim(),
  photo: p.photo || null,
  date: p.date || null,
  link: p.link
}));
fs.writeFileSync(path.join(here, 'a-news.js'),
  `/* Telegram kanalidan bosh sahifa snapshot’i (${posts.length} post). gen-news.mjs yaratadi — qo‘lda tahrirlamang. */\nwindow.muNews = ${JSON.stringify({ posts })};\n`);
console.log('a-news.js:', posts.length, 'post');
