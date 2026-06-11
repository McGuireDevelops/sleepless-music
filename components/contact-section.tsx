import { ScrollReveal } from "@/components/scroll-reveal";
import { SocialLinks } from "@/components/social-links";
import { site } from "@/lib/site";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative border-t border-white/5 bg-[#080f1a] py-28 md:py-36"
    >
      <div className="mx-auto max-w-2xl px-6 text-center md:px-10">
        <ScrollReveal>
          <h2 className="text-[22px] font-normal tracking-[0.4em] text-gold/80 uppercase">
            Contact
          </h2>
        </ScrollReveal>
        <ScrollReveal delayMs={120}>
          <p className="mt-8 text-sm leading-relaxed text-sand/65">
            For scoring enquiries, collaborations, and licensing, get in touch.
          </p>
        </ScrollReveal>
        <ScrollReveal delayMs={200}>
          <a
            href={`mailto:${site.contactEmail}`}
            className="mt-10 inline-block rounded-sm border border-gold/60 bg-gold/10 px-10 py-4 text-xs tracking-[0.25em] text-gold uppercase transition hover:border-gold hover:bg-gold/20"
          >
            {site.contactEmail}
          </a>
        </ScrollReveal>
        <ScrollReveal delayMs={280}>
          <SocialLinks className="mt-10 justify-center" />
        </ScrollReveal>
      </div>
    </section>
  );
}
