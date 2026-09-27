/**
 * Generates neutral gray placeholder photos into public/photos/.
 * Real photos will later replace these files keeping the same names,
 * so no code change is needed when they arrive.
 *
 * Run: node scripts/generate-placeholders.mjs
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve("public/photos");

const FILES = [
  { name: "hero.jpg", width: 1600, height: 1000, label: "Maktab foto" },
  ...Array.from({ length: 8 }, (_, i) => ({
    name: `g${i + 1}.jpg`,
    width: 800,
    height: 600,
    label: `Lavha ${i + 1}`,
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    name: `team-${i + 1}.jpg`,
    width: 600,
    height: 800,
    label: "Foto",
  })),
];

function placeholderSvg(width, height, label) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#e2e8f0"/>
  <rect x="${width / 2 - 40}" y="${height / 2 - 52}" width="80" height="80" rx="16" fill="#cbd5e1"/>
  <circle cx="${width / 2}" cy="${height / 2 - 24}" r="14" fill="#94a3b8"/>
  <path d="M ${width / 2 - 26} ${height / 2 + 16} q 26 -30 52 0 z" fill="#94a3b8"/>
  <text x="50%" y="${height / 2 + 64}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#64748b">${label}</text>
</svg>`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const f of FILES) {
    await sharp(Buffer.from(placeholderSvg(f.width, f.height, f.label)))
      .jpeg({ quality: 80 })
      .toFile(path.join(OUT_DIR, f.name));
  }
  console.log(`Generated ${FILES.length} placeholders -> ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
