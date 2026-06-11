import Image from "next/image";
import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/lib/site";

const aboutLinkClass =
  "text-gold/90 underline-offset-2 transition hover:text-gold hover:underline";

function AboutParagraph({ text }: { text: string }) {
  if (!text.includes("April 28")) return text;

  const [before, after] = text.split("April 28");
  return (
    <>
      {before}
      <a
        href={site.april28FilmUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={aboutLinkClass}
      >
        April 28
      </a>
      {after}
    </>
  );
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative border-t border-white/5 bg-navy-mid py-28 md:py-36"
    >
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <ScrollReveal>
          <h2 className="text-center text-[22px] font-normal tracking-[0.4em] text-gold/80 uppercase">
            About
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid items-start gap-12 md:grid-cols-[minmax(220px,300px)_1fr] md:gap-16">
          <ScrollReveal>
            <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-sm border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:mx-0">
              <Image
                src={site.aboutPortrait}
                alt={site.aboutPortraitAlt}
                width={1920}
                height={1920}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 280px, 300px"
              />
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {site.about.map((paragraph, i) => (
              <ScrollReveal key={i} delayMs={i * 80}>
                <p className="text-base leading-7 text-white md:text-lg md:leading-8">
                  <AboutParagraph text={paragraph} />
                </p>
              </ScrollReveal>
            ))}

            <ScrollReveal delayMs={site.about.length * 80}>
              <a
                href={site.avidCertifiedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-opacity hover:opacity-90"
                aria-label={site.avidCertifiedBadgeAlt}
              >
                <Image
                  src={site.avidCertifiedBadge}
                  alt={site.avidCertifiedBadgeAlt}
                  width={1024}
                  height={1024}
                  className="h-auto w-[70px] md:w-[80px]"
                  sizes="80px"
                />
              </a>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
