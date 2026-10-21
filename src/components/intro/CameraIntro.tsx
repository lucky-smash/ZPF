"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

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
import { type CameraRig, createCameraRig, supportsWebGL } from "./CameraRig";
import { RetroCamera } from "./RetroCamera";

/**
 * The shot the sequence is in. One value, set in one place, and the
 * only thing the markup keys off.
 *
 *   reveal  the camera comes up out of the dark
 *   turn    it rotates to show the body and the barrel
 *   push    the lens comes at the viewer
 *   fire    the shutter, and the light
 */
type Phase = "idle" | "reveal" | "turn" | "push" | "fire" | "revealed";

/** Phones get the same sequence at a shorter stride. */
const NARROW = "(max-width: 47.99rem)";

/**
 * How long the camera stands there before the sequence begins, in
 * seconds. Long enough to read as a held breath, short enough that
 * nobody wonders whether the page is still loading.
 */
const HOLD = 0.35;

/**
 * THE OPENING SEQUENCE
 * ------------------------------------------------------------------
 * A rendered camera on a dark stage. Six shots:
 *
 *   A  the room comes up around it — exposure, key, fill, rim
 *   B  it turns, and the studio sweeps across the metal
 *   C  the lens comes at the viewer, field of view closing with it
 *   D  the shutter: the iris snaps shut and the body recoils
 *   E  the flash, out of the front element and nowhere else
 *   F  the homepage, already behind the light
 *
 * One timeline, no scrolling, nothing to click. Skip and Escape leave
 * at any point.
 *
 * ------------------------------------------------------------------
 * HOW IT IS LAYERED, AND WHY
 * ------------------------------------------------------------------
 * It covers the existing page rather than replacing it. The homepage
 * is rendered, complete, underneath from the first byte. Three things
 * follow, and they are the reason it is built this way:
 *
 *  - With JavaScript off, or if hydration never happens, the overlay
 *    is never displayed and the site is simply the site.
 *  - The photograph the flash resolves into is the hero's own file, at
 *    the hero's own crop and scrim, so the hand-over is a dissolve
 *    between two identical images. The only visible change is the
 *    headline arriving.
 *  - Nothing is duplicated. The copy and the image come from
 *    `src/data`.
 *
 * ------------------------------------------------------------------
 * WHO WRITES WHAT
 * ------------------------------------------------------------------
 * GSAP owns `rig.state` — a flat bag of numbers: orbit, elevation,
 * distance, the push, the three lights, the iris, the recoil, the
 * exposure. A separate render loop reads those once per frame and
 * integrates them into transforms. So there is one writer per value
 * and no second loop overwriting what the timeline just set, which is
 * the same division of labour the sky flight downstream uses.
 *
 * The loop runs whether or not the timeline is playing, which is what
 * keeps the camera a lit object in a room rather than a still that
 * starts moving: there is a fraction of a degree of sway on it the
 * whole time, and it is never perfectly still even while it waits.
 *
 * ------------------------------------------------------------------
 * WHAT HAPPENS WHEN IT CANNOT RUN
 * ------------------------------------------------------------------
 *  - Reduced motion: no sequence. The page is handed over on the first
 *    frame, and nobody is shown a camera they did not ask to watch.
 *  - No WebGL context: the drawn SVG camera is held for a beat and
 *    flashed through — the same shutter, in two shots instead of six.
 *  - A context lost mid-sequence: the sequence ends immediately and
 *    the website takes the screen. A frozen canvas is never left over
 *    the page.
 */
