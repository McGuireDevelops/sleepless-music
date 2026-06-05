import Image from "next/image";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section
      id="top"
      className="hero-section relative min-h-[100svh] overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src={site.heroImage}
          alt={site.heroImageAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080f1a]/80 via-[#0d1528]/40 to-[#080f1a]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080f1a] via-transparent to-[#080f1a]/60" />
        <div
          className="pointer-events-none absolute top-[22%] left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#4a6fa5]/15 blur-3xl"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto min-h-[100svh] w-full max-w-6xl px-6 md:px-10">
        <div className="hero-copy absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 md:px-10">
          <p className="mb-4 text-center text-[0.65rem] tracking-[0.45em] text-gold/90 uppercase md:mb-4 md:text-xs">
            {site.brandLine}
          </p>
          <h1 className="hero-title font-display text-center text-[clamp(2rem,min(12vw,10svh),7rem)] leading-[0.95] font-normal tracking-[0.08em] uppercase text-transparent bg-gradient-to-b from-[#f5e6b8] via-gold to-[#c9782e] bg-clip-text">
            {site.artistName}
          </h1>
          <p className="mt-6 text-center font-display text-sm tracking-[0.12em] text-sand/90 uppercase md:mt-6 md:text-base">
            {site.tagline}
          </p>
          <p className="mt-[15px] text-center text-xs tracking-[0.25em] text-sand/50 uppercase md:text-sm">
            {site.location}
          </p>
        </div>

        <div className="hero-cta absolute inset-x-0 bottom-24 flex justify-center md:bottom-[116px]">
          <a
            href="#music"
            className="rounded-sm border border-gold/60 bg-gold/10 px-8 py-3 text-xs tracking-[0.25em] text-gold uppercase transition hover:border-gold hover:bg-gold/20"
          >
            Listen
          </a>
        </div>
      </div>

      <div
        className="hero-scroll absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-sand/40"
        aria-hidden
      >
        <span className="text-[0.6rem] tracking-[0.3em] uppercase">Scroll</span>
        <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-gold/60 to-transparent" />
      </div>
    </section>
  );
}
