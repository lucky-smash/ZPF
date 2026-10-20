import { CameraIntro } from "@/components/intro/CameraIntro";
import { About } from "@/components/sections/About";
import { Breath } from "@/components/sections/Breath";
import { Contact } from "@/components/sections/Contact";
import { Craft } from "@/components/sections/Craft";
import { FilmRoll } from "@/components/sections/FilmRoll";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Services } from "@/components/sections/Services";
import { Showreel } from "@/components/sections/Showreel";
import { Statement } from "@/components/sections/Statement";
import { Testimonials } from "@/components/sections/Testimonials";
import { BackToTop } from "@/components/site/BackToTop";
import { Cursor } from "@/components/site/Cursor";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { ogImage, site } from "@/data";

/**
 * The page unfolds as one film:
 * anticipation → observation → stories → craft → trust → collaboration.
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Showreel />
        <Statement />
        <FilmRoll />
        <SelectedWork />
        <Services />
        <Craft />
        <About />
        <Testimonials />
        <Breath />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <Cursor />
      <SmoothScroll />

      {/* The way in: camera → shutter → flash → film → this page.
          Layered over everything above, which is already rendered and
          complete underneath it. Dormant after the first time in a
          session, and never displayed at all without JavaScript. */}
      <CameraIntro />

      {/* Tells search engines who the company is. Facts only. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": site.url,
            name: site.legalName,
            alternateName: site.name,
            description: site.description,
            url: site.url,
            email: site.email,
            image: `${site.url}${ogImage.src}`,
            telephone: site.phones.map((phone) => `+${phone.e164}`),
            address: {
              "@type": "PostalAddress",
              addressLocality: "New Delhi",
              addressCountry: "IN",
            },
            sameAs: site.socials.map((social) => social.href),
          }),
        }}
      />
    </>
  );
}
