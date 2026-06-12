import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { Hero } from "@/components/hero";
import { MusicHashScroll } from "@/components/music-hash-scroll";
import { MusicSection } from "@/components/music-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
export default function Home() {
  return (
    <>
      <MusicHashScroll />
      <SiteNav />
      <main>
        <Hero />
        <MusicSection />
        <AboutSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
