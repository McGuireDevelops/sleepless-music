import { shareImageAbsoluteUrl, site, socialLinks } from "@/lib/site";

export function PersonJsonLd() {
  const sameAs = socialLinks.map((link) => link.href);

  const graph = [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.title,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.artistName,
      url: site.url,
      image: shareImageAbsoluteUrl,
      jobTitle: site.jobTitle,
      description: site.description,
      homeLocation: {
        "@type": "Place",
        name: site.location,
      },
      knowsAbout: [
        "Film scoring",
        "Game music",
        "Media composition",
        "Orchestration",
      ],
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
    {
      "@type": "MusicGroup",
      "@id": `${site.url}/#brand`,
      name: site.title,
      url: site.url,
      description: site.tagline,
      founder: { "@id": `${site.url}/#person` },
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
