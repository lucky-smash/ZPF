import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { testimonials } from "@/data";
import { TestimonialSequence } from "./TestimonialSequence";

/**
 * SECTION 08 — CLIENT TESTIMONIALS
 *
 * Reproduced exactly as supplied, attributions included.
 */
export function Testimonials() {
  return (
    <section className="shell border-t border-rule-soft py-20 md:py-32">
      <SectionIntro index="08" eyebrow="In their words" />

      <div className="mt-10 grid grid-cols-1 gap-12 md:mt-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-3">
          <Reveal>
            <h2 className="display text-[clamp(2rem,4vw,3rem)]">
              What brands
              <br />
              have said.
            </h2>
          </Reveal>
        </div>

        <Reveal y={30} className="md:col-span-8 md:col-start-5">
          <TestimonialSequence items={testimonials} />
        </Reveal>
      </div>
    </section>
  );
}
