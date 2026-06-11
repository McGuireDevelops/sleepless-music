import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { PersonJsonLd } from "@/components/person-json-ld";
import { shareImageAbsoluteUrl, site } from "@/lib/site";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080f1a",
};

export async function generateMetadata(): Promise<Metadata> {
  const shareImageUrl = shareImageAbsoluteUrl;

  return {
    metadataBase: new URL(site.url),
    title: site.pageTitle,
    description: site.description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: site.url,
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      locale: "en_IE",
      url: site.url,
      title: site.pageTitle,
      description: site.description,
      siteName: site.title,
      images: [
        {
          url: shareImageUrl,
          secureUrl: shareImageUrl,
          width: site.socialImageWidth,
          height: site.socialImageHeight,
          type: "image/png",
          alt: `${site.artistName}, ${site.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: site.pageTitle,
      description: site.description,
      images: [shareImageUrl],
    },
    other: {
      "og:image": shareImageUrl,
      "og:image:secure_url": shareImageUrl,
      "og:image:width": String(site.socialImageWidth),
      "og:image:height": String(site.socialImageHeight),
      "og:image:type": "image/png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32.png"
        />
        <link
          rel="mask-icon"
          href="/safari-pinned-tab.svg"
          color="#f4f0e8"
        />
      </head>
      <body className="min-h-screen antialiased">
        <PersonJsonLd />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
