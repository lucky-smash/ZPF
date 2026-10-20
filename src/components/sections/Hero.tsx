import Link from "next/link";

import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { hero, site } from "@/data";
import { HeroLines } from "./HeroLines";
import { HeroSky } from "./HeroSky";

/**
 * SECTION 01 — THE OPENING FRAME
 *
 * One photograph, one statement. The image is ŹPF's own; everything
 * else stays out of its way.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* Backdrop. Scaled past the frame so neither the scroll parallax
          nor the cloud drift ever shows an edge. <HeroSky /> is the
          photograph plus the weather in it. */}
      <div className="hero-backdrop absolute inset-0 -z-10">
        <Parallax className="h-full w-full" distance={10}>
          <HeroSky image={hero.image} />
        </Parallax>
        {/* Legibility scrim: dark at the top for the header, heavier at
            the foot where the statement sits. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/15 to-ink"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(142%_104%_at_50%_34%,transparent_52%,rgba(8,8,8,0.46)_100%)]"
        />
      </div>

      <div className="shell pb-8 pt-24 md:pb-20 md:pt-28">
        <Reveal
          immediate
          className="mb-6 flex items-center gap-3 md:mb-8"
          delay={0.1}
          y={14}
        >
          <span aria-hidden className="h-px w-10 bg-signal" />
          <p className="meta text-ash">{site.location}</p>
        </Reveal>

        <HeroLines lines={hero.lines} accent={hero.accent} />

        <div className="mt-8 flex flex-col gap-6 border-t border-rule-soft pt-6 md:mt-14 md:flex-row md:items-end md:justify-between md:gap-10 md:pt-8">
          <Reveal immediate delay={1.1} y={18} className="max-w-xl">
            <p className="text-lg leading-relaxed text-ash md:text-xl">
              {hero.supporting}
            </p>
          </Reveal>

          <Reveal
            immediate
            delay={1.25}
            y={18}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5"
          >
            <Link
              href={hero.primaryCta.href}
              className="group inline-flex items-center justify-between gap-6 bg-bone px-6 py-4 text-ink transition-colors duration-500 hover:bg-signal hover:text-bone sm:justify-start"
            >
              <span className="meta">{hero.primaryCta.label}</span>
              <span
                aria-hidden
                className="transition-transform duration-500 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="group inline-flex items-center justify-between gap-6 border border-rule px-6 py-4 text-bone transition-colors duration-500 hover:border-bone sm:justify-start"
            >
              <span className="meta">{hero.secondaryCta.label}</span>
              <span
                aria-hidden
                className="transition-transform duration-500 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </div>

      {/* Scroll cue. Decorative — the CTAs above carry the same intent. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-4 right-[var(--gutter)] hidden items-center gap-3 md:flex"
      >
        <span className="meta text-ash">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-rule">
          <span className="absolute inset-x-0 top-0 h-4 animate-[cue_2.4s_var(--ease-cine)_infinite] bg-signal" />
        </span>
      </div>
    </section>
  );
}
