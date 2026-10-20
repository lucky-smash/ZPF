import { Figure } from "@/components/ui/Figure";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { about } from "@/data";

/**
 * SECTION 07 — ABOUT ŹPF
 *
 * Verified facts only: where the company is, how long it has worked,
 * what it makes, and the philosophy it states for itself.
 */
export function About() {
  const [first, second] = about.images;

  return (
    <section
      id="about"
      className="shell scroll-mt-24 border-t border-rule-soft py-20 md:py-32"
    >
      <SectionIntro index="07" eyebrow="About ŹPF" />

      <div className="mt-12 grid grid-cols-1 gap-12 md:mt-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6">
          <Reveal>
            <h2 className="display text-[clamp(2.25rem,5vw,4.5rem)]">
              {about.headline[0]}
              <br />
              <span className="text-ash">{about.headline[1]}</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} stagger={0.08} className="mt-8 max-w-xl md:mt-10">
            {about.body.map((paragraph) => (
              <p
                key={paragraph}
                className="text-base leading-relaxed text-ash md:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal
            delay={0.1}
            stagger={0.08}
            className="mt-10 border-t border-rule-soft md:mt-14"
          >
            {about.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-6 border-b border-rule-soft py-4"
              >
                <span className="meta text-ash">{fact.label}</span>
                <span className="text-right text-base text-bone">{fact.value}</span>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.1} className="mt-10 md:mt-14">
            <blockquote className="border-l-2 border-signal pl-6">
              <p className="text-lg italic leading-relaxed text-bone md:text-xl">
                &ldquo;{about.philosophy}&rdquo;
              </p>
            </blockquote>
          </Reveal>
        </div>

        {/* Diptych, echoing the pair in the company introduction. */}
        <div className="grid grid-cols-2 gap-4 md:col-span-5 md:col-start-8 md:gap-5">
          <Reveal y={40} className="md:pt-16">
            <div className="overflow-hidden">
              <Parallax distance={10}>
                <Figure
                  asset={first}
                  ratio="3 / 4"
                  sizes="(max-width: 48rem) 50vw, 21vw"
                  className="scale-110"
                />
              </Parallax>
            </div>
          </Reveal>
          <Reveal y={40} delay={0.1}>
            <div className="overflow-hidden">
              <Parallax distance={16}>
                <Figure
                  asset={second}
                  ratio="3 / 4"
                  sizes="(max-width: 48rem) 50vw, 21vw"
                  className="scale-110"
                />
              </Parallax>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
