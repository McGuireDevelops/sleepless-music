const DOMAIN = "https://www.sleeplessmusic.com";

/** Primary site configuration — edit copy and URLs here. */
export const site = {
  url: DOMAIN,
  title: "Sleepless Music",
  pageTitle: "Robert McGuire — Sleepless Music",
  artistName: "Robert McGuire",
  tagline: "Composer for contemporary media",
  brandLine: "Sleepless Music",
  description:
    "Robert McGuire is a Dublin-based composer for film, games, and contemporary media. Listen to selected works and explore credits including the short film April 28.",
  location: "Dublin, Ireland",
  jobTitle: "Composer",
  contactEmail: "info@sleeplessmusic.com",
  /** Full ReelCrafter reel — linked as a fallback / "view full reel". */
  reelcrafterReelUrl:
    "https://play.reelcrafter.com/embed/2e657888-ebf7-41c8-864c-580e813b4f38",
  musicHeading: "Music",
  musicIntro: "Selected works — film, games, and contemporary media.",
  /** Photoreal CRT scene used as the music player backdrop. */
  tvScene: "/images/tv-scene-v3.png",
  /**
   * Live-screen overlay rectangle as percentages of the scene image,
   * tuned to sit exactly over the CRT tube. Adjust if the art changes.
   */
  tvScreenRect: { top: 27, left: 29, width: 39.2, height: 46.5 },
  /**
   * Demo reel tracks for the native TV/VCR player.
   * Drop audio files into `public/audio/` and update the `src` paths.
   */
  tracks: [
    { title: "Cue One", src: "/audio/track-01.mp3" },
    { title: "Cue Two", src: "/audio/track-02.mp3" },
    { title: "Cue Three", src: "/audio/track-03.mp3" },
  ],
  socialImage: "/og-share.png",
  socialImageWidth: 1200,
  socialImageHeight: 630,
  heroImage: "/images/hero.webp",
  heroImageAlt:
    "Robert McGuire — composer for film, TV, and video games. Photography by Michael Robert Williams.",
  aboutPortrait: "/images/about-portrait.webp",
  aboutPortraitAlt: "Robert McGuire — composer portrait",
  logoImage: "/images/logo-white.png",
  logoAlt: "McGuire — Sleepless Music",
  avidCertifiedBadge: "/images/avid-certified-pro-tools-specialist.png",
  avidCertifiedBadgeAlt: "Avid Certified Pro Tools Specialist",
  avidCertifiedUrl:
    "https://www.credly.com/badges/1bf6ba9a-481c-4aca-9442-63466e4cb5b7/public_url",
  social: {
    linkedin: "",
    instagram: "https://www.instagram.com/mcguireofficial/",
    facebook: "https://www.facebook.com/McGuireOfficial/",
    spotify: "",
  },
  about: [
    "Robert McGuire is an emerging composer based in Dublin, Ireland, working across film, games, and contemporary media. Robert has an innate dramatic sensibility and is an exquisite storyteller with music appealing to modern audiences.",
    "His background in audio began with an Advanced Diploma in Sound Engineering and Music Production from Pulse College in 2008, laying the foundation for a career shaped by both technical expertise and creative exploration. Since then, Robert has built extensive experience in composition, and music production, refining his craft through a combination of formal training and hands-on professional work.",
    "In November 2025, he graduated from the Film Scoring Academy of Europe, where he further developed his voice as a composer, with a focus on orchestration and narrative-driven music. Robert is currently undertaking MA in Professional Media Composition with ThinkSpace Education, while composing the score for the upcoming short film \"April 28.\"",
  ],
  work: [
    {
      title: "April 28",
      role: "Original Music",
      year: "2026",
      description: "Short film — drama inspired by true events.",
      href: "https://www.april28film.com",
    },
  ],
} as const;

export function siteUrlFromHost(host: string | null | undefined): string {
  const hostname = (host ?? "").toLowerCase().split(":")[0];
  if (hostname.includes("sleeplessmusic.com")) {
    return DOMAIN;
  }
  return DOMAIN;
}

export const shareImageAbsoluteUrl = `${site.url}${site.socialImage}`;

const socialEntries = [
  { label: "LinkedIn", href: site.social.linkedin, icon: "linkedin" as const },
  { label: "Instagram", href: site.social.instagram, icon: "instagram" as const },
  { label: "Facebook", href: site.social.facebook, icon: "facebook" as const },
  { label: "Spotify", href: site.social.spotify, icon: "spotify" as const },
].filter((link) => link.href.length > 0);

export const socialLinks = socialEntries;

export const navLinks = [
  { href: "/#music", label: "Music" },
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
] as const;
