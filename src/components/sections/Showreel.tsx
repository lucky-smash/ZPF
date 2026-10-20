import { SectionIntro } from "@/components/ui/SectionIntro";
import { ShowreelPlayer } from "@/components/ui/ShowreelPlayer";
import { Reveal } from "@/components/ui/Reveal";
import { showreel } from "@/data";

/**
 * SECTION 02 — THE SHOWREEL
 *
 * The real film, one click away. Nothing is requested from YouTube
 * until the visitor asks for it.
 */
export function Showreel() {
  return (
    <section id="showreel" className="shell py-20 md:py-28">
      <SectionIntro index="02" eyebrow="Showreel" />

      <div className="mt-10 flex flex-col gap-6 md:mt-14 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <h2 className="display text-[clamp(2.5rem,6vw,5.5rem)]">
            {showreel.title}
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="flex items-center gap-6">
          {showreel.year ? (
            <span className="meta text-ash">{showreel.year}</span>
          ) : null}
          {showreel.runtime ? (
            <span className="meta text-ash">{showreel.runtime}</span>
          ) : null}
          {showreel.watchUrl ? (
            <a
              href={showreel.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="meta link-underline text-bone"
            >
              Watch on YouTube ↗
            </a>
          ) : null}
        </Reveal>
      </div>

      <Reveal className="mt-8 border border-rule-soft md:mt-10" y={36}>
        <ShowreelPlayer config={showreel} />
      </Reveal>

      <Reveal delay={0.1} className="mt-5 max-w-2xl">
        <p className="text-sm leading-relaxed text-ash">
          The reel plays in the YouTube player, which carries its own
          play, pause and volume controls. Sound stays off until you
          start it.
        </p>
      </Reveal>
    </section>
  );
}
