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
  /** ReelCrafter iframe src — paste from ReelCrafter dashboard → Embed → Copy Code */
  reelcrafterEmbedSrc: "" as string,
  reelcrafterEmbedTitle: "Robert McGuire — Music Reel",
  socialImage: "/og-share.png",
  socialImageWidth: 1200,
  socialImageHeight: 630,
  heroImage: "/hero.png",
  heroImageAlt: "Atmospheric studio light — Robert McGuire, composer",
  social: {
    linkedin: "",
    instagram: "",
    spotify: "",
  },
  about: [
    "Robert McGuire is an emerging composer based in Dublin, Ireland, working across film, games, and contemporary media. His background in audio began with an Advanced Diploma in Sound Engineering and Music Production from Pulse College in 2008, laying the foundation for a career shaped by both technical expertise and creative exploration.",
    "Since then, Robert has built extensive experience in audio technology, composition, and music production, refining his craft through a combination of formal training and hands-on professional work. He is also an Avid Certified Pro Tools Specialist, bringing a high level of technical precision to his projects.",
    "In November 2025, he completed the Graduate Diploma in Film and Game Scoring with the Film Scoring Academy of Europe, where he further developed his voice as a composer, with a focus on orchestration and narrative-driven music.",
    "Robert is currently undertaking a part-time MA in Professional Media Composition with ThinkSpace Education, while composing the score for the upcoming short film April 28.",
  ],
  work: [
    {
      title: "April 28",
      role: "Original Music",
      year: "2026",
      description: "Short film — drama inspired by true events.",
      href: "https://www.april28film.com",
    },
    {
      title: "Film & Game Scoring",
      role: "Composer",
      year: "2025",
      description: "Graduate work with the Film Scoring Academy of Europe.",
    },
    {
      title: "Contemporary Media",
      role: "Composer & Producer",
      description: "Scores and production for film, games, and media projects.",
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
  { label: "Spotify", href: site.social.spotify, icon: "spotify" as const },
].filter((link) => link.href.length > 0);

export const socialLinks = socialEntries;

export const navLinks = [
  { href: "#music", label: "Music" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
] as const;
