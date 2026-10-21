import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";
import { hero, site } from "@/data";
import { HeroLines } from "./HeroLines";
import { HeroSky } from "./HeroSky";
import { HeroStage } from "./HeroStage";

/**
 * SECTION 01 — THE OPENING FRAME
 *
 * One photograph, one statement. The image is ŹPF's own; everything
 * else stays out of its way.
 *
 * The composition is laid out here and the shot is played by
 * <HeroStage />, which finds the layers below by their `data-hero-*`
 * attributes. Keeping the two apart is what lets this stay a server
 * component, and it means the markup reads as the frame it describes
 * rather than as a list of refs.
 *
 * The layers, back to front:
 *
 *   backdrop  the gate — everything behind the type, clipped as one
 *   plate     the photograph and the weather in it (see HeroSky)
 *   veil      the fall-off, which never reaches black
 *   copy      the statement, which leaves as one block
 *   near      the same statement again, on the pointer's plane
 */
export function Hero() {
  return (
    <HeroStage>
      <div className="hero-frame">
        {/* Backdrop. Scaled past the frame so neither the push-in nor
            the cloud drift ever shows an edge. <HeroSky /> is the
            photograph plus the weather in it. */}
        <div
          data-hero-backdrop
          className="hero-backdrop absolute inset-0 -z-10"
        >
          <div data-hero-plate className="h-full w-full">
            <HeroSky image={hero.image} />
          </div>
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
          {/* The fall-off, driven by the shot. Inside the gate, so it
              darkens the slot the photograph closes to and nothing
              else. */}
          <div
            data-hero-veil
            aria-hidden
            className="absolute inset-0 bg-ink opacity-0"
          />
        </div>

        <div data-hero-copy className="shell pb-8 pt-24 md:pb-20 md:pt-28">
          <div data-hero-near>
            {/* The wrapper carries the shot's exit and the <Reveal />
                inside it carries the entrance, so the two never write
                to the same element's transform. */}
            <div data-hero-chrome className="mb-6 md:mb-8">
              <Reveal
                immediate
                className="flex items-center gap-3"
                delay={0.1}
                y={14}
              >
                <span aria-hidden className="h-px w-10 bg-signal" />
                <p className="meta text-ash">{site.location}</p>
              </Reveal>
            </div>

            <div data-hero-headline>
              <HeroLines lines={hero.lines} accent={hero.accent} />
            </div>

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
                  className="pill pill-solid group"
                >
                  <span className="meta">{hero.primaryCta.label}</span>
                  <span aria-hidden data-arrow>
                    →
                  </span>
                </Link>
                <Link
                  href={hero.secondaryCta.href}
                  className="pill group"
                >
                  <span className="meta">{hero.secondaryCta.label}</span>
                  <span aria-hidden data-arrow>
                    →
                  </span>
                </Link>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Scroll cue. Decorative — the CTAs above carry the same intent. */}
        <div
          data-hero-chrome
          aria-hidden
          className="pointer-events-none absolute bottom-4 right-[var(--gutter)] hidden items-center gap-3 md:flex"
        >
          <span className="meta text-ash">Scroll</span>
          <span className="relative block h-12 w-px overflow-hidden bg-rule">
            <span className="absolute inset-x-0 top-0 h-4 animate-[cue_2.4s_var(--ease-cine)_infinite] bg-signal" />
          </span>
        </div>
      </div>
    </HeroStage>
  );
}
