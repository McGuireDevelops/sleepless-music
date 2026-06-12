"use client";

import { NavLink } from "@/components/nav-link";

type Link = { href: string; label: string };

function closeMobileMenu() {
  const toggle = document.getElementById(
    "nav-menu-toggle",
  ) as HTMLInputElement | null;
  if (toggle) toggle.checked = false;
}

export function MobileNavLinks({ links }: { links: readonly Link[] }) {
  return (
    <ul className="flex flex-col items-center gap-8 text-sm tracking-[0.25em] text-sand/90 uppercase">
      {links.map((link) => (
        <li key={link.href}>
          <NavLink
            href={link.href}
            onClick={closeMobileMenu}
            className="block py-1 transition-colors hover:text-gold"
          >
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
