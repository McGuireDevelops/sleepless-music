export function isMusicHref(href: string): boolean {
  return href === "#music" || href === "/#music" || href.endsWith("#music");
}

export function scrollToMusicPlayer(behavior?: ScrollBehavior): void {
  const controls = document.getElementById("player-controls");
  const fallback = document.getElementById("music");
  const target = controls ?? fallback;
  if (!target) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = behavior ?? (reduced ? "auto" : "smooth");
  const marginBottom =
    Number.parseFloat(getComputedStyle(target).scrollMarginBottom) || 0;
  const rect = target.getBoundingClientRect();
  const top = window.scrollY + rect.bottom - window.innerHeight + marginBottom;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: scrollBehavior,
  });
}
