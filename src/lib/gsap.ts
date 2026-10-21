"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Animating transforms only; let the browser keep its own rounding.
  gsap.defaults({ ease: "power3.out", duration: 1 });

  /**
   * How much of a stalled frame a timeline is allowed to swallow.
   *
   * GSAP advances by real elapsed time, so a main thread that blocks
   * for 400ms — compiling a shader, decoding a photograph, hydrating
   * — hands the next tick 400ms of progress and the animation jumps
   * that far. The default only steps in past half a second, which is
   * long enough for a jump to be the thing a visitor notices.
   *
   * Below 250ms nothing changes. Past it, a tick counts for 25ms,
   * which turns a jump into a brief slow-down: the opening sequence
   * loses a fraction of a second rather than skipping a shot, and
   * every scroll-driven animation on the page gets the same
   * protection from the same line.
   */
  gsap.ticker.lagSmoothing(250, 25);
}

/**
 * useLayoutEffect runs before the browser paints, which is what lets
 * GSAP hide an element for its entrance without the user seeing it
 * first. On the server React warns about it, so fall back there.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Media query GSAP uses to skip motion for people who ask for less. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** Below this width, expensive scroll effects are switched off. */
export const DESKTOP = "(min-width: 48rem)";

export { gsap, ScrollTrigger };
