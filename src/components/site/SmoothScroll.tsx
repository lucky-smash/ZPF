"use client";

import { useEffect } from "react";

import { ScrollTrigger, gsap } from "@/lib/gsap";
import { scrollTo, setSmoothScroll } from "@/lib/smooth-scroll";

/**
 * Normalises the scroll so wheel and trackpad input arrives as a
 * continuous value rather than in discrete jumps. Everything driven by
 * scroll — the pinned film roll, the parallax stills — is scrubbed from
 * that value, so smoothing it here smooths all of them at once.
 *
 * Lenis and GSAP share a single clock: Lenis is advanced from the GSAP
 * ticker rather than its own requestAnimationFrame loop, so the scroll
 * position and the tweens reading it can never be a frame apart.
 *
 * Switched off entirely for reduced-motion visitors, who keep native
 * scrolling. Renders nothing.
 */
export function SmoothScroll() {
  useEffect(() => {
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    if (!motionOk.matches) return;

    let lenis: import("lenis").default | null = null;
    let cancelled = false;

    const tick = (time: number) => lenis?.raf(time * 1000);

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        // Long enough to glide, short enough to still feel direct.
        lerp: 0.085,
        wheelMultiplier: 1,
        // Touch already has native momentum; smoothing it fights the OS.
        syncTouch: false,
        autoRaf: false,
      });

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      // GSAP smooths its own delta by default; Lenis wants the raw one.
      gsap.ticker.lagSmoothing(0);

      document.documentElement.dataset.lenisReady = "";
      setSmoothScroll(lenis);
      ScrollTrigger.refresh();
    });

    /* Route in-page anchors through the same scroller, otherwise the
       browser would jump while Lenis kept animating to somewhere else. */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.("a");
      const href = link?.getAttribute("href");
      if (!href) return;

      const hash = href.startsWith("#")
        ? href
        : href.startsWith("/#") && window.location.pathname === "/"
          ? href.slice(1)
          : null;
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      scrollTo(target as HTMLElement);
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", onClick);

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      delete document.documentElement.dataset.lenisReady;
      lenis?.off("scroll", ScrollTrigger.update);
      lenis?.destroy();
      setSmoothScroll(null);
    };
  }, []);

  return null;
}
