import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/lib/site";

export function ReelCrafterEmbed() {
  const hasEmbed = site.reelcrafterEmbedSrc.length > 0;

  return (
    <section
      id="music"
      className="relative border-t border-white/5 bg-navy-mid py-28 md:py-36"
    >
      <div className="mx-auto max-w-4xl px-6 md:px-10">
        <ScrollReveal>
          <h2 className="text-center text-[22px] font-normal tracking-[0.4em] text-gold/80 uppercase">
            Music
          </h2>
        </ScrollReveal>
        <ScrollReveal delayMs={120}>
          <p className="mt-6 text-center text-sm leading-relaxed text-sand/60">
            Selected works — film, games, and contemporary media.
          </p>
        </ScrollReveal>

        <ScrollReveal delayMs={200}>
          <div className="mt-12 overflow-hidden rounded-sm border border-white/10 bg-[#060b14]/80 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            {hasEmbed ? (
              <iframe
                src={site.reelcrafterEmbedSrc}
                title={site.reelcrafterEmbedTitle}
                width="100%"
                height={400}
                className="block h-[400px] w-full border-0"
                allow="autoplay; encrypted-media"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-[16/10] flex-col items-center justify-center gap-4 px-8 text-center md:aspect-[16/9]">
                <p className="font-display text-xl text-gold/80">
                  Reel coming soon
                </p>
                <p className="max-w-md text-sm leading-relaxed text-sand/50">
                  Add your ReelCrafter embed URL to{" "}
                  <code className="text-gold/70">lib/site.ts</code> — ReelCrafter
                  dashboard → Embed → Copy Code → paste the iframe{" "}
                  <code className="text-gold/70">src</code>.
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
