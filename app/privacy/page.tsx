import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy — ${site.pageTitle}`,
  description: `How ${site.title} handles your information when you visit our website.`,
  robots: { index: true, follow: true },
  alternates: { canonical: `${site.url}/privacy` },
};

const lastUpdated = "5 June 2026";

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main className="bg-[#080f1a] pb-20 pt-[var(--site-header-offset)]">
        <article className="mx-auto max-w-2xl px-6 py-16 md:px-10 md:py-24">
          <p className="text-[0.65rem] tracking-[0.4em] text-gold/80 uppercase">
            Legal
          </p>
          <h1 className="mt-4 font-display text-3xl text-sand md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-sand/50">Last updated: {lastUpdated}</p>
          <p className="mt-6 text-sm leading-7 text-sand/70">
            Applies to{" "}
            <a
              href={site.url}
              className="text-gold/90 underline-offset-2 hover:underline"
            >
              {site.url.replace("https://", "")}
            </a>
            .
          </p>

          <section className="mt-12 space-y-4 text-sm leading-7 text-sand/70">
            <h2 className="font-display text-xl text-sand">1. Who we are</h2>
            <p>
              This website promotes the work of <strong>{site.artistName}</strong>{" "}
              ({site.title}). {site.artistName} is the data controller for
              information described here.
            </p>
            <p>
              Contact:{" "}
              <a
                href={`mailto:${site.contactEmail}`}
                className="text-gold/90 underline-offset-2 hover:underline"
              >
                {site.contactEmail}
              </a>
            </p>
          </section>

          <section className="mt-10 space-y-4 text-sm leading-7 text-sand/70">
            <h2 className="font-display text-xl text-sand">
              2. What this policy covers
            </h2>
            <p>
              This policy explains how we handle information when you visit the
              site. The site is a brochure-style website: it does not offer user
              accounts or checkout. If you email us, you choose what to send.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-sm leading-7 text-sand/70">
            <h2 className="font-display text-xl text-sand">
              3. Information we collect
            </h2>
            <h3 className="text-sand/90">Information you provide</h3>
            <p>
              If you contact us at {site.contactEmail}, we receive your email
              address, message content, and any attachments you send. We use
              this only to respond to your enquiry.
            </p>
            <h3 className="text-sand/90">Information collected automatically</h3>
            <p>
              Our hosting and analytics providers may process technical data such
              as IP address (often truncated), browser and device type, pages
              viewed, referring URL, visit time, region derived from IP, and
              performance metrics.
            </p>
            <h3 className="text-sand/90">Cookies and similar technologies</h3>
            <p>
              We use Vercel Web Analytics and Vercel Speed Insights. These may use
              cookies depending on configuration. See{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="text-gold/90 underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel&apos;s privacy policy
              </a>
              .
            </p>
            <p>
              When you play music via the embedded ReelCrafter player, ReelCrafter
              may set cookies under its own policies.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-sm leading-7 text-sand/70">
            <h2 className="font-display text-xl text-sand">
              4. How we use your information
            </h2>
            <p>
              We use information to operate and secure the site, measure visits
              and improve performance, respond to enquiries, and comply with law.
              We do not sell your personal information.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-sm leading-7 text-sand/70">
            <h2 className="font-display text-xl text-sand">5. Third parties</h2>
            <p>
              Vercel (hosting, analytics), ReelCrafter (music player embed), and
              social platforms when you follow external links may process data
              under their own policies.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-sm leading-7 text-sand/70">
            <h2 className="font-display text-xl text-sand">6. Your rights</h2>
            <p>
              Depending on where you live, you may have rights to access,
              correct, delete, or restrict processing of your data, and to
              complain to a supervisory authority. Contact{" "}
              <a
                href={`mailto:${site.contactEmail}`}
                className="text-gold/90 underline-offset-2 hover:underline"
              >
                {site.contactEmail}
              </a>{" "}
              to exercise these rights.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-sm leading-7 text-sand/70">
            <h2 className="font-display text-xl text-sand">7. Security</h2>
            <p>
              We use HTTPS and security headers. No online transmission is
              completely secure.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-sm leading-7 text-sand/70">
            <h2 className="font-display text-xl text-sand">8. Changes</h2>
            <p>
              We may update this policy. The last updated date at the top will
              change when we do.
            </p>
          </section>

          <p className="mt-12">
            <Link
              href="/"
              className="text-sm text-gold/90 underline-offset-2 transition hover:text-gold hover:underline"
            >
              ← Back to home
            </Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
