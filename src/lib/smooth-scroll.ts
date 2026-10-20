"use client";

import type Lenis from "lenis";

/**
 * The live Lenis instance, or null when smooth scrolling is off —
 * which is the case for reduced-motion visitors and before the
 * provider mounts.
 *
 * Held on `window` rather than in a module-level variable on purpose.
 * The bundler can place this module in more than one client chunk, and
 * each copy would get its own variable: "back to top" would then read
 * null, fall back to window.scrollTo, and fight the scroller that is
 * actually running. One global cannot be duplicated.
 */
declare global {
  interface Window {
    __zpfLenis?: Lenis | null;
    /** Set while the opening sequence owns the screen. Also a global,
        for the same reason, and because the scroller mounts after it. */
    __zpfScrollHeld?: boolean;
  }
}

export function setSmoothScroll(next: Lenis | null) {
  if (typeof window === "undefined") return;
  window.__zpfLenis = next;
  /* Lenis loads after the opening sequence has already taken the
     screen, so it has to be told on arrival that the scroll is held. */
  if (next && window.__zpfScrollHeld) next.stop();
}

/**
 * Hold and release the scroller.
 *
 * The native scroll is locked in CSS from the `data-intro-lock`
 * attribute, before any of this runs. These two only deal with Lenis,
 * which keeps its own scroll value and would otherwise carry on
 * animating behind the overlay.
 */
export function holdScroll() {
  if (typeof window === "undefined") return;
  window.__zpfScrollHeld = true;
  getSmoothScroll()?.stop();
}

export function releaseScroll() {
  if (typeof window === "undefined") return;
  window.__zpfScrollHeld = false;
  getSmoothScroll()?.start();
}

export function getSmoothScroll() {
  return typeof window === "undefined" ? null : (window.__zpfLenis ?? null);
}

/**
 * Scroll to a target, through Lenis when it is running and with the
 * platform's own smooth scroll otherwise. `target` is a selector, an
 * element, or an absolute offset in pixels.
 */
export function scrollTo(target: string | HTMLElement | number) {
  const lenis = getSmoothScroll();

  if (lenis) {
    /* No offset: Lenis already honours the scroll-margin the anchored
       sections set in CSS, so adding one here would double-count it. */
    lenis.scrollTo(target);
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduced ? "auto" : "smooth";

  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }
  const element =
    typeof target === "string" ? document.querySelector(target) : target;
  element?.scrollIntoView({ behavior, block: "start" });
}
