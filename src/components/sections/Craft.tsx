import { Figure } from "@/components/ui/Figure";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { TeamProfiles } from "@/components/ui/TeamProfiles";
import { assets, disciplines } from "@/data";

/**
 * SECTION 06 — THE CRAFT BEHIND THE FRAME
 *
 * The roles ŹPF covers in house, described as one production
 * capability. No individuals are named: see TeamProfiles.
 */
export function Craft() {
  return (
    <section className="border-t border-rule-soft py-20 md:py-32">
      <div className="shell">
        <SectionIntro index="06" eyebrow="The craft" />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-12 md:gap-0">
        {/* Bleeds to the left edge of the viewport. */}
        <div className="md:col-span-5">
          <Reveal y={40}>
            <div className="overflow-hidden">
              <Parallax distance={12}>
                <Figure
                  asset={assets["ladakh-gathering"]}
                  ratio="3 / 4"
                  sizes="(max-width: 48rem) 100vw, 42vw"
                  className="scale-110"
                />
              </Parallax>
            </div>
          </Reveal>
        </div>

        <div className="px-[var(--gutter)] md:col-span-6 md:col-start-7 md:pl-10 md:pr-[var(--gutter)]">
          <Reveal>
            <h2 className="display text-[clamp(2.25rem,5vw,4.5rem)]">
              Many disciplines.
              <br />
              <span className="text-signal">One frame.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-6 max-w-lg">
            <p className="text-base leading-relaxed text-ash">
              Every film is carried end to end by one production team,
              from the first treatment through to the final master.
            </p>
          </Reveal>

          <Reveal
            delay={0.1}
            stagger={0.04}
            className="mt-10 grid grid-cols-1 gap-x-10 border-t border-rule-soft sm:grid-cols-2 md:mt-14"
          >
            {disciplines.map((discipline) => (
              <p
                key={discipline.id}
                className="border-b border-rule-soft py-3 text-sm text-bone md:text-base"
              >
                {discipline.title}
              </p>
            ))}
          </Reveal>

          {/* Renders nothing until approved profiles exist. */}
          <div className="mt-14 empty:mt-0">
            <TeamProfiles />
          </div>
        </div>
      </div>
    </section>
  );
}
