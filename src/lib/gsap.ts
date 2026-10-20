"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Animating transforms only; let the browser keep its own rounding.
  gsap.defaults({ ease: "power3.out", duration: 1 });
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
