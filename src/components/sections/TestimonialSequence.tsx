"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Testimonial } from "@/data";

/**
 * The client quotes, one to a frame.
 *
 * Built on a scroll-snap track, so without JavaScript it stays a
 * readable, swipeable list — the buttons below only add a second way to
 * move through it. Nothing advances on a timer.
 */
export function TestimonialSequence({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  /* Follow the scroll position so the counter and buttons stay honest
     whether the visitor swiped, scrolled or pressed a button. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = track.clientWidth || 1;
        setIndex(Math.round(track.scrollLeft / width));
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  const goTo = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(next, items.length - 1));
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [items.length]);

  return (
    <div>
      <ul
        ref={trackRef}
        /* Centred, not stretched. The track reserves the height of the
           longest quote — six of them share one frame — and a short one
           left at the top of that box strands all of the difference
           underneath it as a hole. Centred, the same space reads as the
           frame the quote is set in. */
        className="flex snap-x snap-mandatory items-center overflow-x-auto [overscroll-behavior-x:contain] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="w-full shrink-0 snap-center pr-4 md:pr-10"
          >
            <figure>
              <blockquote>
                <p
                  className={`display [--display-leading:1.14] text-bone ${
                    item.quote.length > 110
                      ? "text-[clamp(1.25rem,2.6vw,2.25rem)]"
                      : "text-[clamp(1.75rem,4.5vw,3.75rem)]"
                  }`}
                >
                  <span aria-hidden className="text-signal">
                    &ldquo;
                  </span>
                  {item.quote}
                  <span aria-hidden className="text-signal">
                    &rdquo;
                  </span>
                </p>
              </blockquote>
              <figcaption className="meta mt-6 text-ash md:mt-8">
                — {item.attribution}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center justify-between gap-6 border-t border-rule-soft pt-6 md:mt-14">
        <p className="meta text-ash" aria-live="polite">
          <span className="text-bone">{String(index + 1).padStart(2, "0")}</span>
          {" / "}
          {String(items.length).padStart(2, "0")}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous testimonial"
            className="flex size-12 items-center justify-center border border-rule text-bone transition-colors duration-500 enabled:hover:border-bone disabled:opacity-30"
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === items.length - 1}
            aria-label="Next testimonial"
            className="flex size-12 items-center justify-center border border-rule text-bone transition-colors duration-500 enabled:hover:border-bone disabled:opacity-30"
          >
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
