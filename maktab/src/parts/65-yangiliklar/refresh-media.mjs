// Refresh only image URLs for posts already present in the approved snapshot.
// Run manually, then gen-news.mjs and build.mjs --release. Never called by the page.
import fs from 'node:fs';
const file = new URL('../../../JONLI-SAYT/API/telegram-news-bosh-sahifa.json', import.meta.url);
let raw = fs.readFileSync(file, 'utf8');
const snapshot = JSON.parse(raw);
for (const post of snapshot.posts.filter(p => p.photo)) {
  if (!/^ulugbek_rm\/\d+$/.test(post.id)) throw new Error('Unexpected post id');
  const response = await fetch('https://t.me/s/' + post.id, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Telegram HTTP ' + response.status);
  const html = await response.text();
  const id = post.id.split('/')[1];
  const block = html.split('data-post="ulugbek_rm/').find(s => s.startsWith(id + '"')) || '';
  const photo = block.match(/background-image:url\('([^']+)'\)/)?.[1]?.replaceAll('&amp;', '&');
  if (!photo) throw new Error('No preview image for ' + post.id);
  const u = new URL(photo);
  if (u.protocol !== 'https:' || !['telesco.pe', 'cdn-telegram.org'].some(h => u.hostname === h || u.hostname.endsWith('.' + h))) throw new Error('Unexpected image host');
  raw = raw.replace(post.photo, photo);
  console.log('Image URL refreshed: ' + post.id);
}
// All lookups must succeed before the snapshot is written; text/date/link are untouched.
fs.writeFileSync(file, raw);
