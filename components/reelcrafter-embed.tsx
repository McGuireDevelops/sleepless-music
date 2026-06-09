import { CassetteReelPlayer } from "@/components/cassette-reel-player";
import { ScrollReveal } from "@/components/scroll-reveal";

export function ReelCrafterEmbed() {
  return (
    <section
      id="music"
      className="music-section relative border-t border-dashed border-white/10 bg-navy-mid py-28 md:py-36"
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
          <div className="mt-12">
            <CassetteReelPlayer />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
