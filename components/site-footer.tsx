import Image from "next/image";
import Link from "next/link";
import { SocialLinks } from "@/components/social-links";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#060b14] py-12">
      <div className="mx-auto max-w-6xl px-6 text-center md:px-10">
        <Image
          src={site.logoImage}
          alt={site.logoAlt}
          width={2560}
          height={1602}
          className="mx-auto h-10 w-auto opacity-80"
          sizes="160px"
        />
        <p className="mt-4 font-display text-sm tracking-[0.15em] text-gold/90 uppercase">
          {site.artistName}
        </p>
        <p className="mt-2 text-xs tracking-[0.25em] text-sand/40 uppercase">
          {site.title}
        </p>
        <SocialLinks className="mt-8 justify-center" />
        <p className="mt-8">
          <Link
            href="/privacy"
            className="text-xs text-sand/50 underline-offset-2 transition hover:text-gold hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
        <p className="mt-4 text-xs text-sand/30">
          © {new Date().getFullYear()} {site.title}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
