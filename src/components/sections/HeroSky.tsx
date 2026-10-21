"use client";

import { useRef } from "react";

import { Figure } from "@/components/ui/Figure";
import type { ImageAsset } from "@/data";
import { DESKTOP, MOTION_OK, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { afterIntro } from "@/lib/intro";
import { SkyFlight, supportsWebGL } from "./SkyFlight";

/**
 * The flock. Three depths: a distant pair, a middle pair, and one
 * nearer bird crossing the other way, because a sky in which everything
 * travels in the same direction at the same speed is a conveyor belt.
 *
 *   top      where it flies, as a % of the hero. Kept to the band
 *            between the header scrim and the headline, so the birds
 *            never cross the type and never disappear into the dark at
 *            the very top.
 *   size     its wingspan in px. Also its distance.
 *   opacity  haze. The further away, the more of the sky is in front.
 *   cross    seconds to traverse the frame. Nearer birds are faster.
 *   wait     seconds out of frame before coming round again.
 *   flap     seconds per wingbeat. Smaller birds beat faster.
 *   dir      1 travels right, -1 travels left.
 */
const FLOCK = [
  { top: 21, size: 25, opacity: 0.78, cross: 71, wait: 16, flap: 0.72, dir: 1, delay: 2 },
  { top: 25.5, size: 20, opacity: 0.68, cross: 79, wait: 22, flap: 0.8, dir: 1, delay: 6 },
  { top: 31, size: 37, opacity: 0.9, cross: 52, wait: 28, flap: 0.56, dir: 1, delay: 13 },
  { top: 27.5, size: 30, opacity: 0.8, cross: 59, wait: 33, flap: 0.64, dir: 1, delay: 18 },
  { top: 35, size: 47, opacity: 0.95, cross: 43, wait: 45, flap: 0.46, dir: -1, delay: 28 },
] as const;

/**
 * THE LIVING SKY
 *
 * The hero photograph, with weather in it.
 *
 * There is no cloud footage in the project and none has been licensed,
 * so nothing here is stock video or an unrelated loop. The movement is
 * built out of the company's own photograph:
 *
 *  - The plate. The ŹPF monsoon sky, exactly as before, drifting very
 *    slowly and almost imperceptibly across the frame.
 *  - The bank. The same photograph again, mirrored, enlarged and
 *    screened back over itself. Because it is a different crop at a
 *    different scale moving at a different speed, the two cloud masses
 *    cross one another — which is what makes it read as depth rather
 *    than as a picture being dragged sideways. It costs no extra
 *    download: same file, same `sizes`, same quality, so it is the
 *    same request the plate already made.
 *  - The atmosphere. Two soft gradients, one warm and one cold, that
 *    travel and breathe on their own clocks. This is the light
 *    changing — the part that makes a sky feel like weather.
 *  - The birds. Five of them, crossing on their own schedules.
 *
 * The birds are there for a reason beyond decoration. The eye is far
 * better at spotting a small object that moves than a large field that
 * slowly changes brightness, so a sky whose clouds drift at a
 * believable speed reads as a still photograph until something crosses
 * it. That is also how the real shot works: the clouds barely move, a
 * bird goes through the frame, and you know you are watching film
 * rather than looking at a print. They let the clouds stay slow.
 *
 * None of the clocks are multiples of one another, so the composite
 * never arrives back where it started and there is no loop point to
 * notice.
 *
 * Three things it deliberately does not do:
 *
 *  - It does not start until the opening sequence has handed over. The
 *    sequence ends by dissolving an identical copy of this photograph
 *    into this one, and "identical" has to stay true until it has.
 *  - It never moves the plate with the pointer. Only the bank and the
 *    atmosphere answer the cursor, by a few pixels, on a fine pointer —
 *    so there is depth without the whole sky following the mouse.
 *  - Under `prefers-reduced-motion` none of it is built. The hero is
 *    one still photograph, which is what was asked for.
 */
export function HeroSky({ image }: { image: ImageAsset }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef<HTMLDivElement>(null);


  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const depth = depthRef.current;
    if (!root || !depth) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const plate = root.querySelector<HTMLElement>("[data-sky-plate]");
      const bank = root.querySelector<HTMLElement>("[data-sky-bank]");
      const warm = root.querySelector<HTMLElement>("[data-sky-warm]");
      const cool = root.querySelector<HTMLElement>("[data-sky-cool]");
      if (!plate || !bank || !warm || !cool) return;

      /* Every clock is its own tween, built paused. Separate tweens
         rather than one timeline: each is on its own property of its
         own element, so there is nothing to co-ordinate and nothing
         that can end up fighting over a value. */
      const drift = (
        target: HTMLElement,
        vars: gsap.TweenVars,
        duration: number,
      ) =>
        gsap.to(target, {
          ...vars,
          duration,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          paused: true,
          force3D: true,
        });

      /* The nearer cloud bank is a CSS stand-in for depth the page had
         no other way of showing. Once the WebGL flight is running
         there are real cloud volumes at real depths above this layer,
         and the stand-in is not just redundant — its `filter: blur()`
         is the one thing here that can show an edge. A browser
         compositing that blur on the GPU clamps the filter's region,
         so the blur fades to nothing at the clamp; and because this
         layer *adds* light through `mix-blend-mode: screen`, losing it
         darkens a strip about three sigma wide down each side of the
         frame. Which is exactly the band that was reported, at the
         width the blur radius predicts, on hardware that composites
         it — and never in a software renderer, which is why it took a
         screenshot from a real machine to find. */
      const has3d = supportsWebGL();
      /* setAttribute, not dataset: `dataset.sky3d` serialises to
         `data-sky3d`, because the digit is not an uppercase letter
         and nothing tells it to put a hyphen there. The stylesheet
         asks for `data-sky-3d`, and the two would never have met. */
      if (has3d) root.setAttribute("data-sky-3d", "1");

      const moves = [
        /* The plate: a long, shallow pass. It is the furthest away, so
           it moves least — that is what sets the scale of everything
           in front of it. Its travel is bounded by how far the
           photograph overhangs its frame (scale-[1.12] below, so 6%
           each side); 4.2% leaves margin and still crosses about 60px
           of a 1440 viewport, which is a cloud visibly moving rather
           than a number that only a transform matrix can see.

           Downward travel is never used: the plate hangs from the top
           of the frame, so it has slack below it and none above. */
        drift(plate, { xPercent: 4.2, yPercent: -2.6 }, 64),
        drift(plate, { scale: 1.075 }, 51),

        /* The bank: nearer, so faster, and crossing the other way.
           9% of its own width is about 175px — the fastest thing in
           the composition, and the one that reads as weather. Only
           when it is the one doing that job. */
        ...(has3d
          ? []
          : [
              drift(bank, { xPercent: -9, yPercent: 3.6 }, 59),
              drift(bank, { scale: 1.13 }, 43),
            ]),

        /* The light. It fades to nothing at its own edges, so it is
           the one layer with no edge to expose and no limit on travel.
           Opacity on these elements is sequenced below, never
           animated alongside these. */
        drift(warm, { xPercent: 26, yPercent: -9 }, 83),
        drift(cool, { xPercent: -21, yPercent: 11, scale: 1.18 }, 71),
      ];

      /* Arrival, then breathing, on one property of one element — in
         series, so no two tweens ever hold the same value at once.
         The arrival is what lets the opening sequence hand over to a
         frame that is still identical to the one it was holding. */
      const breathe = (
        target: HTMLElement,
        settled: number,
        swell: number,
        duration: number,
      ) => {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(
          target,
          { opacity: 0 },
          { opacity: settled, duration: 3.2, ease: "power1.inOut" },
        ).to(target, {
          opacity: swell,
          duration,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        return tl;
      };

      const lights = [
        ...(has3d ? [] : [breathe(bank, 0.3, 0.46, 37)]),
        breathe(warm, 0.46, 0.78, 53),
        breathe(cool, 0.36, 0.12, 31),
      ];

      /* ---- The birds ----
         Two tweens each, on different properties of different
         elements, so nothing contends: the body crosses the frame and
         bobs, the wings beat. The crossing is function-based, so it is
         measured when it plays rather than when it was built — a
         window resized while the page sat open does not strand a bird
         halfway. */
      /* Only when there is no 3D flight above this layer. Two flocks
         over one photograph is one flock too many. */
      const birds = supportsWebGL()
        ? []
        : gsap.utils.toArray<HTMLElement>("[data-bird]", root);
      const flights: gsap.core.Animation[] = [];

      birds.forEach((bird, index) => {
        const spec = FLOCK[index];
        if (!spec) return;
        const wings = bird.querySelector<HTMLElement>("[data-wings]");
        const span = spec.size + 40;

        flights.push(
          /* Haze. Set here rather than inline on the element, because
             an inline opacity would beat the `.bird { opacity: 0 }`
             that keeps the flock out of a reduced-motion sky — and
             five birds frozen in mid-air is worse than no birds. */
          gsap.fromTo(
            bird,
            { opacity: 0 },
            { opacity: spec.opacity, duration: 2.6, ease: "power1.inOut", paused: true },
          ),
          gsap.fromTo(
            bird,
            { x: () => (spec.dir === 1 ? -span : window.innerWidth + span) },
            {
              x: () => (spec.dir === 1 ? window.innerWidth + span : -span),
              duration: spec.cross,
              ease: "none",
              repeat: -1,
              repeatDelay: spec.wait,
              delay: spec.delay,
              paused: true,
            },
          ),
          /* It does not fly in a straight line. */
          gsap.to(bird, {
            y: spec.size * 0.9,
            duration: 11 + index * 2.7,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true,
          }),
        );

        if (wings) {
          /* Through flat and out the other side: wings up, extended,
             wings down. One scale does the whole wingbeat. */
          flights.push(
            gsap.to(wings, {
              scaleY: -0.7,
              duration: spec.flap,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              paused: true,
            }),
          );
        }
      });

      const all = [...moves, ...lights, ...flights];

      /* Nothing moves behind the opening sequence. `afterIntro` plays
         it immediately when there is no sequence — a return visit in
         the same session — and plays it regardless if one stalls. */
      const release = afterIntro(() => {
        for (const animation of all) animation.play();
      });

      return () => {
        release();
        root.removeAttribute("data-sky-3d");
      };
    });

    /* Pointer depth. The cursor moves what is in front of the
       photograph and never the photograph itself, so the composition
       stays anchored under the headline. Fine pointers only: there is
       no hover on a touch screen, and a phone has better things to
       spend a frame on. */
    mm.add(`${DESKTOP} and ${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
      const moveX = gsap.quickTo(depth, "x", { duration: 1.6, ease: "power3.out" });
      const moveY = gsap.quickTo(depth, "y", { duration: 1.6, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        /* Single figures of pixels. Felt, not seen. */
        moveX(x * -18);
        moveY(y * -12);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className="sky">
      {/* The plate. Identical in every respect to the frame the
          opening sequence dissolves away over — same file, same crop,
          same focal point — because that hand-over is only invisible
          while the two are the same picture. */}
      <div data-sky-plate className="sky-plate">
        <Figure
          asset={image}
          ratio="auto"
          sizes="100vw"
          priority
          quality={68}
          /* The hero carries its own scrim, and the frame the opening
             sequence dissolves over must stay the identical picture:
             a grade on one and not the other would make that
             hand-over visible, which is the one thing it must not
             be. */
          grade={false}
          className="h-[115%] w-full"
          imageClassName="scale-[1.12]"
          position="50% 42%"
        />
      </div>

      {/* Everything in front of the plate answers the pointer. */}
      <div ref={depthRef} aria-hidden className="sky-depth">
        {/* The near cloud bank. Same request as the plate: changing
            `sizes` or `quality` here would fetch a second file for no
            visible gain — it is mirrored, enlarged and softened. */}
        <div data-sky-bank className="sky-bank">
          <div className="sky-bank-mirror">
            <Figure
              asset={image}
              ratio="auto"
              sizes="100vw"
              quality={68}
              alt=""
              grade={false}
              className="h-full w-full"
              position="50% 38%"
            />
          </div>
        </div>

        {/* The light moving through the sky. */}
        <div data-sky-warm className="sky-glow sky-glow--warm" />
        <div data-sky-cool className="sky-glow sky-glow--cool" />

        {/* The birds. Behind the headline, like everything else in the
            backdrop, so they pass behind the type rather than over it. */}
        {FLOCK.map((bird) => (
          <div
            key={`${bird.top}-${bird.size}`}
            data-bird
            className="bird"
            style={{
              top: `${bird.top}%`,
              /* `size` is the wingspan on a 1440 desktop. Below that it
                 scales with the viewport, with a floor, so a 47px bird
                 is 3% of a desktop frame and not 12% of a phone. */
              width: `clamp(${Math.round(bird.size * 0.46)}px, ${(
                bird.size / 14.4
              ).toFixed(2)}vw, ${bird.size}px)`,
              /* Travelling left means facing left. */
              ["--face" as string]: bird.dir === 1 ? "1" : "-1",
            }}
          >
            <svg viewBox="-12 -7 24 14" className="bird-art">
              <g data-wings className="bird-wings">
                <path
                  d="M-10 1.6 Q-5 -3.6 0 0 Q5 -3.6 10 1.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>
        ))}
      </div>

      {/* The flight: cloud volumes at true depths, an articulated
          flock, and a camera that accelerates into the weather. It is
          transparent and sits over the photograph, so losing WebGL
          costs the hero nothing.

          Always rendered, never conditional: it decides for itself
          whether to build anything, which keeps that decision out of
          React's render and off the server, where the answer is not
          knowable. What it leaves behind when it stands down is an
          empty, untouchable div. The CSS flock below asks the same
          question in its own effect, so the two can never both run. */}
      <SkyFlight src={image.src} />
    </div>
  );
}
