"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { Service } from "@/data";
import { MOTION_OK, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";

const FINE_POINTER = "(min-width: 64rem) and (pointer: fine)";

/** How far the frame rides from the cursor, and off the viewport edge. */
const OFFSET = 30;
const MARGIN = 18;

/**
 * The twelve categories, set as an editorial index rather than twelve cards.
 *
 * On a desktop with a mouse, hovering a row brings up a still in a small
 * viewfinder that trails the cursor. Touch and keyboard visitors get the
 * same picture inline beside the row, so nothing is locked behind hover.
 *
 * ------------------------------------------------------------------
 * WHY EVERY STILL IS MOUNTED AT ONCE
 * ------------------------------------------------------------------
 * The frame holds all twelve images stacked, and hovering changes which
 * one is opaque. Swapping the `src` of a single <Image> instead — which
 * is what this did — hands the browser a picture it has never decoded
 * at the exact moment it is asked to show it, so the frame blinks
 * through a blank before the new still appears. Stacking them costs
 * twelve small requests once, and the change becomes a true crossfade
 * with nothing to load at the moment of the swap.
 */
export function ServiceIndex({ services }: { services: Service[] }) {
  const [active, setActive] = useState<Service | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    const frame = frameRef.current;
    if (!list || !preview || !frame) return;

    const mm = gsap.matchMedia();

    mm.add(FINE_POINTER, () => {
      const reduced = !window.matchMedia(MOTION_OK).matches;
      /* The frame trails the pointer; without easing it would snap. */
      const duration = reduced ? 0 : 0.5;
      const moveX = gsap.quickTo(preview, "x", { duration, ease: "power3.out" });
      const moveY = gsap.quickTo(preview, "y", { duration, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        /* Measured per move rather than cached: the frame's size is set
           in rem and a page zoom changes it underneath us. */
        const w = frame.offsetWidth;
        const h = frame.offsetHeight;
        const vw = document.documentElement.clientWidth;
        const vh = window.innerHeight;

        /* Where `position: fixed` actually resolves to.

           A transformed ancestor becomes the containing block for a
           fixed child, and one of the reveal wrappers this index sits
           inside carries a GSAP transform. So "fixed" here has never
           meant the viewport: the frame was being placed against that
           wrapper, which is why it sat away from the cursor and ran off
           the edges. Rather than fight for an untransformed ancestor,
           the cursor's viewport coordinates are converted into
           whatever space the frame is really in. With no transformed
           ancestor `offsetParent` is null and this is a no-op. */
        const host = preview.offsetParent as HTMLElement | null;
        const hostRect = host?.getBoundingClientRect();
        const originX = hostRect?.left ?? 0;
        const originY = hostRect?.top ?? 0;

        /* Beside the cursor, and on the other side of it once there is
           no longer room — so the frame is never cropped by the right
           edge, and never jumps across while there is still space. */
        let x = event.clientX + OFFSET;
        if (x + w > vw - MARGIN) x = event.clientX - OFFSET - w;

        /* Centred on the cursor vertically, then held inside the
           viewport. Clamped rather than flipped: a frame that jumped
           above and below the pointer as it crossed the middle of a
           row would read as a fault. */
        let y = event.clientY - h / 2;

        x = Math.min(Math.max(x, MARGIN), Math.max(MARGIN, vw - w - MARGIN));
        y = Math.min(Math.max(y, MARGIN), Math.max(MARGIN, vh - h - MARGIN));

        moveX(x - originX);
        moveY(y - originY);
      };

      list.addEventListener("pointermove", onMove, { passive: true });

      /* Cleanup belongs in the function returned to matchMedia.
         context.add() would have run this immediately. */
      return () => {
        list.removeEventListener("pointermove", onMove);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <>
      <ul
        ref={listRef}
        /* The frame is cleared when the pointer leaves the whole index,
           not when it leaves a row. Per-row leave fires before the next
           row's enter, so crossing a rule used to blank the frame and
           fade it back in — a flicker on every row boundary, which is
           exactly the thing a crossfade is for. */
        onPointerLeave={() => setActive(null)}
        className="border-t border-rule-soft"
      >
        {services.map((service, index) => (
          <li
            key={service.id}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setActive(service);
            }}
            className="group border-b border-rule-soft"
          >
            <div className="flex items-center gap-5 py-5 transition-[padding,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:py-7 lg:group-hover:pl-6">
              {/* Inline still — the hover preview's stand-in on touch. */}
              {service.image ? (
                <div className="relative size-14 shrink-0 overflow-hidden rounded-[0.5rem] bg-charcoal ring-1 ring-rule-soft sm:size-16 lg:hidden">
                  <Image
                    src={service.image.src}
                    alt=""
                    fill
                    sizes="64px"
                    placeholder={service.image.blurDataURL ? "blur" : "empty"}
                    blurDataURL={service.image.blurDataURL}
                    className="object-cover"
                  />
                </div>
              ) : null}

              <span className="meta w-8 shrink-0 text-ash transition-colors duration-500 group-hover:text-signal">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="display text-xl transition-colors duration-500 group-hover:text-signal md:text-2xl lg:text-[clamp(1.5rem,2.6vw,2.5rem)]">
                  {service.title}
                </h3>
                {/* Appears only once approved copy is added to the data. */}
                {service.description ? (
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-ash">
                    {service.description}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ---- THE VIEWFINDER ----
          Hidden from assistive tech: it repeats the row it belongs to.
          pointer-events: none throughout, so it can pass over the list
          without ever taking a hover away from it. */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
      >
        <div
          ref={frameRef}
          className="vf"
          data-open={active ? "" : undefined}
        >
          <div className="vf-plate">
            {services.map((service) =>
              service.image ? (
                <Image
                  key={service.id}
                  src={service.image.src}
                  alt=""
                  fill
                  sizes="240px"
                  /* Mounted twelve at a time, so they are kept light.
                     Nine distinct photographs back the twelve rows, and
                     the browser dedupes by URL, so this is nine small
                     requests rather than twelve. */
                  quality={70}
                  placeholder={service.image.blurDataURL ? "blur" : "empty"}
                  blurDataURL={service.image.blurDataURL}
                  className="vf-still object-cover"
                  data-on={active?.id === service.id ? "" : undefined}
                />
              ) : null,
            )}
          </div>

          {/* Four etched marks, in the same ink as the camera's own
              viewfinder. The photograph is the subject; these only say
              what is holding it. */}
          <span aria-hidden className="vf-mark" />
          <span aria-hidden className="vf-mark" />
          <span aria-hidden className="vf-mark" />
          <span aria-hidden className="vf-mark" />
        </div>
      </div>
    </>
  );
}
