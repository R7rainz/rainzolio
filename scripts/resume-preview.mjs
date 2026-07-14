/**
 * Renders page 1 of the résumé PDF to a PNG that the site shows as a preview.
 *
 * Usage: pnpm resume:preview
 *
 * Why a committed image instead of rendering at build time: this needs poppler
 * (pdftoppm), which the deploy image doesn't have — a build-time step would
 * work locally and fail on Vercel. And why not embed the PDF directly: <object>
 * and <iframe> depend on a browser PDF plugin, which most mobile browsers don't
 * have, leaving an empty box. A PNG renders everywhere.
 *
 * The trade-off is that the preview is a snapshot: re-run this whenever you
 * replace public/hero/resume.pdf, or the page will show the old one.
 */
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PDF = path.resolve("public/hero/resume.pdf");
const OUT = path.resolve("public/hero/resume-preview.png");
const TMP = path.resolve("public/hero/.resume-tmp");

if (!existsSync(PDF)) {
  console.error(`No PDF at ${PDF}`);
  process.exit(1);
}

try {
  execFileSync("pdftoppm", ["-png", "-r", "150", "-f", "1", "-l", "1", PDF, TMP], {
    stdio: "pipe",
  });
} catch (err) {
  console.error(
    "pdftoppm failed — install poppler-utils (sudo dnf install poppler-utils).\n",
    err.message,
  );
  process.exit(1);
}

const rendered = `${TMP}-1.png`;
if (!existsSync(rendered)) {
  console.error("pdftoppm produced no output");
  process.exit(1);
}

const meta = await sharp(rendered).metadata();
await sharp(rendered)
  // 1400px wide is plenty for a full-width preview on a 2x display.
  .resize({ width: 1400, withoutEnlargement: true })
  .png({ quality: 90, compressionLevel: 9 })
  .toFile(OUT);

rmSync(rendered, { force: true });

const out = await sharp(OUT).metadata();
console.log(`Rendered ${meta.width}x${meta.height} → ${out.width}x${out.height}  ${OUT}`);
