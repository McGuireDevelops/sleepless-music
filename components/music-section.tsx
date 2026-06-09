import { ScrollReveal } from "@/components/scroll-reveal";
import { TvPlayer } from "@/components/tv-player";
import { site } from "@/lib/site";

export function MusicSection() {
  return (
    <section id="music" className="relative bg-navy-mid py-28 md:py-36">
      <div className="mx-auto max-w-4xl px-6 md:px-10">
        <ScrollReveal>
          <h2 className="text-center text-[22px] font-normal tracking-[0.4em] text-gold/80 uppercase">
            {site.musicHeading}
          </h2>
        </ScrollReveal>
        <ScrollReveal delayMs={120}>
          <p className="mt-6 text-center text-sm leading-relaxed text-sand/60">
            {site.musicIntro}
          </p>
        </ScrollReveal>

        <ScrollReveal delayMs={200}>
          <div className="mt-12">
            <TvPlayer />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
