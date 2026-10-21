import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { services } from "@/data";
import { ServiceIndex } from "./ServiceIndex";

/**
 * SECTION 05 — WORK CATEGORIES
 *
 * The twelve categories ŹPF lists, in the company's own wording.
 */
export function Services() {
  return (
    <section
      id="services"
      className="shell scroll-mt-24 border-t border-rule-soft beat"
    >
      <SectionIntro index="05" eyebrow="We carve" />

      <div className="mt-10 flex flex-col gap-6 md:mt-16 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <h2 className="display max-w-[12ch] text-[clamp(2.5rem,6vw,5.5rem)]">
            Stories take many forms.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="meta text-ash">
            {services.length} categories
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-12 md:mt-16" y={30}>
        <ServiceIndex services={services} />
      </Reveal>
    </section>
  );
}
