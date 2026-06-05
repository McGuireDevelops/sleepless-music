import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/lib/site";

export function WorkSection() {
  return (
    <section
      id="work"
      className="relative border-t border-white/5 bg-[#080f1a] py-28 md:py-36"
    >
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <ScrollReveal>
          <h2 className="text-center text-[22px] font-normal tracking-[0.4em] text-gold/80 uppercase">
            Work
          </h2>
        </ScrollReveal>

        <ul className="mt-14 space-y-12">
          {site.work.map((item, i) => (
            <ScrollReveal key={item.title} delayMs={i * 100}>
              <li className="border-b border-white/5 pb-12 last:border-0 last:pb-0">
                <div className="flex flex-col items-center text-center">
                  {"year" in item && item.year && (
                    <p className="text-[0.65rem] tracking-[0.35em] text-sand/40 uppercase">
                      {item.year}
                    </p>
                  )}
                  <h3 className="mt-2 font-display text-2xl text-gold md:text-3xl">
                    {"href" in item && item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-[#f5e6b8]"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p className="mt-2 text-[0.65rem] tracking-[0.3em] text-sand/45 uppercase">
                    {item.role}
                  </p>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-sand/65">
                    {item.description}
                  </p>
                </div>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
