"use client";

import { useRef, type ReactNode } from "react";
import { DESKTOP, MOTION_OK, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /**
   * How far the content drifts across the full scroll of its container,
   * as a percentage of its own height. Keep it small — this should be
   * felt, not noticed.
   */
  distance?: number;
}

/**
 * Drifts an image slowly against the scroll direction.
 *
 * Desktop and fine-motion only: on phones the effect costs more than it
 * adds, and it is skipped entirely for reduced-motion visitors.
 * The child should overflow its frame (scale it past 100%) so the drift
 * never exposes an edge.
 */
export function Parallax({ children, className, distance = 12 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
      gsap.fromTo(
        el,
        { yPercent: -distance / 2 },
        {
          yPercent: distance / 2,
          ease: "none",
          /* Keep it on the compositor: this element moves for the
             whole time it is on screen. */
          force3D: true,
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            /* A short catch-up rather than scrub: true. Raw scrubbing
               tracks the wheel's discrete deltas exactly, which reads
               as stepping on a trackpad; easing into the value smooths
               it without any perceptible lag. */
            scrub: 0.5,
          },
        },
      );
    });

    return () => mm.revert();
  }, [distance]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