export function CameraIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const stillRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  /** Replaying rebuilds the whole thing, rather than rewinding it. */
  const [runId, setRunId] = useState(0);

  /**
   * Whether this browser can give a graphics context — and therefore
   * which camera is in the markup, the rendered one or the drawn one.
   *
   * It cannot be a call during render, because the answer differs
   * between the server and the browser: there is no `document` to
   * probe on the server, so a render-time call says "no WebGL" there
   * and "yes" here, and React rightly refuses to reconcile two
   * different trees.
   *
   * `useSyncExternalStore` is the primitive for exactly that — a
   * value that only the browser can know. It hydrates against the
   * server snapshot (`null`, which renders neither camera), then
   * re-renders with the real one. No mismatch, and no state written
   * from inside an effect.
   *
   * Nothing is lost in that extra commit. The overlay is
   * `display: none` until the boot script's attribute says otherwise,
   * the scroll was locked before the first paint, and the photograph
   * the sequence resolves into is in the markup from the first byte
   * either way.
   */
  const hasGL = useSyncExternalStore<boolean | null>(
    neverChanges,
    () => supportsWebGL(),
    () => null,
  );

  /* The one control the sequence exposes. Held in a ref because the
     timeline that owns it is built inside a GSAP context, and React's
     handler must reach it without re-rendering. */
  /* Still held, because Escape and the watchdog both reach for it.
     Only the button that used to call it is gone. */
  const skipRef = useRef<(() => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    /* Still waiting to know which camera is in the markup. */
    if (hasGL === null) return;

    const root = rootRef.current;
    const host = canvasRef.current;
    const heroLayer = heroRef.current;
    if (!root || !host || !heroLayer) return;

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
    const beat = narrow ? 0.76 : 1;

    window.scrollTo(0, 0);
    holdScroll();

    /* Take the page behind the overlay out of the tab order, so the
       first Tab lands on Skip and not on a link nobody can see. Only
       what was actually changed is changed back. */
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

    /* Someone who asked for less motion is not shown a camera at all.
       Not a shortened sequence — an opening title is exactly the kind
       of thing the preference is about. */
    if (reduced) {
      settle();
      return () => {
        for (const node of held) node.removeAttribute("inert");
        delete html.dataset.introLock;
        delete html.dataset.introReady;
        releaseScroll();
      };
    }

    /* ---------------------------------------------------------------
       THE SCENE

       Built before the timeline, because the timeline's targets are
       its state object. If a context cannot be had, `rig` stays null
       and the fallback below runs the short sequence over the drawn
       camera instead.
       --------------------------------------------------------------- */
    let rig: CameraRig | null = null;

    if (hasGL) {
      try {
        rig = createCameraRig({
          width: host.clientWidth || window.innerWidth,
          height: host.clientHeight || window.innerHeight,
          /* A phone renders the same scene without the shadow map, at
             a lower pixel ratio and with coarser lathes. The object is
             a third of the size on screen and the saving is most of
             the cost. */
          lean: narrow,
        });
        host.appendChild(rig.canvas);
      } catch {
        rig = null;
      }
    }

    const liveRig = rig;

    /* ---- THE RENDER LOOP ------------------------------------------
       Independent of the timeline, and running from the first frame.
       Stopped when the tab goes away, so a sequence opened in a
       background tab is not rendering to nobody. GSAP's own ticker
       stops there too, so the timeline and the loop come back in step
       rather than the timeline having played on without the picture.
       --------------------------------------------------------------- */
    let frame = 0;
    let looping = false;

    const tick = (time: number) => {
      liveRig?.render(time);
      frame = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (looping || !liveRig) return;
      looping = true;
      frame = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (!looping) return;
      looping = false;
      cancelAnimationFrame(frame);
    };

    const ctx = gsap.context(() => {
      const copy = root.querySelectorAll<HTMLElement>("[data-intro-copy]");
      const finder = root.querySelector<HTMLElement>("[data-intro-finder]");
      const flash = root.querySelector<HTMLElement>("[data-intro-flash]");
      const veil = root.querySelector<HTMLElement>("[data-intro-veil]");
      const leak = root.querySelector<HTMLElement>("[data-intro-leak]");
      const scrims = root.querySelectorAll<HTMLElement>("[data-intro-scrim]");
      const heroImg = root.querySelector<HTMLElement>("[data-intro-hero-img]");
      const readPct = root.querySelector<HTMLElement>("[data-read-pct]");
      const readStop = root.querySelector<HTMLElement>("[data-read-stop]");
      const still = stillRef.current;

      /* ---------------------------------------------------------------
         RELOAD VARIATION

         Small and bounded. The brief for this is "repeated visits
         should not feel mechanical", and the trap is that a random
         camera angle is a random composition — most of them worse than
         the one that was designed. So what varies is a few degrees of
         bearing, a couple of degrees of elevation and a fraction of a
         second of hold: enough that two reloads are visibly not the
         same take, never enough to put the camera somewhere it was not
         art-directed to be.
         --------------------------------------------------------------- */
      const vary = (spread: number) => (Math.random() - 0.5) * 2 * spread;
      const openOrbit = -36 + vary(7);
      const openElevation = 14 + vary(2.5);
      const turnTo = 11 + vary(5);

      /* ---------------------------------------------------------------
         THE FALLBACK — no graphics context

         Two shots over the drawn camera: it comes up, and the shutter
         fires through it. Short on purpose. Nobody should wait on a
         sequence that cannot be the sequence.
         --------------------------------------------------------------- */
      if (!liveRig) {
        const tlFlat = gsap.timeline({ paused: true });
        gsap.set(still, { opacity: 0, scale: 0.94 });
        gsap.set(finder, { opacity: 0 });

        tlFlat
          .call(() => setPhase("reveal"))
          .to(still, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" })
          .to(finder, { opacity: 1, duration: 0.7 }, 0.2)
          .to(copy, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.3)
          .call(() => setPhase("fire"), undefined, 1.5)
          .set(flash, { ["--fx" as string]: "50%", ["--fy" as string]: "46%" }, 1.5)
          .to(flash, { opacity: 1, duration: 0.1, ease: "none" }, 1.5)
          .to([copy, finder, still], { opacity: 0, duration: 0.3 }, 1.55)
          .to(heroLayer, { opacity: 1, duration: 0.3 }, 1.56)
          .to(scrims, { opacity: 1, duration: 0.5 }, 1.6)
          .to(flash, { opacity: 0, duration: 0.5, ease: "power2.in" }, 1.6)
          .to(root, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onStart: release,
            onComplete: settle,
          }, 2.0);

        gsap.set(copy, { opacity: 0, y: 14 });
        skipRef.current = () => {
          if (handedOver) return;
          tlFlat.pause();
          settle();
        };
        gsap.delayedCall(0.2, () => tlFlat.play());
        return;
      }

      const state = liveRig.state;

      /* The opening pose, written before the first frame is rendered so
         nothing is ever seen from the wrong place. */
      Object.assign(state, {
        orbit: openOrbit,
        elevation: openElevation,
        distance: 64,
        push: 0,
        fov: 34,
        key: 0,
        fill: 0,
        rim: 0,
        iris: 1,
        kick: 0,
        exposure: 0,
        bloom: 0,
      });

      gsap.set(copy, { opacity: 0, y: 16 });
      gsap.set(finder, { opacity: 0 });
      gsap.set(heroImg, { scale: 1.07 });

      /* Pay for every shader before the first beat rather than during
         it — see `warm` in CameraRig. The pose above is already set,
         so the frame this renders is the frame the sequence opens on. */
      liveRig.warm();

      startLoop();

      /* ---------------------------------------------------------------
         THE TIMELINE

         Built paused and played once. Every shot is placed at an
         absolute time, in seconds × beat, so the whole sequence can be
         read down the page as a shot list and retimed by moving one
         number.
         --------------------------------------------------------------- */
      const t = (seconds: number) => seconds * beat;
      const tl = gsap.timeline({ paused: true });

      /* ---- SHOT A — the room comes up around the camera ------------
         The object is in position from the first frame; what changes
         is the light on it. Exposure, then the key, then the fill and
         the rim — in that order, because a key arriving before there
         is any exposure to carry it is just a grey object appearing.

         The dolly is slow and small, 58cm to 44. It is the shot
         settling, not a move the viewer is meant to notice. */
      tl.call(() => setPhase("reveal"), undefined, 0)
        .to(state, { exposure: 1.48, duration: 1.2, ease: "power2.inOut" }, 0)
        .to(state, { key: 1, duration: 1.15, ease: "power2.out" }, 0.08)
        .to(state, { fill: 1, duration: 1.2, ease: "power1.out" }, 0.26)
        .to(state, { rim: 1, duration: 1.3, ease: "power2.out" }, 0.38)
        .to(state, { bloom: 0.34, duration: 1.2, ease: "power1.out" }, 0.45)
        .to(state, { distance: 50, duration: 1.8, ease: "power2.out" }, 0)
        .to(finder, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0.35)
        .to(copy, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
        }, 0.45)
        /* The stray beam across the stage — the room has a light in
           it, and this is the one moment it is visible as a beam
           rather than as a highlight. */
        .fromTo(
          leak,
          { opacity: 0, xPercent: -30 },
          { opacity: 0.5, xPercent: 95, duration: 2, ease: "power1.inOut" },
          0.25,
        )
        .to(leak, { opacity: 0, duration: 0.7, ease: "power2.in" }, 1.9);

      /* ---- SHOT B — the turn ---------------------------------------
         Forty-odd degrees, eased in and out, so it arrives and departs
         at rest: a controlled reveal rather than a turntable. The
         elevation comes down with it, which is what makes the barrel
         stop being seen from above and start being pointed at the
         viewer.

         This is the shot the knurling and the bevels are for — the
         studio sweeps across the focus ring's ridges and down the top
         plate's chamfer, and what the viewer reads out of that is the
         material. */
      const B = t(1.4);
      tl.call(() => setPhase("turn"), undefined, B)
        .to(state, {
          orbit: turnTo,
          duration: t(1.85),
          ease: "power1.inOut",
        }, B)
        .to(state, {
          elevation: 6.5,
          duration: t(1.85),
          ease: "power1.inOut",
        }, B)
        .to(state, { distance: 45, duration: t(1.85), ease: "sine.inOut" }, B);

      /* ---- SHOT C — the push into the lens -------------------------
         The camera walks in along the optical axis while the field of
         view closes from 34° to 24°.

         Both at once is the whole shot. Closing the distance alone
         walks past the barrel; narrowing the field alone enlarges a
         picture of a camera. Together they compress the barrel against
         the front element and the glass comes at the viewer, which is
         what being drawn into a lens actually looks like. The rig's
         own `push` flattens the remaining elevation as it closes, so
         the shot ends square on the axis. */
      const C = t(3.1);
      tl.call(() => setPhase("push"), undefined, C)
        .to(state, { orbit: 0, duration: t(1.55), ease: "power2.inOut" }, C)
        .to(state, { elevation: 1.2, duration: t(1.55), ease: "power2.inOut" }, C)
        .to(state, { push: 1, duration: t(1.6), ease: "power2.in" }, C)
        .to(state, { fov: 24, duration: t(1.6), ease: "power2.in" }, C)
        /* The coating bloom intensifies as the element fills the frame,
           because the key is now almost head-on to the glass. */
        .to(state, { bloom: 0.55, duration: t(1.45), ease: "power2.in" }, C)
        /* The titles step back before the light. */
        .to(copy, {
          opacity: 0,
          y: -12,
          duration: t(0.7),
          ease: "power2.in",
          stagger: 0.06,
        }, C + t(0.85));

      /* ---- SHOT D — the shutter ------------------------------------
         The mechanical beat, and the only fast thing in the sequence.
         The iris snaps shut in a tenth of a second, the body recoils
         two millimetres and comes back, and the readout flicks to the
         speed it fired at. Everything either side of this is slow, so
         this reads as a mechanism rather than as an animation. */
      const D = t(4.65);
      tl.call(() => {
        setPhase("fire");
        shutterSound();
        if (readStop) readStop.textContent = "1/125";
      }, undefined, D)
        .to(state, { iris: 0.04, duration: 0.09, ease: "power3.in" }, D)
        .to(state, { kick: -0.22, duration: 0.05, ease: "power2.out" }, D)
        .to(state, { kick: 0, duration: 0.3, ease: "elastic.out(1, 0.45)" }, D + 0.05)
        /* And open again, a beat later and more slowly — a shutter
           closes faster than it opens. */
        .to(state, { iris: 1, duration: 0.5, ease: "power2.out" }, D + 0.16);

      /* ---- SHOT E — the flash --------------------------------------
         Out of the front element and nowhere else. The gradient's
         centre and its transform origin are both written from where
         the glass actually landed on screen the frame before it fires,
         so the light expands out of the lens rather than out of the
         middle of the window.

         Short: up in a tenth of a second, down over half of one. A
         pure white hold would be an overlay, and a long one would be
         unpleasant — the core is peach, because a tube fires warm. */
      const E = D + 0.14;
      tl.call(() => {
        const point = liveRig.lensPoint();
        if (!point || !flash) return;
        flash.style.setProperty("--fx", `${point.x}%`);
        flash.style.setProperty("--fy", `${point.y}%`);
        flash.style.transformOrigin = `${point.x}% ${point.y}%`;
      }, undefined, E)
        .fromTo(
          flash,
          { opacity: 0, scale: 0.55 },
          { opacity: 1, scale: 1.25, duration: 0.11, ease: "power2.out" },
          E,
        )
        /* The moment the camera is genuinely lost in its own light. */
        .to(veil, { opacity: 0.88, duration: 0.07, ease: "none" }, E + 0.05)
        .to(veil, { opacity: 0, duration: 0.42, ease: "power2.in" }, E + 0.14)

        /* ---- SHOT F — the homepage, already behind the light -------
           The hero comes up *inside* the flash's falloff while the
           lens is still blown out, so the cut from the rendered scene
           to the photograph happens where it cannot be seen. Then the
           flash falls away and what is left is the hero.

           The canvas goes with it. It is not faded under the hero —
           the render loop is stopped the moment it is invisible, so
           nothing is being drawn behind the photograph. */
        .to(host, { opacity: 0, duration: 0.22, ease: "none", onComplete: stopLoop }, E + 0.07)
        .to(finder, { opacity: 0, duration: 0.18, ease: "none" }, E + 0.05)
        .to(heroLayer, { opacity: 1, duration: 0.2, ease: "none" }, E + 0.08)
        .to(heroImg, { scale: 1, duration: 1.6, ease: "power2.out" }, E + 0.08)
        .to(scrims, { opacity: 1, duration: 0.7, ease: "power2.out" }, E + 0.16)
        .to(flash, { opacity: 0, duration: 0.5, ease: "power2.in" }, E + 0.15)

        /* The overlay dissolves over a photograph identical to the one
           underneath it, which is why this is invisible: `release`
           fires as it starts, so the headline and the navigation are
           already arriving on the real page behind. */
        .to(root, {
          opacity: 0,
          duration: 0.55,
          ease: "power2.inOut",
          onStart: release,
          onComplete: settle,
        }, E + 0.62);

      /* The readout's percentage is the real progress of the sequence,
         which is the one honest thing a loading number can be. */
      tl.eventCallback("onUpdate", () => {
        if (readPct) {
          readPct.textContent = `${Math.round(tl.progress() * 100)}%`;
        }
      });

      /* ---- LEAVING ------------------------------------------------- */
      const bail = gsap.timeline({ paused: true });
      bail
        .to([host, copy, finder, leak, flash, veil], {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: stopLoop,
        })
        .to(root, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onStart: release,
          onComplete: settle,
        }, 0.1);

      const bailOut = () => {
        if (handedOver || bail.progress() > 0) return;
        tl.pause();
        bail.play();
      };

      skipRef.current = bailOut;

      /* Escape is the keyboard's skip. */
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") bailOut();
      };
      window.addEventListener("keydown", onKeyDown);

      const onResize = () => {
        liveRig.resize(
          host.clientWidth || window.innerWidth,
          host.clientHeight || window.innerHeight,
        );
      };
      window.addEventListener("resize", onResize);

      /* A tab that goes away stops costing a frame. GSAP's ticker
         stops with it, so nothing drifts out of step. */
      const onVisibility = () => {
        if (document.hidden) stopLoop();
        else if (!handedOver) startLoop();
      };
      document.addEventListener("visibilitychange", onVisibility);

      /* A lost context must not leave a frozen camera over the page. */
      const onLost = (event: Event) => {
        event.preventDefault();
        stopLoop();
        tl.pause();
        settle();
      };
      liveRig.canvas.addEventListener("webglcontextlost", onLost);

      const opening = gsap.delayedCall(HOLD, () => tl.play());

      return () => {
        opening.kill();
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
        liveRig.canvas.removeEventListener("webglcontextlost", onLost);
      };
    }, root);

    return () => {
      skipRef.current = null;
      stopLoop();
      /* Reverts every tween this context created and every inline
         style they wrote, so a replay starts from the markup again. */
      ctx.revert();
      rig?.dispose();
      for (const node of held) node.removeAttribute("inert");
      delete html.dataset.introLock;
      delete html.dataset.introReady;
      releaseScroll();
    };
  }, [runId, hasGL]);

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

  return (
    <div ref={rootRef} className="intro-root" data-phase={phase}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${intro.eyebrow} — opening sequence`}
        className="intro-stage"
      >
        {/* ---- The rendered camera ---- */}
        <div ref={canvasRef} aria-hidden className="intro-canvas" />

        {/* ---- The drawn camera: what a browser without a graphics
                context gets instead. Never both, and neither until
                `hasGL` has been answered. ---- */}
        {hasGL === false ? (
          <div ref={stillRef} aria-hidden className="intro-still">
            <RetroCamera />
          </div>
        ) : null}

        {/* ---- The viewfinder ---------------------------------------
            The furniture of a camera looking at something: corner
            brackets, focus brackets, a frame scale and a readout. The
            aperture and the shutter speed are the camera's; the
            percentage is the real progress of the sequence. ---- */}
        <div data-intro-finder aria-hidden className="intro-finder">
          <svg viewBox="0 0 1024 672" preserveAspectRatio="xMidYMid meet">
            <g
              className="intro-finder-ink"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            >
              {/* The corners of the frame being composed. */}
              <g strokeOpacity="0.55">
                <path d="M62 128V62H128" />
                <path d="M962 128V62H896" />
                <path d="M62 544V610H128" />
                <path d="M962 544V610H896" />
              </g>
              {/* The focus brackets, either side of the subject. */}
              <g strokeOpacity="0.62">
                <path d="M449 236H434V436H449" />
                <path d="M575 236H590V436H575" />
              </g>
              {/* The frame scale: a tick every sixteenth, longer on
                  the quarters, as a real scale is graduated. */}
              <g strokeOpacity="0.3">
                {Array.from({ length: 13 }, (_, i) => {
                  const x = 338 + i * 29;
                  const long = i % 3 === 0;
                  return (
                    <line
                      key={x}
                      x1={x}
                      y1={520}
                      x2={x}
                      y2={long ? 492 : 506}
                      strokeOpacity={long ? 0.75 : 0.3}
                    />
                  );
                })}
              </g>
            </g>
            <text x="62" y="172" className="intro-finder-name" fontSize="21">
              {intro.finder.name}
            </text>
          </svg>

          {/* The readout. In the markup rather than the drawing so it
              is set in the site's own technical face at a controlled
              size, instead of being scaled with the marks. */}
          <p className="intro-read slate">
            <span>{intro.finder.aperture}</span>
            <span data-read-pct className="intro-finder-live">
              0%
            </span>
            <span data-read-stop>{intro.finder.speed}</span>
          </p>
        </div>

        {/* ---- Opening titles ---- */}
        <div className="intro-copy">
          <p data-intro-copy className="meta intro-eyebrow">
            {intro.eyebrow}
          </p>
          <p data-intro-copy className="intro-tagline">
            {intro.tagline}
          </p>
        </div>

        {/* ---- The hero, waiting behind the light ----
            The same photograph, the same crop and the same scrim as the
            hero below. It is what the flash resolves into, and what the
            overlay dissolves away over. Decorative: the real hero
            carries the alt text. */}
        <div ref={heroRef} aria-hidden className="intro-hero">
          <div data-intro-hero-img className="h-full w-full">
            <Figure
              asset={hero.image}
              ratio="auto"
              sizes="100vw"
              quality={68}
              grade={false}
              alt=""
              className="h-[115%] w-full"
              imageClassName="scale-[1.12]"
              position="50% 42%"
            />
          </div>
          <div
            data-intro-scrim
            className="absolute inset-0 opacity-0 [background:var(--grade-scrim)]"
          />
          <div
            data-intro-scrim
            className="absolute inset-0 opacity-0 [background:var(--grade-vignette)]"
          />
        </div>

        {/* ---- The light ---- */}
        <div data-intro-leak aria-hidden className="intro-leak" />
        <div data-intro-flash aria-hidden className="intro-flash" />
        <div data-intro-veil aria-hidden className="intro-veil" />

        {/* The sequence carries the site's own grain, so the render and
            the page are the same surface. */}
        <div aria-hidden className="grain-layer intro-grain" />

        {/* There is no visible skip control: the opening frame is the
            composition, and a button in the corner of it was the one
            thing asking to be looked at instead of the camera.

            The way out is still there and still complete — Escape
            leaves at any point, the watchdog in the boot script hands
            the page back if the sequence never comes alive, and the
            sequence ends on its own. Only the chrome is gone. */}
        <p role="status" aria-live="polite" className="sr-only">
          {phase === "idle"
            ? ""
            : phase === "revealed"
              ? "The opening sequence has finished. The website is ready."
              : "An opening sequence is playing. Press Escape to go straight to the website."}
        </p>
      </div>
    </div>
  );
}

/**
 * The answer never changes within a document, so there is nothing to
 * subscribe to and nothing to tear down.
 */
function neverChanges() {
  return () => {};
}

/**
 * ------------------------------------------------------------------
 * THE SHUTTER, HEARD
 * ------------------------------------------------------------------
 * Synthesised rather than loaded: two short filtered noise bursts, a
 * mirror and a blade, which is what a reflex shutter is. Nothing is
 * downloaded for it and there is no audio asset in the project.
 *
 * It is strictly optional, and the sequence never waits on it. Every
 * browser refuses to start an audio context before the visitor has
 * interacted with the document, and that refusal is correct — nobody
 * should be played a sound by a page they have just opened. So this
 * asks whether there has already been an interaction, and if there has
 * not, it does nothing at all and the shutter is silent. The
 * mechanical beat of the shot — the iris, the recoil — is visual and
 * always plays.
 *
 * In practice that means: silent on a cold load, audible on a replay
 * from the footer or after any click, which is the right way round.
 * ------------------------------------------------------------------
 */
function shutterSound() {
  try {
    const activation = (
      navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }
    ).userActivation;
    /* No interaction yet: stay silent rather than firing a request the
       browser will refuse and the console will complain about. */
    if (activation && !activation.hasBeenActive) return;

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    const audio = new Ctor();
    if (audio.state === "suspended") void audio.resume();

    const burst = (at: number, duration: number, hz: number, gain: number) => {
      const frames = Math.max(1, Math.floor(audio.sampleRate * duration));
      const buffer = audio.createBuffer(1, frames, audio.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < frames; i += 1) {
        /* White noise under a steep decay: a click, not a hiss. */
        channel[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 3;
      }

      const source = audio.createBufferSource();
      source.buffer = buffer;

      const band = audio.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = hz;
      band.Q.value = 1.1;

      const level = audio.createGain();
      level.gain.value = gain;

      source.connect(band).connect(level).connect(audio.destination);
      source.start(audio.currentTime + at);
      source.stop(audio.currentTime + at + duration);
    };

    /* The mirror going up, then the blade crossing the gate. */
    burst(0, 0.045, 2100, 0.1);
    burst(0.055, 0.075, 1150, 0.075);

    /* Let it go once it has played; an open context is a live
       resource and this one has exactly one job. */
    window.setTimeout(() => void audio.close().catch(() => {}), 900);
  } catch {
    /* Audio is a flourish. It is never worth an exception. */
  }
}
