import { Figure } from "@/components/ui/Figure";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { statement } from "@/data";

/**
 * SECTION 03 — A STATEMENT ABOUT STORYTELLING
 *
 * The philosophy, set as a title card: oversized type on the left,
 * a single documentary still holding the right edge.
 */
export function Statement() {
  return (
    <section
      aria-label="Why we film"
      className="shell border-t border-rule-soft beat"
    >
      <SectionIntro index="03" eyebrow="Why we film" />

      <div className="mt-12 grid grid-cols-1 gap-12 md:mt-20 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7 lg:col-span-7">
          <Reveal stagger={0.1}>
            {statement.lead.map((line, index) => (
              <p
                key={line}
                className={`display [--display-leading:1.08] text-[clamp(1.75rem,4.2vw,3.5rem)] ${
                  index === statement.lead.length - 1 ? "text-signal" : "text-bone"
                }`}
              >
                {line}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-10 max-w-xl border-t border-rule-soft pt-8 md:mt-14">
            <p className="text-base leading-relaxed text-ash md:text-lg">
              {statement.body}
            </p>
          </Reveal>
        </div>

        {/* Offset downward so the two columns never line up — but only
           by a little. A 3/4 plate in a four-column well runs about
           230px past the prose beside it, and the figure caption ends
           up stranded at the bottom of a void rather than closing the
           section. A shorter plate and a smaller offset keep the
           asymmetry and lose the hole. */}
        <div className="md:col-span-4 md:col-start-9 md:pt-10">
          <Reveal y={40}>
            <div className="overflow-hidden">
              <Parallax distance={14}>
                <Figure
                  asset={statement.image}
                  ratio="4 / 5"
                  sizes="(max-width: 48rem) 100vw, 33vw"
                  className="scale-110"
                />
              </Parallax>
            </div>
            <p className="slate mt-4 text-ash">Fig. 01 — Observation</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
