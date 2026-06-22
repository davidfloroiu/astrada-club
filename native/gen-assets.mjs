// Generates the source images for @capacitor/assets from the Astrada brand mark.
// Re-run after a brand change:  node native/gen-assets.mjs  &&  npx capacitor-assets generate
//
// Outputs into ../assets (the default capacitor-assets source dir):
//   icon-only.png       1024  platinum mark on navy (full-bleed iOS/marketing icon)
//   icon-foreground.png 1024  platinum mark on transparent (Android adaptive fg)
//   icon-background.png 1024  solid navy (Android adaptive bg)
//   splash.png          2732  navy mark on cream  (light splash)
//   splash-dark.png     2732  platinum mark on navy (dark splash)
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");

const NAVY = "#0E1B30";
const NAVY_MARK = "#14213d";
const CREAM = "#edebe5";

// Astrada mark — viewBox 112×118, content centered at x≈56, y≈[3,106] (h≈103).
const PATHS = `
  <path d="M56 3 Q57.6 15.5 63.2 20 Q57.6 24.5 56 35 Q54.4 24.5 48.8 20 Q54.4 15.5 56 3 Z"/>
  <path d="M56 38 L58.7 62 L53.3 62 Z"/>
  <path d="M56 57 C51 75 47 90 43 103 C41.8 106.4 38.6 106.6 38.2 103.2 C40 91.5 46 74 56 57 Z"/>
  <path d="M56 57 C61 75 65 90 69 103 C70.2 106.4 73.4 106.6 73.8 103.2 C72 91.5 66 74 56 57 Z"/>`;
const MARK_H = 103; // user-unit height of the mark
const MARK_CX = 56;
const MARK_CY = 54.5;

const PLATINUM = `
  <linearGradient id="plat" x1="0" y1="0" x2="0.25" y2="1">
    <stop offset="0%" stop-color="#F3F5F8"/>
    <stop offset="42%" stop-color="#AEB5C0"/>
    <stop offset="72%" stop-color="#E4E8ED"/>
    <stop offset="100%" stop-color="#9AA1AD"/>
  </linearGradient>`;

/** Build an SVG of `size`px with the mark scaled to `markPx` tall, centered. */
function svg({ size, markPx, fill, bg }) {
  const s = markPx / MARK_H;
  const tx = size / 2 - MARK_CX * s;
  const ty = size / 2 - MARK_CY * s;
  const usePlat = fill === "platinum";
  const fillAttr = usePlat ? "url(#plat)" : fill;
  const bgRect = bg === "transparent" ? "" : `<rect width="${size}" height="${size}" fill="${bg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${usePlat ? PLATINUM : ""}</defs>
  ${bgRect}
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})" fill="${fillAttr}">${PATHS}</g>
</svg>`;
}

async function render(name, spec) {
  await sharp(Buffer.from(svg(spec)))
    .png()
    .toFile(join(OUT, name));
  console.log("✓", name, `${spec.size}px`);
}

await mkdir(OUT, { recursive: true });
await render("icon-only.png", { size: 1024, markPx: 580, fill: "platinum", bg: NAVY });
await render("icon-foreground.png", { size: 1024, markPx: 430, fill: "platinum", bg: "transparent" });
await render("icon-background.png", { size: 1024, markPx: 0, fill: NAVY, bg: NAVY });
await render("splash.png", { size: 2732, markPx: 480, fill: NAVY_MARK, bg: CREAM });
await render("splash-dark.png", { size: 2732, markPx: 480, fill: "platinum", bg: NAVY });
console.log("Done →", OUT);
