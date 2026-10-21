"use client";

import { useRef, type ReactNode } from "react";

import { MOTION_OK, ScrollTrigger, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";

/**
 * SCENE 01 — THE OPENING STAGE
 *
 * The frame that holds the window while the first shot resolves.
 *
 * Everything in it is scrubbed from the scroll position rather than
 * played on a clock: there is no moment where the page is animating at
 * the visitor instead of with them, and scrolling back up plays the
 * shot backwards exactly as it played forwards.
 *
 * The depth is real, not faked. There is no cut-out foreground in this
 * photograph and none has been invented — the separation comes from
 * two planes moving at opposite rates. The sky pushes in and drifts
 * *down*; the type rises and leaves. That is the whole of it, and it
 * is enough, because the eye reads opposing motion as distance long
 * before it reads a parallax offset.
 *
 * The shot ends on a gate. The photograph letterboxes into a slot as
 * the frame hands over, which is the site's own motif — the opening
 * sequence is a shutter, the film roll runs through a gate — and it
 * means the hero leaves on a live picture rather than on a rectangle
 * of black.
 *
 * WHAT IT COSTS
 *
 * One stage is one extra scroll distance, written in `--hero-travel`
 * and spent entirely on the beats below. It is zero unless this
 * component is running: a visitor with no JavaScript, or one who asked
 * for less motion, gets the hero as a single still frame in normal
 * flow and is not asked to scroll through a shot that is not playing.
 *
 * Phones get the same shot without the stage. The hero leaving the
 * window is already a scroll distance the page was spending, so the
 * choreography is hung on that instead — no sticky frame, no extra
 * scrolling, one layer fewer.
 */

/** Wide enough to hold the frame still while the shot plays. */
const HELD = "(min-width: 48rem)";

/** Wide enough for the full shot rather than the restrained one. */
const WIDE = "(min-width: 64rem)";

/**
 * How far the frame is held, in viewport heights, and how far the sky
 * pushes in while it is.
 *
 * The travel is a fraction of the window, so the taller the window the
 * more pixels it is — and a tablet held in portrait has a very tall
 * window. Left at the desktop figure it would ask for close to a
 * thousand pixels of scrolling to play a shot that resolves in six
 * hundred, so the narrower band gets the shorter hold and the smaller
 * push, which is also what keeps the subject of the photograph inside
 * the frame on a screen that is nothing like the shape it was cropped
 * for.
 */
const SHOT = {
  wide: { travel: 0.82, push: 1.18 },
  tablet: { travel: 0.58, push: 1.11 },
};

/**
 * Where each beat sits in the shot, as [start, end] fractions of it.
 *
 * `held` plays the whole shot inside a frame that is not moving.
 * `loose` plays it as the hero scrolls away under its own weight, so
 * every beat starts later — the copy must still be readable while the
 * photograph is half on screen — and the gate, one layer too many on a
 * small screen, is left out.
 */
const BEATS = {
  held: {
    chrome: [0, 0.16],
    copy: [0.06, 0.58],
    line: [0.04, 0.6],
    gate: [0.5, 1],
    veil: [0.52, 0.97],
  },
  loose: {
    chrome: [0, 0.2],
    copy: [0.24, 0.88],
    line: [0.22, 0.9],
    gate: null,
    veil: [0.44, 1],
  },
} as const;

export function HeroStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const stage = ref.current;
    if (!stage) return;

    const find = (name: string) =>
      stage.querySelector<HTMLElement>(`[data-hero-${name}]`);

    const backdrop = find("backdrop");
    const plate = find("plate");
    const copy = find("copy");
    const near = find("near");
    const headline = find("headline");
    const veil = find("veil");
    if (!backdrop || !plate || !copy || !near || !headline || !veil) return;

    const chrome = gsap.utils.toArray<HTMLElement>("[data-hero-chrome]", stage);

    const mm = gsap.matchMedia();

    /* The shot, written once. Holding the frame changes where the
       scroll comes from and how the beats are spaced — not what
       happens in them. */
    const shoot = (held: boolean, push: number) => {
      const beat = held ? BEATS.held : BEATS.loose;
      const span = ([from, to]: readonly [number, number]) => to - from;

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          /* Held: the stage's own travel, which is exactly how far the
             frame is stuck for. Loose: the hero simply leaving. */
          end: held ? "bottom bottom" : "bottom top",
          /* Lenis has already smoothed the value feeding this, so the
             scrub is a light touch on top rather than the smoothing. */
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      timeline
        /* The push-in. It runs for the whole shot and never stops, so
           there is no frame of the opening in which nothing moves. */
        .fromTo(
          plate,
          { scale: 1, yPercent: 0 },
          { scale: push, yPercent: 6, duration: 1, force3D: true },
          0,
        )
        /* The chrome goes first. The location line and the scroll cue
           have said what they had to say the moment the page moves. */
        .to(
          chrome,
          { autoAlpha: 0, y: -12, duration: span(beat.chrome) },
          beat.chrome[0],
        )
        /* The statement leaves as one block, so the composition holds
           together on its way out instead of coming apart.

           autoAlpha, not opacity: it takes the visibility with it, and
           a statement that has left the shot must take its two buttons
           out of the tab order with it. A control at zero opacity is
           still focusable, and a sticky frame does not scroll to bring
           it back — so without this, tabbing into a hero that had
           finished playing would put the focus ring on nothing. */
        .to(
          copy,
          { yPercent: -9, autoAlpha: 0, duration: span(beat.copy) },
          beat.copy[0],
        )
        /* The headline pulls a little further and closes down as it
           goes — the one differential inside the foreground, and what
           keeps it from reading as a single pane sliding away. */
        .to(
          headline,
          { yPercent: -8, scale: 0.95, duration: span(beat.line) },
          beat.line[0],
        )
        /* The frame falls off behind the type. Never to black: the sky
           is still there at the cut, which is what makes this a
           dissolve rather than a fade-out followed by a section. */
        .fromTo(
          veil,
          { opacity: 0 },
          { opacity: 0.46, duration: span(beat.veil) },
          beat.veil[0],
        );

      if (beat.gate) {
        /* The gate closing on the photograph. */
        timeline.fromTo(
          backdrop,
          { clipPath: "inset(0% 0%)" },
          { clipPath: "inset(24% 0%)", duration: span(beat.gate) },
          beat.gate[0],
        );
      }
    };

    /* One callback for all three readings of the window, so there is a
       single place that decides what the opening is and a single
       teardown for it. GSAP reverts and re-runs it whenever any of the
       three queries changes, which is what keeps a window dragged
       across a breakpoint honest. */
    mm.add({ motion: MOTION_OK, held: HELD, wide: WIDE }, (context) => {
      const { motion, held, wide } = context.conditions as Record<string, boolean>;
      /* Asked for less motion: the hero is one still photograph in
         normal flow, which is what was asked for. */
      if (!motion) return;

      if (!held) {
        shoot(false, SHOT.tablet.push);
        return;
      }

      const shot = wide ? SHOT.wide : SHOT.tablet;
      stage.style.setProperty("--hero-travel", `${Math.round(shot.travel * 100)}svh`);
      stage.dataset.stage = "on";
      shoot(true, shot.push);

      /* The stage has just made the page taller, and every trigger
         below it was measured against the old height. One refresh on
         the next frame, once, rather than a listener that fires for
         the life of the page. */
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(id);
        stage.style.removeProperty("--hero-travel");
        delete stage.dataset.stage;
      };
    });

    /* Pointer depth, near plane. The sky behind it has answered the
       cursor since it was built, and moves the other way — see
       HeroSky. This is the layer in front, so it moves less, and the
       two together are what give a flat photograph a front and a back.
       Fine pointers only, and never on the element the scroll timeline
       is transforming: one element, one owner. */
    mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
      const moveX = gsap.quickTo(near, "x", { duration: 1.6, ease: "power3.out" });
      const moveY = gsap.quickTo(near, "y", { duration: 1.6, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        /* Single figures of pixels, against the sky's own drift. */
        moveX((event.clientX / window.innerWidth - 0.5) * 10);
        moveY((event.clientY / window.innerHeight - 0.5) * 7);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="hero-stage">
      {children}
    </section>
  );
}
