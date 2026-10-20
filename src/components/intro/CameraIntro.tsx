"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Figure } from "@/components/ui/Figure";
import { hero, intro } from "@/data";
import { ScrollTrigger, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";
import {
  INTRO_DONE_EVENT,
  INTRO_REPLAY_EVENT,
  READY,
  clearIntroSeen,
  introPending,
  markIntroSeen,
} from "@/lib/intro";
import { holdScroll, releaseScroll } from "@/lib/smooth-scroll";
import { RetroCamera } from "./RetroCamera";

/**
 * idle → shutterPressed → flash → filmReveal → websiteRevealed.
 * One value, set in one place, and the only thing the markup keys off.
 */
type Phase = "idle" | "pressed" | "flash" | "film" | "revealed";

/** Where the film's leading edge rides while it feeds out, in viewports. */
const EDGE = 0.9;

/** Where the camera settles once the film is running, in viewports. */
const CAM_REST = 0.23;

/** Phones get the same sequence at a shorter stride. */
const NARROW = "(max-width: 47.99rem)";

/**
 * How long the camera waits, in seconds, before it fires by itself.
 *
 * Long enough to read as a held breath before the shutter — the camera
 * arrives, the cue settles, and then it goes — and short enough that
 * nobody has time to wonder whether the page is still loading. The
 * shutter is still a real control for anyone who reaches for it first.
 */
const AUTO_FIRE = 1.15;

/**
 * THE OPENING SEQUENCE
 *
 * A camera over the homepage. The shutter trips, the flash fires, a
 * strip of film feeds out of the body, travels past six frames, and the
 * last of them — the hero photograph — opens out of its film borders
 * into the hero itself. One timeline, no scrolling, nothing to click.
 *
 * It plays itself: the camera lands, holds for a beat, and fires. The
 * shutter is still a working control for anyone who reaches for it
 * before the beat is up — it just starts the same timeline early —
 * and Skip and Escape leave at any point.
 *
 * It is layered over the existing page rather than replacing it. The
 * homepage is rendered, complete, underneath from the first byte; this
 * only covers it. Three things follow from that, and they are the
 * reason it is built this way:
 *
 *  - With JavaScript off, or if hydration never happens, the overlay is
 *    never displayed and the site is simply the site.
 *  - The hero photograph beneath is the same file as the final film
 *    frame, at the same focal point, so the hand-over is a dissolve
 *    between two identical images — the only visible change is the
 *    headline arriving.
 *  - Nothing is duplicated. The frames, the captions and the hero image
 *    all come from `src/data`.
 *
 * The scroll-driven film roll further down the page is a separate,
 * shorter thing: this is a sequence with a beginning and a payoff, that
 * one is a section you scroll through.
 */
export function CameraIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const camWrapRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  /** Replaying rebuilds the whole thing, rather than rewinding it. */
  const [runId, setRunId] = useState(0);

  /* The two controls the sequence exposes. Held in refs because the
     timeline that owns them is built inside a GSAP context, and React's
     handlers must reach it without re-rendering. */
  const captureRef = useRef<(() => void) | null>(null);
  const skipRef = useRef<(() => void) | null>(null);

  const capture = useCallback(() => captureRef.current?.(), []);
  const skip = useCallback(() => skipRef.current?.(), []);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const reel = reelRef.current;
    const film = filmRef.current;
    const camWrap = camWrapRef.current;
    const heroLayer = heroRef.current;
    if (!root || !reel || !film || !camWrap || !heroLayer) return;

    /* Nothing armed the sequence: a return visit in the same session,
       or the watchdog in the boot script handed the page back. Stand
       down completely — no listeners, no scroll lock, no timeline. */
    if (!introPending()) {
      setPhase("revealed");
      return;
    }

    const html = document.documentElement;
    /* Tells the boot script's watchdog that the sequence is alive, and
       to stop counting. */
    html.dataset.introReady = READY;
    /* Re-asserted rather than inherited. The boot script sets it for
       the window before hydration, but this effect takes it away again
       on every teardown — a replay, or React mounting twice in
       development — and only this can put it back. */
    html.dataset.introLock = "1";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia(NARROW).matches;
    /* One factor sets the stride of the whole sequence. */
    const beat = narrow ? 0.74 : 1;

    window.scrollTo(0, 0);
    holdScroll();

    /* Take the page behind the overlay out of the tab order, so the
       first Tab lands on the shutter and not on a link nobody can see.
       Only what was actually changed is changed back. */
    const held: Element[] = [];
    for (const node of Array.from(document.body.children)) {
      if (node === root || node.tagName === "SCRIPT") continue;
      if (node.hasAttribute("inert")) continue;
      node.setAttribute("inert", "");
      held.push(node);
    }

    let handedOver = false;

    /** The website takes the screen back: scroll, focus, entrances. */
    const release = () => {
      if (handedOver) return;
      handedOver = true;
      delete html.dataset.introLock;
      releaseScroll();
      for (const node of held) node.removeAttribute("inert");
      held.length = 0;
      markIntroSeen();
      /* Held-back entrances — the headline, the navigation, the hero
         buttons — are waiting on this. */
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
    };

    /** And the overlay leaves for good. */
    const settle = () => {
      release();
      delete html.dataset.intro;
      setPhase("revealed");
      /* The page was measured while it was held still. */
      ScrollTrigger.refresh();
    };

    const ctx = gsap.context(() => {
      const dome = root.querySelector<HTMLElement>("[data-cam-dome]");
      const body = root.querySelector<HTMLElement>("[data-cam-body]");
      const blades = root.querySelector<HTMLElement>("[data-cam-blades]");
      const core = root.querySelector<HTMLElement>("[data-cam-core]");
      const bloom = root.querySelector<HTMLElement>("[data-cam-bloom]");
      const lens = root.querySelector<HTMLElement>("[data-cam-lens]");
      const copy = root.querySelectorAll<HTMLElement>("[data-intro-copy]");
      const flash = root.querySelector<HTMLElement>("[data-intro-flash]");
      const veil = root.querySelector<HTMLElement>("[data-intro-veil]");
      const leak = root.querySelector<HTMLElement>("[data-intro-leak]");
      const scrim = root.querySelectorAll<HTMLElement>("[data-intro-scrim]");
      const heroImg = root.querySelector<HTMLElement>("[data-intro-hero-img]");
      const counter = root.querySelector<HTMLElement>("[data-intro-counter]");
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", film);
      const lastCell = cells[cells.length - 1];

      gsap.set(reel, { xPercent: -50, yPercent: -50 });
      /* Scaled from its own top edge, so however far the film is pushed
         in it stays joined to the camera's film slot. */
      gsap.set(film, { xPercent: -50, transformOrigin: "50% 0%" });
      gsap.set(blades, { ["--blade" as string]: 1 });

      /* ---------------------------------------------------------------
         Geometry.

         The reel is one column: camera on top, film hanging from the
         slot. The reel translates; the film scales inside it. Measured
         rather than assumed, so a resize, a font swap or a change to
         --u costs nothing to keep in step.
         --------------------------------------------------------------- */
      const geo = {
        vh: 0,
        camH: 0,
        filmTop: 0,
        stripH: 0,
        scale: 1,
        yStart: 0,
        yEnd: 0,
      };

      const measure = () => {
        geo.vh = window.innerHeight;
        geo.camH = camWrap.offsetHeight;
        geo.filmTop = film.offsetTop;
        geo.stripH = film.offsetHeight;

        /* How far to push in while the film runs, so a frame fills a
           deliberate share of the screen at any viewport. */
        const frameWidth = cells[0]?.offsetWidth || 1;
        const target = narrow
          ? window.innerWidth * 0.9
          : Math.min(window.innerWidth * 0.44, 640);
        geo.scale = gsap.utils.clamp(1, 2.1, target / frameWidth);

        /* The reel's y that puts the camera's centre at CAM_REST. */
        geo.yStart = geo.vh * (CAM_REST - 0.5);
        /* And the y that puts the last frame dead centre. */
        const centre = lastCell
          ? lastCell.offsetTop + lastCell.offsetHeight / 2
          : 0;
        geo.yEnd = geo.camH / 2 - geo.filmTop - centre * geo.scale;
      };

      measure();

      /* ---------------------------------------------------------------
         The film's extension is not a tween of its own. It is derived,
         every frame, from where the reel has travelled to: the leading
         edge is held at EDGE of the viewport, which is what makes the
         strip read as film still feeding out of the body rather than a
         bar whose length happens to be animating.

         `emerge` ramps that relationship in from nothing during Phase A,
         so the film starts at the slot with none of it out.
         --------------------------------------------------------------- */
      const live = { y: 0, scale: 1, emerge: 0 };
      let shown = -1;

      const render = () => {
        gsap.set(reel, { y: live.y });
        gsap.set(film, { scale: live.scale });

        const pinned =
          (geo.vh * EDGE -
            geo.vh / 2 +
            geo.camH / 2 -
            live.y -
            geo.filmTop) /
          (geo.stripH * live.scale);
        const out = gsap.utils.clamp(0, 1, pinned * live.emerge);

        /* Clipped, not resized: no layout work, and the perforations
           keep their pitch however far the strip has come out. */
        film.style.clipPath =
          out > 0.999 ? "none" : `inset(0% 0% ${((1 - out) * 100).toFixed(2)}% 0%)`;

        /* Which frame is in the gate, read back from the same geometry
           rather than from the timeline's clock, so the lit frame is
           always the one actually sitting in the centre. */
        if (!cells.length) return;
        const atCentre = (geo.camH / 2 - live.y - geo.filmTop) / live.scale;
        let near = 0;
        let best = Infinity;
        cells.forEach((cell, index) => {
          const distance = Math.abs(
            cell.offsetTop + cell.offsetHeight / 2 - atCentre,
          );
          if (distance < best) {
            best = distance;
            near = index;
          }
        });
        if (near !== shown) {
          shown = near;
          cells.forEach((cell, index) => {
            cell.dataset.active = String(index === near);
          });
          if (counter) {
            counter.textContent = String(near + 1).padStart(2, "0");
          }
        }
      };

      /** The final frame's real position on screen, for the hand-over. */
      const frameInset = () => {
        if (!lastCell) return "inset(0px 0px 0px 0px)";
        const r = lastCell.getBoundingClientRect();
        const w = window.innerWidth;
        const h = window.innerHeight;
        return `inset(${Math.round(r.top)}px ${Math.round(w - r.right)}px ${Math.round(
          h - r.bottom,
        )}px ${Math.round(r.left)}px)`;
      };

      /* ---------------------------------------------------------------
         THE TIMELINE
         One timeline, built paused, played once. Every phase is placed
         at an absolute position so the ordering is readable here rather
         than inferred from a chain of durations.
         --------------------------------------------------------------- */
      const tl = gsap.timeline({
        paused: true,
        /* Fires on every render of the timeline, so the derived film
           state can never be a frame behind the reel. */
        onUpdate: render,
      });

      if (reduced) {
        /* No flash and no unrolling for anyone who asked for less
           motion: the camera is still the way in, but it hands over in
           one quiet dissolve. */
        tl.call(() => setPhase("flash"), undefined, 0)
          .set(heroLayer, { clipPath: "inset(0px 0px 0px 0px)" }, 0)
          .to(camWrap, { opacity: 0, duration: 0.3 }, 0)
          .to(copy, { opacity: 0, duration: 0.3 }, 0)
          .to(heroLayer, { opacity: 1, duration: 0.45 }, 0.05)
          .to(scrim, { opacity: 1, duration: 0.35 }, 0.2)
          .call(release, undefined, 0.5)
          .to(root, { opacity: 0, duration: 0.3 }, 0.55)
          .call(settle);
      } else {
        const b = beat;

        /* ---- shutterPressed: the dome goes in, the iris shuts ----
           The travel is in the drawing's own units — one SVG user unit
           is one camera unit — rather than in percentages of a
           bounding box, so the release moves by a measured 1.15 units
           into a well that is 1.3 units deep. It is a short, hard
           press with a slow return, which is what a mechanical
           release feels like. */
        tl.call(() => setPhase("pressed"), undefined, 0)
          .to(dome, { y: 1.15, scale: 0.96, duration: 0.08 * b, ease: "power2.in" }, 0)
          .to(dome, { y: 0, scale: 1, duration: 0.3 * b, ease: "power3.out" }, 0.12 * b)
          /* The body takes the press, then settles. */
          .to(body, { y: 0.55, rotate: -0.22, duration: 0.07 * b, ease: "power2.in" }, 0.02 * b)
          .to(body, { y: 0, rotate: 0, duration: 0.5 * b, ease: "elastic.out(1, 0.5)" }, 0.09 * b)
          /* The blades close, kick round, and open again. */
          .to(blades, { ["--blade" as string]: 0, duration: 0.08 * b, ease: "power2.in" }, 0.05 * b)
          .to(blades, { rotate: -9, duration: 0.34 * b, ease: "power2.out" }, 0.05 * b)
          .to(blades, { ["--blade" as string]: 0.98, duration: 0.18 * b, ease: "power2.out" }, 0.15 * b)
          .to(blades, { rotate: 0, duration: 0.55 * b, ease: "power2.out" }, 0.22 * b)
          /* A point of light gathers in the lens before it leaves. */
          .fromTo(
            core,
            { opacity: 0, scale: 0.4 },
            { opacity: 1, scale: 1, duration: 0.14 * b, immediateRender: false },
            0,
          );

        /* ---- flash: once, brief, and centred on the lens ---- */
        const f = 0.17 * b;
        tl.call(() => setPhase("flash"), undefined, f)
          .set(
            flash,
            {
              /* Anchored to where the light actually comes from. */
              ["--fx" as string]: () => {
                if (!lens) return "50%";
                const r = lens.getBoundingClientRect();
                return `${((r.left + r.width / 2) / window.innerWidth) * 100}%`;
              },
              ["--fy" as string]: () => {
                if (!lens) return "50%";
                const r = lens.getBoundingClientRect();
                return `${((r.top + r.height / 2) / window.innerHeight) * 100}%`;
              },
              transformOrigin: "var(--fx) var(--fy)",
              /* The lens is read where it will be when the flash goes,
                 not where it was when the timeline was built. */
              immediateRender: false,
            },
            f,
          )
          .fromTo(
            flash,
            { scale: 0.16, opacity: 0 },
            {
              scale: 2.7,
              opacity: 0.94,
              duration: 0.11 * b,
              ease: "power2.out",
              immediateRender: false,
            },
            f,
          )
          .to(flash, { opacity: 0, duration: 0.44 * b, ease: "power2.in" }, f + 0.13 * b)
          /* A short veil over everything, so the camera is genuinely
             lost in the light for a moment rather than merely lit. */
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 0.52, duration: 0.07 * b, immediateRender: false },
            f + 0.02 * b,
          )
          .to(veil, { opacity: 0, duration: 0.32 * b, ease: "power2.in" }, f + 0.1 * b)
          .fromTo(
            bloom,
            { opacity: 0 },
            { opacity: 1, duration: 0.09 * b, immediateRender: false },
            f,
          )
          .to(bloom, { opacity: 0, duration: 0.42 * b }, f + 0.12 * b)
          .to(core, { opacity: 0, duration: 0.38 * b }, f + 0.14 * b)
          /* The opening titles go with the flash, not after it. */
          .to(copy, { opacity: 0, y: -14, duration: 0.42 * b, stagger: 0.04 * b }, f + 0.05 * b);

        /* ---- filmReveal ---- */
        const d = 0.5 * b;
        tl.call(() => setPhase("film"), undefined, d)
          /* PHASE A — the camera draws back and the film starts out of
             the slot. The strip is still life-size here: it is exactly
             as wide as the slot it is coming through. */
          .to(live, { y: () => geo.yStart, duration: 0.8 * b, ease: "power2.inOut" }, d)
          .to(live, { emerge: 1, duration: 0.72 * b, ease: "power2.out" }, d + 0.3 * b)
          /* PHASE B — and we push in on it as it runs. */
          .to(live, { scale: () => geo.scale, duration: 1.15 * b, ease: "power2.inOut" }, d + 0.45 * b)
          .to(camWrap, { opacity: 0, duration: 0.9 * b, ease: "power2.in" }, d + 1.2 * b)
          /* PHASE C — frames travel through the gate. Slow in and slow
             out, so the first and last frames are given their moment
             and the middle of the strip is genuinely pulled. */
          .to(live, { y: () => geo.yEnd, duration: 2.3 * b, ease: "power2.inOut" }, d + 1.0 * b)
          /* One warm light leak crosses the film, as on real stock. */
          .fromTo(
            leak,
            { xPercent: -130, opacity: 0 },
            {
              xPercent: 130,
              opacity: 1,
              duration: 1.4 * b,
              ease: "none",
              immediateRender: false,
            },
            d + 1.3 * b,
          )
          .to(leak, { opacity: 0, duration: 0.5 * b }, d + 2.3 * b);

        /* ---- PHASE D — the frame becomes the website ---- */
        const o = d + 3.35 * b;
        /* `immediateRender: false` is the whole of this phase working.
           A fromTo renders its "from" the moment it is created, which
           here would measure the final frame while it was still sitting
           in the camera — and the photograph would then open out of a
           rectangle somewhere below the screen. Deferred, the frame is
           measured where it actually is: centred, at the end of the
           travel, a beat before it opens. */
        tl.fromTo(
          heroLayer,
          { clipPath: frameInset },
          {
            /* The photograph grows past its own film borders. */
            clipPath: "inset(0px 0px 0px 0px)",
            duration: 1.05 * b,
            ease: "power3.inOut",
            immediateRender: false,
          },
          o,
        )
          .fromTo(
            heroLayer,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.34 * b,
              ease: "power2.out",
              immediateRender: false,
            },
            o,
          )
          .fromTo(
            heroImg,
            { scale: 1.055 },
            {
              scale: 1,
              duration: 1.35 * b,
              ease: "power2.out",
              immediateRender: false,
            },
            o,
          )
          /* The frame itself keeps opening underneath, so the two are
             moving together at the moment they cross over. */
          .to(lastCell, { scale: 1.1, duration: 0.95 * b, ease: "power2.in" }, o)
          /* The perforations and the physical edges recede. */
          .to(reel, { opacity: 0, duration: 0.55 * b, ease: "power2.in" }, o + 0.22 * b)
          /* The hero's own scrim arrives for the headline to sit on. */
          .to(scrim, { opacity: 1, duration: 0.6 * b, ease: "power2.out" }, o + 0.42 * b)
          /* Scroll, focus and the page's held-back entrances, while the
             overlay is still there to dissolve through. */
          .call(release, undefined, o + 0.8 * b)
          .to(root, { opacity: 0, duration: 0.6 * b, ease: "power2.inOut" }, o + 0.86 * b)
          .call(settle);
      }

      /* Pre-built so skipping creates nothing at click time, which
         keeps it inside this context and out of the way of cleanup. */
      const bail = gsap.timeline({ paused: true });
      bail.to(root, {
        opacity: 0,
        duration: reduced ? 0.001 : 0.32,
        ease: "power2.out",
        onStart: release,
        onComplete: settle,
      });

      /** The pending self-fire, so a press or a skip can call it off. */
      let autoFire: gsap.core.Tween | null = null;

      const start = () => {
        /* Idempotent by construction: the only way in is from a
           playhead that has not left zero. So it does not matter
           whether the clock got here first or the visitor did. */
        if (handedOver || tl.progress() > 0 || tl.isActive()) return;
        autoFire?.kill();
        measure();
        tl.play();
      };

      const bailOut = () => {
        if (handedOver || bail.progress() > 0) return;
        autoFire?.kill();
        tl.pause();
        bail.play();
      };

      captureRef.current = start;
      skipRef.current = bailOut;

      /* Re-measure while the camera is still waiting. Once it is
         running the geometry is committed — remeasuring mid-sequence
         would move the ground under the film. */
      const onResize = () => {
        if (tl.progress() === 0 && !tl.isActive()) {
          measure();
          render();
        }
      };
      window.addEventListener("resize", onResize);

      /* Escape is the keyboard's skip. */
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") bailOut();
      };
      window.addEventListener("keydown", onKeyDown);

      render();

      /* ---------------------------------------------------------------
         The sequence fires itself.

         Pressing the camera still starts the film at once and Escape
         still skips, but nothing waits on either: a visitor who does
         nothing at all gets the whole opening.

         A delayedCall rather than a setTimeout, for two reasons. It
         belongs to this context, so the same revert that tears the
         timeline down takes it with it — a replay or a double mount in
         development cannot leave a stray shutter pending. And it runs
         on GSAP's clock, which does not advance in a hidden tab, so a
         link opened in the background finds the camera still waiting
         instead of having played the film to an empty room.
         --------------------------------------------------------------- */
      autoFire = gsap.delayedCall(reduced ? 0.45 : AUTO_FIRE * beat, start);

      return () => {
        autoFire?.kill();
        window.removeEventListener("resize", onResize);
        window.removeEventListener("keydown", onKeyDown);
      };
    }, root);

    return () => {
      captureRef.current = null;
      skipRef.current = null;
      /* Reverts every tween this context created and every inline
         style they wrote, so a replay starts from the markup again. */
      ctx.revert();
      film.style.clipPath = "";
      for (const node of held) node.removeAttribute("inert");
      delete html.dataset.introLock;
      delete html.dataset.introReady;
      releaseScroll();
    };
  }, [runId]);

  /* The replay control in the footer, or anywhere else, asks for this. */
  useEffect(() => {
    const onReplay = () => {
      const html = document.documentElement;
      clearIntroSeen();
      html.dataset.intro = "armed";
      html.dataset.introLock = "1";
      delete html.dataset.introReady;
      setPhase("idle");
      setRunId((value) => value + 1);
    };
    window.addEventListener(INTRO_REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(INTRO_REPLAY_EVENT, onReplay);
  }, []);

  const running = phase !== "idle";

  return (
    <div ref={rootRef} className="intro-root" data-phase={phase}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${intro.eyebrow} — opening sequence`}
        className="intro-stage"
      >
        {/* ---- The hero, waiting inside the final frame ----
            The same photograph, the same crop and the same scrim as the
            hero below. It is what the last film frame opens into, and
            what the overlay dissolves away over. Decorative: the real
            hero carries the alt text. */}
        <div ref={heroRef} aria-hidden className="intro-hero">
          <div data-intro-hero-img className="h-full w-full">
            <Figure
              asset={hero.image}
              ratio="auto"
              sizes="100vw"
              quality={68}
              alt=""
              className="h-[115%] w-full"
              imageClassName="scale-[1.12]"
              position="50% 42%"
            />
          </div>
          <div
            data-intro-scrim
            className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/15 to-ink opacity-0"
          />
          <div
            data-intro-scrim
            className="absolute inset-0 bg-[radial-gradient(142%_104%_at_50%_34%,transparent_52%,rgba(8,8,8,0.46)_100%)] opacity-0"
          />
        </div>

        {/* ---- Opening titles ---- */}
        <div className="intro-copy">
          <p data-intro-copy className="meta text-ash">
            {intro.eyebrow}
          </p>
          <p
            data-intro-copy
            className="intro-tagline display mt-4 text-bone"
          >
            {intro.tagline}
          </p>
        </div>

        {/* ---- The camera, and the film hanging from its slot ---- */}
        <div ref={reelRef} className="intro-reel">
          <div ref={camWrapRef} className="intro-cam">
            <RetroCamera onCapture={capture} disabled={running} />
          </div>

          <div ref={filmRef} aria-hidden className="intro-film">
            <div className="film-strip intro-strip">
              <ol className="intro-strip-track">
                {intro.frames.map((frame, index) => (
                  <li key={frame.id} className="intro-frame">
                    <span data-cell className="intro-cell">
                      <span className="intro-cell-edge">
                        <span>
                          ŹPF · {String(index + 1).padStart(3, "0")}
                        </span>
                        <span>{intro.stock}</span>
                      </span>
                      <Figure
                        asset={frame.image}
                        ratio="16 / 9"
                        sizes="(max-width: 48rem) 92vw, 46vw"
                        quality={70}
                        alt=""
                        className="intro-cell-gate"
                        position={frame.focal ?? "center"}
                      />
                      <span className="intro-cell-label">
                        <span className="intro-cell-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span aria-hidden className="intro-cell-dash" />
                        {frame.caption}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* ---- The light ---- */}
        <div data-intro-leak aria-hidden className="intro-leak" />
        <div data-intro-flash aria-hidden className="intro-flash" />
        <div data-intro-veil aria-hidden className="intro-veil" />

        {/* The sequence carries the site's own grain, so the film and
            the page are the same surface. */}
        <div aria-hidden className="grain-layer intro-grain" />

        {/* ---- Framing marks and the frame counter ---- */}
        <div aria-hidden className="intro-marks">
          <span />
          <span />
          <span />
          <span />
        </div>
        <p aria-hidden className="intro-counter">
          <span data-intro-counter>01</span>
          <span className="text-ash">
            {" / "}
            {String(intro.frames.length).padStart(2, "0")}
          </span>
        </p>

        {/* ---- Skip. Always reachable, first in the tab order after
                the shutter, and never hidden behind a hover. ---- */}
        <button
          type="button"
          onClick={skip}
          data-cursor-label="Skip"
          className="intro-skip meta"
        >
          {intro.skip}
          <span aria-hidden>→</span>
        </button>

        <p role="status" aria-live="polite" className="sr-only">
          {phase === "idle"
            ? ""
            : phase === "revealed"
              ? "The film has opened. The website is ready."
              : "Capturing. The film is opening."}
        </p>
      </div>
    </div>
  );
}
