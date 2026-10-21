"use client";

import { useRef } from "react";

import { Figure } from "@/components/ui/Figure";
import { filmRoll } from "@/data";
import { MOTION_OK, ScrollTrigger, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";

/** The pinned sequence runs on wide screens only. */
const DESKTOP = "(min-width: 64rem)";

/* Timeline layout, in arbitrary units. Phase B gets the bulk of it.
   Deliberately tighter than the opening sequence: that one is the
   signature — a click, a flash, a film that unrolls and becomes the
   site. This is the section you scroll through on the way to the work,
   and nobody should have to sit through two long films to reach it. */
const PHASE_A = 0.9; // leaving the previous section, strip enters
const PHASE_B = 4.4; // the film travels through the gate
const PHASE_C = 1.5; // the final frame opens out

/* How far the page scrolls, in viewport heights, while the section is
   pinned — phases B and C.

   Phase A is deliberately not in it. A pin cannot engage until the
   section's top reaches the top of the window, so anything keyed to it
   leaves the whole approach — a full window of scrolling — showing an
   empty 100vh stage: the previous section slides off the top and
   nothing arrives behind it. Phase A runs on the approach instead, and
   the pin is shortened by exactly its share of the timeline, so
   everything that is still pinned scrubs at the rate it always did. */
const PINNED_SCROLL = (2.4 * (PHASE_B + PHASE_C)) / (PHASE_A + PHASE_B + PHASE_C);

/**
 * SECTION 3B — INSIDE THE FRAME
 *
 * A strip of film that moves with the scroll. Frames arrive at the
 * centre one at a time, and the last one opens out into the first
 * project in Selected Work.
 *
 * Not to be confused with the opening sequence, which is a click-driven
 * timeline that ends in the hero — see components/intro/CameraIntro.
 * This is scroll-driven and bridges into the work. They share the
 * perforation drawing in globals.css and the frame captions in
 * src/data, and nothing else.
 *
 * Desktop with motion allowed gets the pinned, scroll-scrubbed
 * sequence. Everywhere else — phones, tablets, and anyone who asked for
 * reduced motion — the same markup is simply a tall, readable strip in
 * normal document flow, with every caption visible. There is no second
 * implementation to keep in step.
 */
export function FilmRoll() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const rollRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const leakRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const roll = rollRef.current;
    const strip = stripRef.current;
    if (!section || !pin || !roll || !strip) return;

    const mm = gsap.matchMedia();

    mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
      const frames = gsap.utils.toArray<HTMLElement>("[data-frame]", strip);
      if (frames.length === 0) return;

      const count = frames.length;
      let active = -1;

      /* Measured, not hard-coded, so the sequence survives a resize or a
         change to the frame size in CSS. */
      const list = strip.querySelector("ol");

      /* Pad the strip so the first and last frames can sit dead centre
         of the gate. Derived from the frame's real height, so a change
         to the frame ratio or strip width needs no constant updating. */
      const centreGate = () => {
        if (!list) return;
        const pad = Math.max(0, (window.innerHeight - frames[0].offsetHeight) / 2);
        list.style.paddingTop = `${pad}px`;
        list.style.paddingBottom = `${pad}px`;
      };

      const metrics = () => ({
        travel: frames[count - 1].offsetTop - frames[0].offsetTop,
        frameHeight: frames[0].offsetHeight,
      });

      centreGate();
      section.dataset.mode = "pinned";

      const setActive = (index: number) => {
        if (index === active) return;
        active = index;
        frames.forEach((frame, i) => {
          frame.dataset.active = String(i === index);
        });
        if (counterRef.current) {
          counterRef.current.textContent = String(index + 1).padStart(2, "0");
        }
      };

      /* ---- Phase A — leaving the previous section ----------------
         Scrubbed across the approach: the section rises into the
         window, and the strip rises and fades up inside it as it
         comes. By the time the top edge reaches the top of the window
         — the instant the pin takes over — the film is standing in the
         gate, which is exactly the state phase B starts from. */
      const entrance = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      entrance
        .fromTo(
          roll,
          { yPercent: 38, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: PHASE_A },
          0,
        )
        .fromTo(
          labelRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: PHASE_A * 0.7 },
          PHASE_A * 0.25,
        )
        /* A single warm light leak passes over the film as it arrives. */
        .fromTo(
          leakRef.current,
          { xPercent: -130, opacity: 0 },
          { xPercent: 130, opacity: 1, duration: PHASE_A * 1.5 },
          PHASE_A * 0.35,
        )
        .to(leakRef.current, { opacity: 0, duration: PHASE_A * 0.5 }, PHASE_A * 1.4);

      /* Read back inside onUpdate: the timeline's real duration is set
         by its last tween, not by TOTAL, and scrub makes its time lag
         the scroll. Driving the active frame from the timeline's own
         clock keeps the highlight exactly in step with the strip. */
      const clock: { tl?: gsap.core.Timeline } = {};

      clock.tl = gsap.timeline({
        defaults: { ease: "none" },
        /* Fires on every render of the timeline, including while scrub
           is still catching up, so the highlighted frame is always the
           one actually sitting in the gate. */
        onUpdate: () => {
          const time = clock.tl?.time() ?? 0;
          const progress = gsap.utils.clamp(0, 1, time / PHASE_B);
          setActive(Math.round(progress * (count - 1)));
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * PINNED_SCROLL}`,
          pin: pin,
          pinSpacing: true,
          anticipatePin: 1,
          /* Lenis already smooths the scroll value feeding this, so the
             scrub only needs a light touch on top. */
          scrub: 0.5,
          invalidateOnRefresh: true,
          /* Re-centre before anything is measured on a refresh. */
          onRefreshInit: centreGate,
        },
      });

      const timeline = clock.tl;

      /* ---- Phase B — the film travels through the gate ---- */
      timeline.fromTo(
        strip,
        { y: 0 },
        { y: () => -metrics().travel, duration: PHASE_B, force3D: true },
        0,
      );

      /* ---- Phase C — the last frame opens out ---- */
      const cStart = PHASE_B;

      timeline
        /* The strip recedes as the final image takes over. */
        .to(strip, { opacity: 0, duration: PHASE_C * 0.55 }, cStart + PHASE_C * 0.1)
        .to(labelRef.current, { opacity: 0, duration: PHASE_C * 0.3 }, cStart)
        /* Hold the overlay hidden until Phase C. A fromTo immediately
           renders its "from" state when the tween is created, so
           without this the clipped window — frame-sized, dead centre —
           would sit over the gate for the whole sequence. */
        .fromTo(
          finalRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.001 },
          cStart,
        )
        .fromTo(
          finalRef.current,
          {
            /* Starts exactly the size of a frame in the gate, so the
               image appears to be the frame itself opening up. */
            clipPath: () => {
              const { frameHeight } = metrics();
              const inset = Math.max(
                0,
                Math.round((window.innerHeight - frameHeight) / 2),
              );
              const side = Math.max(
                0,
                Math.round((window.innerWidth - strip.offsetWidth) / 2 + 38),
              );
              return `inset(${inset}px ${side}px)`;
            },
          },
          {
            clipPath: "inset(0px 0px)",
            duration: PHASE_C * 0.8,
          },
          cStart,
        )
        .fromTo(
          outroRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: PHASE_C * 0.4 },
          cStart + PHASE_C * 0.55,
        );

      /* Images settle after the triggers are built; remeasure once. */
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);

      return () => {
        window.removeEventListener("load", onLoad);
        delete section.dataset.mode;
        frames.forEach((frame) => delete frame.dataset.active);
        if (list) {
          list.style.paddingTop = "";
          list.style.paddingBottom = "";
        }
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Inside the frame"
      className="relative bg-ink"
    >
      <div ref={pinRef} className="film-stage relative">
        <div
          aria-hidden
          className="film-curtain film-pinned-only pointer-events-none absolute inset-x-0 top-0 z-20 h-40"
        />
        {/* Chapter label */}
        <div
          ref={labelRef}
          className="film-label shell flex items-center gap-4 pt-16"
        >
          <span aria-hidden className="h-px w-10 bg-signal" />
          <h2 className="meta text-bone">{filmRoll.label}</h2>
          <span aria-hidden className="hidden h-px flex-1 bg-rule-soft lg:block" />
          <span className="meta hidden text-ash lg:block">
            <span ref={counterRef} className="text-bone">
              01
            </span>
            {" / "}
            {String(filmRoll.frames.length).padStart(2, "0")}
          </span>
        </div>

        {/* The strip */}
        <div
          ref={rollRef}
          className="film-roll-wrap mt-10 flex justify-center"
        >
          <div
            ref={stripRef}
            className="film-strip relative w-full max-w-[36rem] py-8 lg:w-[46rem] lg:max-w-none lg:py-0"
            /* On desktop the first frame starts centred in the gate. */
            style={{ ["--gate" as string]: "1" }}
          >
            <ol className="film-gate-track">
              {filmRoll.frames.map((frame, index) => (
                <li
                  key={frame.id}
                  data-frame
                  className="film-frame relative mb-6 last:mb-0 lg:mb-10"
                >
                  <div className="film-gate">
                    {/* Edge markings, as on real film stock */}
                    <div className="mb-2 flex items-baseline justify-between px-1">
                      <span className="meta text-[0.55rem] text-ash/70">
                        ŹPF · {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="meta text-[0.55rem] text-ash/40">35MM</span>
                    </div>

                    <Figure
                      asset={frame.image}
                      ratio="16 / 9"
                      sizes="(max-width: 64rem) 90vw, 36rem"
                      quality={70}
                      className="border border-white/10"
                      position={frame.focal ?? "center"}
                    />
                  </div>

                  {/* Caption: beside the gate on desktop, beneath the
                      frame on touch, where it is always readable. */}
                  <div className="film-caption mt-3">
                    <p className="meta text-signal">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="display mt-1 text-xl text-bone lg:text-2xl">
                      {frame.caption}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Warm light leak, desktop sequence only */}
        <div
          ref={leakRef}
          aria-hidden
          className="film-pinned-only pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-0"
          style={{
            background:
              "linear-gradient(100deg, transparent, rgba(197,154,105,0.26) 45%, rgba(242,240,235,0.12) 60%, transparent)",
          }}
        />

        {/* Phase C — the final frame opens into the work. Decorative: the
            same photograph opens Selected Work directly below. */}
        <div
          ref={finalRef}
          aria-hidden
          className="film-pinned-only pointer-events-none absolute inset-0 z-10 opacity-0"
          style={{ clipPath: "inset(50% 50%)" }}
        >
          <Figure
            asset={filmRoll.frames[filmRoll.frames.length - 1].image}
            ratio="auto"
            sizes="100vw"
            quality={70}
            className="h-full w-full"
            position="50% 42%"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/50"
          />
          <div ref={outroRef} className="shell absolute inset-x-0 bottom-16 opacity-0">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-10 bg-signal" />
              <p className="meta text-bone">{filmRoll.outro}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
