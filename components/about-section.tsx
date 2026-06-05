import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/lib/site";

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative border-t border-white/5 bg-navy-mid py-28 md:py-36"
    >
      <div className="mx-auto max-w-2xl px-6 md:px-10">
        <ScrollReveal>
          <h2 className="text-center text-[22px] font-normal tracking-[0.4em] text-gold/80 uppercase">
            About
          </h2>
        </ScrollReveal>

        <div className="mt-12 space-y-6">
          {site.about.map((paragraph, i) => (
            <ScrollReveal key={i} delayMs={i * 80}>
              <p className="text-sm leading-7 text-sand/75 md:text-base md:leading-8">
                {paragraph}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
