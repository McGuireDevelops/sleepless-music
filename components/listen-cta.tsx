"use client";

export function ListenCta() {
  const scrollToPlayer = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const controls = document.getElementById("player-controls");
    const fallback = document.getElementById("music");
    const target = controls ?? fallback;
    if (!target) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "end",
    });

    history.replaceState(null, "", "#music");
  };

  return (
    <a
      href="#music"
      onClick={scrollToPlayer}
      className="rounded-sm border border-gold/60 bg-gold/10 px-8 py-3 text-xs tracking-[0.25em] text-gold uppercase transition hover:border-gold hover:bg-gold/20"
    >
      Listen
    </a>
  );
}
