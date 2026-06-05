/**
 * Dev-only image generator (npm run generate:images).
 * Creates cinematic hero and OG share images.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";

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
  {
    name: "Cormorant Garamond",
    data: fontData,
    weight: 400,
    style: "normal",
  },
];

async function renderToPng(tree, width, height) {
  const svg = await satori(tree, { width, height, fonts });
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function generateHero() {
  const width = 1920;
  const height = 1080;

  const tree = {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        background:
          "linear-gradient(160deg, #0d1528 0%, #080f1a 45%, #060b14 100%)",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "18%",
              left: "50%",
              width: 480,
              height: 480,
              marginLeft: -240,
              borderRadius: "50%",
              background: "rgba(74, 111, 165, 0.18)",
              filter: "blur(80px)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "8%",
              right: "12%",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "rgba(212, 168, 83, 0.08)",
              filter: "blur(60px)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(8,15,26,0.95) 0%, transparent 55%)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingBottom: 120,
              width: "100%",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    color: "rgba(212, 168, 83, 0.85)",
                    fontSize: 18,
                    letterSpacing: "0.45em",
                    textTransform: "uppercase",
                    marginBottom: 24,
                    fontFamily: "Cormorant Garamond",
                    fontWeight: 400,
                  },
                  children: "Sleepless Music",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 96,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    background:
                      "linear-gradient(180deg, #f5e6b8 0%, #d4a853 55%, #c9782e 100%)",
                    backgroundClip: "text",
                    color: "transparent",
                    fontFamily: "Cormorant Garamond",
                    fontWeight: 600,
                  },
                  children: "Robert McGuire",
                },
              },
            ],
          },
        },
      ],
    },
  };

  const buffer = await renderToPng(tree, width, height);
  writeFileSync(join(root, "public/hero.png"), buffer);
  console.log(`Wrote public/hero.png (${width}x${height})`);
}

async function generateOgShare() {
  const width = 1200;
  const height = 630;

  const tree = {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#080f1a",
        position: "relative",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "20%",
              left: "50%",
              width: 400,
              height: 400,
              marginLeft: -200,
              borderRadius: "50%",
              background: "rgba(74, 111, 165, 0.15)",
              filter: "blur(70px)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              color: "rgba(212, 168, 83, 0.85)",
              fontSize: 16,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              marginBottom: 20,
              fontFamily: "Cormorant Garamond",
              fontWeight: 400,
            },
            children: "Sleepless Music",
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: 72,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#d4a853",
              fontFamily: "Cormorant Garamond",
              fontWeight: 600,
            },
            children: "Robert McGuire",
          },
        },
        {
          type: "div",
          props: {
            style: {
              marginTop: 20,
              fontSize: 20,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(232, 220, 200, 0.65)",
              fontFamily: "Cormorant Garamond",
              fontWeight: 400,
            },
            children: "Composer for contemporary media",
          },
        },
      ],
    },
  };

  const buffer = await renderToPng(tree, width, height);
  writeFileSync(join(root, "public/og-share.png"), buffer);
  console.log(`Wrote public/og-share.png (${width}x${height})`);
}

await generateHero();
await generateOgShare();
