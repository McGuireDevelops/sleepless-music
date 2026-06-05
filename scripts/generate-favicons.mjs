/**
 * Dev-only favicon generator (npm run generate:favicons).
 * Not run on Vercel production build — commit outputs under public/ and app/.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { pngToIco } from "./png-to-ico.mjs";

const root = process.cwd();
const fontData = readFileSync(
  join(root, "public/fonts/cormorant-garamond-600.ttf"),
);

const fonts = [
  {
    name: "Cormorant Garamond",
    data: fontData,
    weight: 600,
    style: "normal",
  },
];

function iconSatoriTree(size) {
  const fontSize =
    (size <= 32 ? Math.round(size * 0.55) : Math.round(size * 0.42)) + 2;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080f1a",
        color: "#d4a853",
        fontSize,
        fontFamily: "Cormorant Garamond",
        fontWeight: 600,
        letterSpacing: "0.08em",
        lineHeight: 1,
      },
      children: "SM",
    },
  };
}

async function renderPng(size) {
  const svg = await satori(iconSatoriTree(size), {
    width: size,
    height: size,
    fonts,
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}

const outputs = [
  { file: "favicon-16.png", size: 16 },
  { file: "favicon-32.png", size: 32 },
  { file: "favicon-48.png", size: 48 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
];

const pngBuffers = {};

for (const { file, size } of outputs) {
  const buffer = await renderPng(size);
  pngBuffers[file] = buffer;
  writeFileSync(join(root, "public", file), buffer);
  console.log(`Wrote public/${file} (${size}x${size})`);
}

const ico = pngToIco(pngBuffers["favicon-32.png"], 32, 32);
writeFileSync(join(root, "public/favicon.ico"), ico);
writeFileSync(join(root, "app/favicon.ico"), ico);
console.log("Wrote public/favicon.ico and app/favicon.ico");
