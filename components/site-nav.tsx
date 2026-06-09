import { MobileNavLinks } from "@/components/mobile-nav-links";
import { SocialLinks } from "@/components/social-links";
import { navLinks, site } from "@/lib/site";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6 text-gold"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function SiteNav() {
  return (
    <>
      <input
        type="checkbox"
        id="nav-menu-toggle"
        className="nav-menu-checkbox"
        aria-hidden
        tabIndex={-1}
      />

      <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#080f1a]">
        <nav
          className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:h-16 md:px-10"
          aria-label="Primary"
        >
          <a
            href="/#top"
            className="font-display text-sm tracking-[0.35em] text-gold md:text-base"
          >
            {site.title}
          </a>

          <div className="hidden items-center gap-8 sm:flex">
            <ul className="flex items-center gap-8 text-xs tracking-[0.2em] text-sand/80 uppercase">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <SocialLinks />
          </div>

          <label
            htmlFor="nav-menu-toggle"
            className="nav-menu-button relative z-[60] flex h-10 w-10 cursor-pointer items-center justify-center sm:hidden"
            aria-label="Open menu"
          >
            <span className="nav-icon-open">
              <MenuIcon open={false} />
            </span>
            <span className="nav-icon-close">
              <MenuIcon open />
            </span>
          </label>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className="mobile-menu-panel fixed inset-x-0 bottom-0 z-[45] bg-[#080f1a] sm:hidden"
      >
        <nav
          className="flex h-full min-h-0 flex-col items-center justify-center gap-10 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          aria-label="Mobile"
        >
          <MobileNavLinks links={navLinks} />
          <SocialLinks className="gap-8" />
        </nav>
      </div>
    </>
  );
}
