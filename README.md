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

### Music (TV/VCR player)

The Music section is a retro CRT TV + VCR that plays self-hosted audio so the
on-screen controls actually work.

1. Drop track files into [`public/audio/`](public/audio/) (MP3/WAV).
2. List them in order in the `tracks` array in `lib/site.ts`, each with a
   `title` and a `src` path (e.g. `/audio/track-01.mp3`).

Until audio files exist the TV shows a "NO SIGNAL" state.

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
