/**
 * Converts real school photos from the source folder into optimized WebP
 * files under public/photos/ using the naming contract from TOPSHIRIQ v3.0
 * (max 1920px wide, quality 82). Also picks the highest-resolution group
 * photo as hero.webp. Source files are never modified.
 *
 * Run: node scripts/optimize-photos.mjs
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = "D:/DIGITAL/SAYT UCHUN KERAKLI RASM VA VIDEO";
const OUT_DIR = path.resolve("public/photos");
const MAX_WIDTH = 1920;
const QUALITY = 82;

/** Ordered rules: first match wins. `seq` rules get -a/-b/-c suffixes. */
const RULES = [
  { test: (n) => n.includes("ASOS SOLGAN"), name: "founder" },
  { test: (n) => n.includes("RAHBAR"), name: "director" },
  { test: (n) => n.includes("BIRINCHI BINO"), name: "history-1994" },
  { test: (n) => n.includes("O'RDA") || n.includes("O’RDA"), name: "trip-orda" },
  {
    test: (n) => n.includes("2024-2-25") || n.includes("24-25"),
    name: "students-2425",
    seq: true,
  },
  {
    test: (n) => n.includes("2023") || n.includes("BITIRUVCHILAR"),
    name: "grads-2324",
    seq: true,
  },
  {
    test: (n) => n.includes("SAYOXAT") || n.includes("SAYOHAT"),
    name: "trip",
    seq: true,
  },
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = (await fs.readdir(SRC_DIR)).filter((f) =>
    /\.(jpe?g|png)$/i.test(f)
  );
  const counters = new Map();
  const results = [];

  for (const file of files.sort()) {
    const upper = file.toUpperCase();
    const rule = RULES.find((r) => r.test(upper));
    if (!rule) {
      console.log(`SKIP (qoida yo'q): ${file}`);
      continue;
    }
    let outName = `${rule.name}.webp`;
    if (rule.seq) {
      const i = counters.get(rule.name) ?? 0;
      counters.set(rule.name, i + 1);
      outName = `${rule.name}-${String.fromCharCode(97 + i)}.webp`;
    }
    const src = path.join(SRC_DIR, file);
    const meta = await sharp(src)
      .rotate() // respect EXIF orientation
      .resize(MAX_WIDTH, MAX_WIDTH, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(path.join(OUT_DIR, outName));
    results.push({ outName, file, width: meta.width, height: meta.height, size: meta.size });
    console.log(`${outName}  <-  ${file}  (${meta.width}x${meta.height}, ${Math.round(meta.size / 1024)}KB)`);
  }

  // Hero: highest-pixel-count wide group photo (students/grads pools).
  const groupPool = results.filter(
    (r) => r.outName.startsWith("students-") || r.outName.startsWith("grads-")
  );
  groupPool.sort((a, b) => b.width * b.height - a.width * a.height);
  if (groupPool.length > 0) {
    const best = groupPool[0];
    await fs.copyFile(
      path.join(OUT_DIR, best.outName),
      path.join(OUT_DIR, "hero.webp")
    );
    console.log(`hero.webp  <-  ${best.outName} (eng katta guruh fotosi)`);
  }

  console.log(`\nJami: ${results.length} rasm optimallashtirildi.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
