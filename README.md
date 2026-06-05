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

## Deploy (Vercel)

This is a **separate** Vercel project from `april-28-film`.

```bash
vercel link    # create new project: sleepless-music
vercel deploy  # preview
vercel --prod  # production
```

## Domain cutover (sleeplessmusic.com)

When ready to replace WordPress:

1. Deploy and verify on a Vercel preview URL
2. In Vercel → Project → Domains, add `sleeplessmusic.com` and `www.sleeplessmusic.com`
3. Update DNS at your registrar (Vercel will show A/CNAME records)
4. `vercel.json` already redirects apex → `www` and old WP paths → anchors
5. Keep WordPress live until DNS propagates, then cancel WP hosting

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Vercel Analytics + Speed Insights
