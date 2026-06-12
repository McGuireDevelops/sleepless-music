"use client";

import type { MouseEvent, ReactNode } from "react";
import { isMusicHref, scrollToMusicPlayer } from "@/lib/scroll-to-music";

type NavLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export function NavLink({ href, className, children, onClick }: NavLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!isMusicHref(href)) return;

    e.preventDefault();
    scrollToMusicPlayer();
    history.replaceState(null, "", href.startsWith("/") ? "/#music" : "#music");
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
