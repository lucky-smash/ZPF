"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { afterIntro } from "@/lib/intro";

interface HeroLinesProps {
  lines: string[];
  /** The one line set in italic. See `hero.accent` in src/data/site.ts. */
  accent?: string;
}

/**
 * The hero statement, one line per mask.
 *
 * Each line sits inside a clipped row and rises into place, which reads
 * like a title card rather than a fade. Without JavaScript the lines are
 * simply already in position.
 *
 * The last line is set in the display face's italic — the only italic
 * above the fold, which is what makes it read as a cadence rather than
 * as a style. The mask geometry that lets a serif's descenders through
 * without clipping lives in .hero-headline in globals.css.
 *
 * When the opening sequence is playing it waits for it: the headline
 * arriving is the last beat of that sequence, not something that
 * happened behind it. `afterIntro` plays it straight away when there is
 * no sequence, and plays it regardless if one never finishes.
 */
export function HeroLines({ lines, accent }: HeroLinesProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const rows = el.querySelectorAll("[data-line]");
      /* Built paused, so the "from" state is applied now and the lines
         are hidden until whatever is holding them lets go.

         130% rather than 110%: the masks are padded to clear the
         serif's descenders, so a line has further to travel before it
         is genuinely out of its own row. */
      const entrance = gsap.from(rows, {
        yPercent: 130,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.12,
        delay: 0.25,
        paused: true,
      });
      return afterIntro(() => entrance.play());
    });

    return () => mm.revert();
  }, []);

  return (
    <h1 ref={ref} className="hero-headline text-bone">
      {lines.map((line) => (
        <span key={line}>
          <span
            data-line
            data-accent={line === accent ? "" : undefined}
            className="block"
          >
            {line}
          </span>
        </span>
      ))}
    </h1>
  );
}
