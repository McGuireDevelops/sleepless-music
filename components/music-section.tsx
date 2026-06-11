import { ScrollReveal } from "@/components/scroll-reveal";
import { TvPlayer } from "@/components/tv-player";
import { site } from "@/lib/site";

export function MusicSection() {
  return (
    <section id="music" className="relative bg-[#080f1a] py-28 md:py-36">
      <div className="mx-auto max-w-4xl px-6 md:px-10">
        <ScrollReveal>
          <h2 className="text-center text-[22px] font-normal tracking-[0.4em] text-gold/80 uppercase">
            {site.musicHeading}
          </h2>
        </ScrollReveal>
        <ScrollReveal delayMs={120}>
          <p className="mt-6 text-center text-base leading-7 text-white md:text-lg md:leading-8">
            {site.musicIntro}
          </p>
        </ScrollReveal>
      </div>

      <div className="mx-auto mt-12 w-full max-w-[96rem] px-4 md:px-6">
        <ScrollReveal delayMs={200}>
          <TvPlayer />
        </ScrollReveal>
      </div>
    </section>
  );
}
