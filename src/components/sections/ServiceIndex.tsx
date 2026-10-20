"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { Service } from "@/data";
import { MOTION_OK, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";

const FINE_POINTER = "(min-width: 64rem) and (pointer: fine)";

/**
 * The twelve categories, set as an editorial index rather than twelve cards.
 *
 * On a desktop with a mouse, hovering a row brings up a still that
 * trails the cursor. Touch and keyboard visitors get the same picture
 * inline beside the row, so nothing is locked behind hover.
 */
export function ServiceIndex({ services }: { services: Service[] }) {
  const [active, setActive] = useState<Service | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const moveTo = useRef<{
    x: (value: number) => void;
    y: (value: number) => void;
  } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;

    const mm = gsap.matchMedia();

    mm.add(FINE_POINTER, () => {
      const reduced = !window.matchMedia(MOTION_OK).matches;
      // The preview trails the pointer; without easing it would snap.
      const duration = reduced ? 0 : 0.5;
      moveTo.current = {
        x: gsap.quickTo(preview, "x", { duration, ease: "power3.out" }),
        y: gsap.quickTo(preview, "y", { duration, ease: "power3.out" }),
      };

      const onMove = (event: PointerEvent) => {
        moveTo.current?.x(event.clientX + 28);
        moveTo.current?.y(event.clientY - 130);
      };

      list.addEventListener("pointermove", onMove, { passive: true });

      /* Cleanup belongs in the function returned to matchMedia.
         context.add() would have run this immediately. */
      return () => {
        list.removeEventListener("pointermove", onMove);
        moveTo.current = null;
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <>
      <ul ref={listRef} className="border-t border-rule-soft">
        {services.map((service, index) => (
          <li
            key={service.id}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setActive(service);
            }}
            onPointerLeave={() => setActive(null)}
            className="group border-b border-rule-soft"
          >
            <div className="flex items-center gap-5 py-5 transition-[padding,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:py-7 lg:group-hover:pl-6">
              {/* Inline still — the hover preview's stand-in on touch. */}
              {service.image ? (
                <div className="relative size-14 shrink-0 overflow-hidden bg-charcoal sm:size-16 lg:hidden">
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

      {/* Cursor preview. Hidden from assistive tech: it repeats the row. */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
      >
        <div
          className="relative h-[17rem] w-[13rem] overflow-hidden bg-charcoal transition-opacity duration-500"
          style={{ opacity: active ? 1 : 0 }}
        >
          {active?.image ? (
            <Image
              src={active.image.src}
              alt=""
              fill
              sizes="208px"
              placeholder={active.image.blurDataURL ? "blur" : "empty"}
              blurDataURL={active.image.blurDataURL}
              className="object-cover"
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
