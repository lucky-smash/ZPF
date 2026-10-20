"use client";

import { useRef } from "react";

import { gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";

/** Desktop with a real mouse only. Touch keeps its native behaviour. */
const FINE_POINTER = "(min-width: 64rem) and (pointer: fine)";

/** Anything the cursor should open up over. */
const INTERACTIVE = "a[href], button:not([disabled]), [role='button'], select";

/** Text fields keep their native I-beam, so the custom cursor stands down. */
const TEXT_FIELD = "input, textarea";

type Mode = "hidden" | "default" | "interactive";

/**
 * The ŹPF cursor: an ivory disc that tracks the pointer, and a ring that
 * trails it and opens into a labelled red frame over anything clickable.
 *
 * What the pointer is over is resolved from its coordinates on every
 * move (coalesced into one hit-test per frame) rather than from
 * pointerover/pointerout bookkeeping, so the visible state can never
 * drift out of sync with where the pointer actually is.
 *
 * The native cursor is only hidden once this one has actually moved. If
 * the component never initialises, never receives a pointer event, or
 * throws on the way up, the system cursor is left alone — the page is
 * never left with no pointer at all.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const mm = gsap.matchMedia();

    mm.add(FINE_POINTER, () => {
      /* Hand the pointer back to the browser, whatever happened. */
      const restoreNativeCursor = () => {
        delete document.body.dataset.cursor;
      };

      try {
        gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

        /* A pointer is not decoration, so it stays — but for anyone who
           asked for reduced motion it snaps rather than trailing.
           quickTo needs a real duration to tween towards; at zero it
           never applies the value, so reduced motion uses a direct
           setter instead and the cursor lands exactly on the pointer. */
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const follow = (el: Element, prop: "x" | "y", duration: number) =>
          duration > 0
            ? gsap.quickTo(el, prop, { duration, ease: "power3.out" })
            : (gsap.quickSetter(el, prop, "px") as (value: number) => void);

        // The disc sits on the pointer; the ring follows a beat behind.
        const dotX = follow(dot, "x", reduced ? 0 : 0.08);
        const dotY = follow(dot, "y", reduced ? 0 : 0.08);
        const ringX = follow(ring, "x", reduced ? 0 : 0.34);
        const ringY = follow(ring, "y", reduced ? 0 : 0.34);

        let started = false;
        let frame = 0;
        let x = 0;
        let y = 0;
        let mode: Mode | null = null;
        let labelText: string | null = null;

        const render = (next: Mode, nextLabel: string) => {
          if (next === mode && nextLabel === labelText) return;

          if (nextLabel !== labelText) {
            label.textContent = nextLabel;
            gsap.to(label, { opacity: nextLabel ? 1 : 0, duration: 0.25 });
            labelText = nextLabel;
          }
          if (next === mode) return;
          mode = next;

          const interactive = next === "interactive";
          gsap.to([dot, ring], {
            opacity: next === "hidden" ? 0 : 1,
            duration: 0.22,
            overwrite: "auto",
          });
          gsap.to(ring, {
            width: interactive ? (nextLabel ? 78 : 46) : 30,
            height: interactive ? (nextLabel ? 78 : 46) : 30,
            borderColor: interactive
              ? "rgb(229, 27, 43)"
              : "rgba(242, 240, 235, 0.45)",
            backgroundColor: interactive
              ? "rgba(229, 27, 43, 0.18)"
              : "rgba(229, 27, 43, 0)",
            duration: 0.42,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to(dot, {
            scale: interactive ? 0 : 1,
            duration: 0.32,
            ease: "power3.out",
            overwrite: "auto",
          });
        };

        /* One hit-test per frame, from the pointer's own coordinates. */
        const sample = () => {
          frame = 0;
          const target = document.elementFromPoint(x, y);

          if (!target) {
            render("hidden", "");
            return;
          }
          if (target.closest(TEXT_FIELD)) {
            render("hidden", "");
            return;
          }
          const hit = target.closest(INTERACTIVE) as HTMLElement | null;
          render(hit ? "interactive" : "default", hit?.dataset.cursorLabel ?? "");
        };

        const onMove = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;

          x = event.clientX;
          y = event.clientY;
          dotX(x);
          dotY(y);
          ringX(x);
          ringY(y);

          /* First real movement proves the cursor works. Only now is it
             safe to take the native pointer away. */
          if (!started) {
            started = true;
            document.body.dataset.cursor = "on";
          }
          if (!frame) frame = requestAnimationFrame(sample);
        };

        /* Leaving the window entirely, and coming back. */
        const onWindowLeave = () => render("hidden", "");
        const onWindowEnter = () => {
          if (started && !frame) frame = requestAnimationFrame(sample);
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onWindowLeave);
        document.documentElement.addEventListener("pointerenter", onWindowEnter);
        /* The page can scroll under a stationary pointer. */
        window.addEventListener("scroll", onWindowEnter, { passive: true });

        /* Returned from the matchMedia callback, GSAP runs this when the
           query stops matching or the component unmounts. context.add()
           would run it immediately — it collects animations, it is not a
           teardown hook. */
        return () => {
          if (frame) cancelAnimationFrame(frame);
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onWindowLeave);
          document.documentElement.removeEventListener("pointerenter", onWindowEnter);
          window.removeEventListener("scroll", onWindowEnter);
          restoreNativeCursor();
        };
      } catch {
        restoreNativeCursor();
        return undefined;
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80] hidden lg:block"
    >
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex size-[30px] items-center justify-center rounded-full border opacity-0"
        style={{ borderColor: "rgba(242, 240, 235, 0.45)" }}
      >
        <span
          ref={labelRef}
          className="slate leading-none text-bone opacity-0"
          style={{
            /* Inline, so there is no argument with the .slate utility
               over which font-size wins at this size. */
            fontSize: "0.5rem",
            letterSpacing: "0.16em",
            textShadow: "0 1px 3px rgba(8,8,8,0.9)",
          }}
        />
      </div>
      {/* The disc carries a dark rim and shadow so it reads on pale
          photography as well as on black. */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 size-[11px] rounded-full bg-bone opacity-0"
        style={{ boxShadow: "0 0 0 1px rgba(8,8,8,0.55), 0 2px 10px rgba(8,8,8,0.6)" }}
      />
    </div>
  );
}
