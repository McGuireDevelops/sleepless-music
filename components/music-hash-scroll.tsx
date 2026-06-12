"use client";

import { useEffect } from "react";
import { scrollToMusicPlayer } from "@/lib/scroll-to-music";

/** On load / hash change, align player controls to the bottom of the viewport. */
export function MusicHashScroll() {
  useEffect(() => {
    const run = () => {
      if (window.location.hash !== "#music") return;
      // Two frames so content-visibility sections report correct layout.
      requestAnimationFrame(() => {
        scrollToMusicPlayer("auto");
        requestAnimationFrame(() => scrollToMusicPlayer("auto"));
      });
    };

    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, []);

  return null;
}
