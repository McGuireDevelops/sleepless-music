import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { Hero } from "@/components/hero";
import { ReelCrafterEmbed } from "@/components/reelcrafter-embed";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { WorkSection } from "@/components/work-section";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <ReelCrafterEmbed />
        <WorkSection />
        <AboutSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
