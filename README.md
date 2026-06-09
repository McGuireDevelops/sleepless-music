# Sleepless Music

Cinematic composer website for Robert McGuire, built with Next.js and deployed on Vercel.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content

Edit copy, credits, and URLs in [`lib/site.ts`](lib/site.ts).

### ReelCrafter embed

1. Open your reel in ReelCrafter → Embed → Create → Copy Code
2. Paste the iframe `src` URL into `reelcrafterEmbedSrc` in `lib/site.ts`

### Social links

Add URLs to `site.social` in `lib/site.ts` (LinkedIn, Instagram, Spotify).

## Assets

Regenerate hero, OG share image, and favicons:

```bash
npm run generate:assets
```

Commit the outputs under `public/` and `app/favicon.ico`.

## Deploy

Standalone Vercel project: **`sleepless-music`** (personal account — not ShopWear).

```bash
npx vercel          # preview
npx vercel --prod   # production
```

Production: [sleeplessmusic.com](https://www.sleeplessmusic.com)

## DNS (Cloudflare)

Domains are on the personal Vercel account. Point Cloudflare at Vercel:

- `A` `sleeplessmusic.com` → `76.76.21.21`
- `A` or `CNAME` `www` → `76.76.21.21` or `cname.vercel-dns.com`

`vercel.json` redirects apex → `www` and old WordPress paths → page anchors.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Vercel Analytics + Speed Insights
