"use client";

import { scrollToMusicPlayer } from "@/lib/scroll-to-music";

export function ListenCta() {
  const scrollToPlayer = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToMusicPlayer();
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
