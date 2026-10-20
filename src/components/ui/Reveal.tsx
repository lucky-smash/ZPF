"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { MOTION_OK, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { afterIntro } from "@/lib/intro";

interface RevealProps {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Distance in pixels the content travels upward as it appears. */
  y?: number;
  delay?: number;
  duration?: number;
  /**
   * When set, the direct children animate one after another instead of
   * the wrapper moving as a single block.
   */
  stagger?: number;
  /** Where in the viewport the entrance begins. */
  start?: string;
  /**
   * Play on mount instead of on scroll. Use it for anything inside the
   * opening frame: content low in the first viewport sits below the
   * scroll trigger's threshold and would otherwise stay hidden until
   * the visitor scrolls.
   *
   * These are also the entrances the opening sequence hands over to, so
   * they wait for it rather than playing behind it.
   */
  immediate?: boolean;
}

/**
 * Fades content up as it scrolls into view.
 *
 * The markup renders in its finished state, so the page is complete
 * with JavaScript disabled. GSAP only ever animates *from* a hidden
 * state, and sets that state before the first paint.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  y = 28,
  delay = 0,
  duration = 1.1,
  stagger,
  start = "top 88%",
  immediate = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const targets = stagger ? Array.from(el.children) : el;
      if (stagger && (targets as Element[]).length === 0) return;

      const entrance = gsap.from(targets, {
        opacity: 0,
        y,
        duration,
        delay,
        stagger: stagger ?? 0,
        paused: immediate,
        scrollTrigger: immediate
          ? undefined
          : { trigger: el, start, toggleActions: "play none none none" },
      });

      if (!immediate) return;
      return afterIntro(() => entrance.play());
    });

    return () => mm.revert();
  }, [y, delay, duration, stagger, start, immediate]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
