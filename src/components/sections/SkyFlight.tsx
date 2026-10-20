"use client";

import { useRef } from "react";
import * as THREE from "three";

import { gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { afterIntro } from "@/lib/intro";

/**
 * THE FLIGHT — a Three.js sky over the hero photograph
 * ------------------------------------------------------------------
 * A WebGL layer that puts real three-dimensional space in front of the
 * ŹPF monsoon sky: cloud volumes at true depths, birds with articulated
 * wings, and a camera that accelerates forward into the weather and
 * settles.
 *
 * WHY IT SITS *OVER* THE PHOTOGRAPH RATHER THAN REPLACING IT
 *
 * The canvas is transparent and the photograph stays underneath, in the
 * DOM, where it already was. Three things follow, and they are the
 * reason it is built this way:
 *
 *  - The opening sequence ends by dissolving an identical copy of that
 *    photograph into the hero. Replacing the hero with a rendered sky
 *    would break that hand-over; layering over it cannot.
 *  - The brand's own photography stays the backdrop of its own website.
 *    The 3D is weather moving through the frame, not a replacement for
 *    the picture.
 *  - If WebGL is missing, or the context is lost, nothing is lost: the
 *    hero is the photograph and the CSS layers it always was.
 *
 * WHY THE WORLD MOVES AND NOT THE CAMERA
 *
 * Flying a camera forever down -Z drifts into float imprecision and
 * makes recycling arithmetic awkward. The cloud field and the flock
 * travel toward the camera instead, which is the same relative motion
 * with the same perspective and parallax — every layer moves at a rate
 * set by its own depth, because perspective division does that for
 * free. The camera still moves: it lifts, banks and sways, which is
 * what a camera in the air actually does.
 *
 * WHY GSAP AND THE RENDER LOOP DO NOT FIGHT
 *
 * GSAP owns the flight *parameters* — speed, lift, bank, how far the
 * frame has opened up. The render loop integrates those into positions
 * once per frame. Nothing is written twice, and there is no second loop
 * quietly overwriting what the timeline just set.
 */

/* ------------------------------------------------------------------
   THE CLOUD SPRITES
   Cut from ŹPF's own sky photograph at runtime rather than shipped as
   new files: luminance becomes alpha, so what was cloud in the frame
   stays and what was sky falls away. Real photographic cloud edges,
   nothing extra to download, nothing to license, and if the hero
   photograph is swapped the weather follows it.
   ------------------------------------------------------------------ */
function cloudSprites(img: HTMLImageElement, count: number, rand: () => number) {
  const sprites: THREE.CanvasTexture[] = [];
  const SIZE = 384;

  for (let i = 0; i < count; i += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    /* A different region of the photograph each time, taken from the
       upper two thirds where the cloud actually is. */
    const cw = img.width * (0.3 + rand() * 0.2);
    const ch = cw * 0.8;
    const cx = rand() * Math.max(1, img.width - cw);
    const cy = rand() * Math.max(1, img.height * 0.66 - ch);
    ctx.drawImage(img, cx, cy, cw, ch, 0, 0, SIZE, SIZE);

    const frame = ctx.getImageData(0, 0, SIZE, SIZE);
    const px = frame.data;
    const half = SIZE / 2;

    for (let p = 0; p < px.length; p += 4) {
      const index = p / 4;
      const x = (index % SIZE) - half;
      const y = Math.floor(index / SIZE) - half;

      /* Feathered to nothing at the edges, so a sprite never shows the
         rectangle it was cut from. */
      const r = Math.sqrt(x * x + y * y) / half;
      const feather = Math.max(0, 1 - r * r * 1.25);

      const luma = (px[p] * 0.2126 + px[p + 1] * 0.7152 + px[p + 2] * 0.0722) / 255;
      /* Cloud is the lit part of the frame. Below `floor` is sky and
         goes transparent; above `ceil` is full cloud. */
      const floorL = 0.12;
      const ceilL = 0.52;
      let a = (luma - floorL) / (ceilL - floorL);
      a = a < 0 ? 0 : a > 1 ? 1 : a;
      a = a * a * (3 - 2 * a);

      px[p + 3] = Math.round(a * feather * 255);
      /* Lifted a little: these are lit from in front once they are in
         the scene, not read off a backlit photograph. */
      px[p] = Math.min(255, px[p] * 1.22 + 10);
      px[p + 1] = Math.min(255, px[p + 1] * 1.18 + 10);
      px[p + 2] = Math.min(255, px[p + 2] * 1.14 + 12);
    }

    ctx.putImageData(frame, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    sprites.push(texture);
  }

  return sprites;
}

/* ------------------------------------------------------------------
   THE BIRD
   Built rather than imported, because the project has no licensed bird
   model and an unlicensed one has no business on a client's site. It
   is a real articulated body: wings that pivot at the shoulder, a
   downstroke faster than the recovery, a twist through the beat, and a
   tail. It reads as a bird in silhouette, which is what a bird at this
   distance is — it is not feather-level photoreal, and swapping in a
   rigged GLB is the one change that would make it so. See `BIRD_ASSET`
   at the foot of this file.
   ------------------------------------------------------------------ */
function buildBird(material: THREE.Material, wingMaterial: THREE.Material) {
  const bird = new THREE.Group();

  /* Body: a lathed spindle with a head bulge, a neck and a tail taper,
     so the silhouette has a front and a back. */
  const profile = [
    [0.0, 0.0],
    [0.05, 0.05],
    [0.08, 0.13],
    [0.065, 0.24],
    [0.1, 0.36],
    [0.115, 0.56],
    [0.1, 0.82],
    [0.06, 1.12],
    [0.028, 1.4],
    [0.0, 1.52],
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 9), material);
  /* The lathe stands up the Y axis; lay it down the Z axis, nose
     forward, and centre it on the shoulder. */
  body.geometry.rotateX(Math.PI / 2);
  body.geometry.translate(0, 0, 0.52);
  bird.add(body);

  /* Tail: a flat fan off the back of the body. */
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.lineTo(0.14, 0.42);
  tailShape.lineTo(0, 0.5);
  tailShape.lineTo(-0.14, 0.42);
  tailShape.closePath();
  const tail = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), wingMaterial);
  tail.geometry.rotateX(-Math.PI / 2);
  tail.position.z = -0.92;
  bird.add(tail);

  /* Wing: swept leading edge, tapered tip, a notch in the trailing
     edge where the primaries separate. Drawn flat, then laid into the
     horizontal plane so that rolling it about Z is a wingbeat. */
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.04, -0.1);
  wingShape.quadraticCurveTo(0.5, -0.17, 0.95, -0.13);
  wingShape.quadraticCurveTo(1.22, -0.09, 1.34, 0.01);
  wingShape.quadraticCurveTo(1.05, 0.08, 0.74, 0.14);
  wingShape.quadraticCurveTo(0.46, 0.2, 0.2, 0.15);
  wingShape.quadraticCurveTo(0.09, 0.12, 0.04, -0.1);
  const wingGeometry = new THREE.ShapeGeometry(wingShape, 10);
  wingGeometry.rotateX(-Math.PI / 2);

  const left = new THREE.Mesh(wingGeometry, wingMaterial);
  const right = new THREE.Mesh(wingGeometry, wingMaterial);
  right.scale.x = -1;
  bird.add(left, right);

  return { bird, left, right, body };
}

/**
 * One wingbeat, as a value from +1 (wings at the top of the upstroke)
 * to -1 (bottom of the downstroke).
 *
 * The downstroke is the power stroke and takes about a third of the
 * beat; the recovery takes the rest. A sine wave — which is what the
 * flat version of these birds used — spends equal time on both and is
 * the single clearest tell that something is not alive.
 */
function wingbeat(phase: number) {
  const p = phase - Math.floor(phase);
  const ease = (t: number) => t * t * (3 - 2 * t);
  if (p < 0.36) return 1 - 2 * ease(p / 0.36);
  return -1 + 2 * ease((p - 0.36) / 0.64);
}

/**
 * Whether this browser can run the flight at all. Checked by the hero
 * as well, so the CSS flock it falls back to is never built alongside
 * the 3D one.
 */
let webgl: boolean | null = null;

export function supportsWebGL() {
  if (typeof window === "undefined") return false;
  /* Answered once. It is read from a snapshot that React may call on
     any render, and probing for a context allocates a canvas. */
  if (webgl !== null) return webgl;
  try {
    const canvas = document.createElement("canvas");
    webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}

interface Flier {
  group: THREE.Group;
  left: THREE.Mesh;
  right: THREE.Mesh;
  speed: number;
  beat: number;
  phase: number;
  amp: number;
  /** Seconds left in the current flapping burst, or of the glide. */
  mode: "flap" | "glide";
  timer: number;
  wander: THREE.Vector2;
  wanderRate: THREE.Vector2;
  lastX: number;
  bank: number;
}

export function SkyFlight({ src }: { src: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* Reduced motion is answered by not building any of this. The
       photograph underneath is the whole hero, which is the point. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* ---- How much scene this device gets ----
       The expensive thing here is not geometry, it is fill: every
       cloud is a large transparent quad, and a stack of them over the
       same pixels is overdraw the GPU pays for in full. So the budget
       is set by screen size, and the knobs are the ones that actually
       cost — how many quads, how big, and at what resolution. */
    const narrow = window.matchMedia("(max-width: 47.99rem)").matches;
    const budget = {
      clouds: narrow ? 10 : 18,
      birds: narrow ? 5 : 9,
      /* Past 1.5 the soft edges of a cloud gain nothing a person can
         see, and the fill cost is quadratic. */
      dpr: narrow ? 1.25 : 1.5,
      /* The birds are the only hard edges in the scene, and the only
         thing aliasing would show on. A phone does not get it. */
      aa: !narrow,
    };

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: budget.aa,
        powerPreference: "high-performance",
      });
    } catch {
      /* No WebGL. The hero is the photograph and its CSS layers. */
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, 1, 0.5, 1400);
    camera.position.set(0, 0, 0);

    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, budget.dpr));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    /* Dusk: one warm key low in the frame, cool ambient from the rest
       of the sky. The same light the photograph was taken in. */
    scene.add(new THREE.AmbientLight(0x6c7490, 2.1));
    const key = new THREE.DirectionalLight(0xffd9b4, 1.5);
    key.position.set(-0.6, 0.35, 0.8);
    scene.add(key);

    /* Depth fade. Far clouds lose contrast into the photograph behind
       them, which is what welds the 3D to the plate. */
    scene.fog = new THREE.Fog(0x2a2430, 320, 1150);

    const disposables: Array<{ dispose: () => void }> = [];
    let frame = 0;
    let running = false;
    let built = false;

    /* The parameters GSAP writes and the loop reads. Nothing else
       touches the camera. */
    const flight = { speed: 1.4, lift: 0, bank: 0, sway: 0, spread: 0.55 };

    const clouds: Array<{
      mesh: THREE.Mesh;
      spin: number;
      drift: number;
      depth: number;
      /** Which column of the sky this cloud keeps. See `placeCloud`. */
      slot: number;
    }> = [];
    const flock: Flier[] = [];

    /* A seeded sequence, so the composition is the same every visit
       rather than a different accident each time. */
    let seed = 20261020;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const FAR = -1150;
    const NEAR = 42;

    const placeCloud = (entry: (typeof clouds)[number], initial: boolean) => {
      const z = initial ? -60 - rand() * (FAR * -1 - 60) : FAR + rand() * 90;
      const mesh = entry.mesh;

      /* Placed in the frame, not in the world.

         What the frame shows at a given depth is a window whose size
         grows with that depth, so a fixed spread of world x covers a
         wide angle up close and a narrow one far away. Spreading in
         world units therefore piles the far clouds into the middle of
         the picture and throws the near ones off the sides — which is
         what the first two passes here did, once to the left of the
         frame and once to both sides.

         So the half-width of the frame at this z is worked out first,
         and the cloud is placed as a fraction of *that*. Even
         coverage at every depth, and the same arithmetic gives the
         sprite an apparent size instead of a world one. */
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const halfH = tan * Math.abs(z);
      const halfW = halfH * camera.aspect;

      /* Stratified, not random: every cloud keeps its own column of
         the frame and is only jittered inside it. Eighteen clouds at
         random x look even on average and are nothing of the sort in
         any one arrangement — the first pass left a hole down the
         left, and with the vignette over it that read as a dark band
         beside the headline. Keeping a column is what stops it coming
         back on any reload, at any width. */
      const column = (entry.slot + 0.1 + rand() * 0.8) / budget.clouds;
      mesh.position.set(
        /* Reaching a little past both edges, so the field has no sides. */
        (column - 0.5) * 2 * halfW * 1.26,
        (rand() - 0.42) * halfH * 1.5,
        z,
      );
      const scale = halfW * (0.46 + rand() * 0.5);
      mesh.scale.set(scale, scale * (0.62 + rand() * 0.2), 1);
      mesh.rotation.z = rand() * Math.PI * 2;
      entry.spin = (rand() - 0.5) * 0.012;
      entry.drift = (rand() - 0.5) * 1.6;
      entry.depth = z;
    };

    const build = (sprites: THREE.CanvasTexture[]) => {
      if (!sprites.length) return;
      for (const sprite of sprites) disposables.push(sprite);

      /* ---- The cloud field ---- */
      const plane = new THREE.PlaneGeometry(1, 1);
      disposables.push(plane);

      for (let i = 0; i < budget.clouds; i += 1) {
        const material = new THREE.MeshBasicMaterial({
          map: sprites[i % sprites.length],
          transparent: true,
          depthWrite: false,
          opacity: 0,
          fog: true,
          color: new THREE.Color().setHSL(0.72 + rand() * 0.06, 0.12, 0.46 + rand() * 0.2),
        });
        disposables.push(material);
        const mesh = new THREE.Mesh(plane, material);
        mesh.renderOrder = 1;
        const entry = { mesh, spin: 0, drift: 0, depth: 0, slot: i };
        placeCloud(entry, true);
        clouds.push(entry);
        scene.add(mesh);
      }

      /* ---- The flock ----
         Across three depths, and fewer of them on a phone. Every one
         of them has its own
         wingbeat rate, amplitude, cruising speed and wander, and they
         are never put back in formation — a flock whose beats line up
         is the other clear tell. */
      const bodyMat = new THREE.MeshLambertMaterial({
        color: 0x14121a,
        side: THREE.DoubleSide,
      });
      const wingMat = new THREE.MeshLambertMaterial({
        color: 0x1a1720,
        side: THREE.DoubleSide,
      });
      disposables.push(bodyMat, wingMat);

      for (let i = 0; i < budget.birds; i += 1) {
        const { bird, left, right } = buildBird(bodyMat, wingMat);
        const far = i < Math.ceil(budget.birds / 2);
        const z = far ? -420 - rand() * 420 : -90 - rand() * 220;
        const size = far ? 2.6 + rand() * 1.8 : 1.1 + rand() * 1.1;

        bird.scale.setScalar(size);
        bird.position.set(
          (rand() - 0.5) * Math.abs(z) * 0.9,
          (rand() - 0.3) * Math.abs(z) * 0.3 + 12,
          z,
        );

        const flier: Flier = {
          group: bird,
          left,
          right,
          speed: 5 + rand() * 9,
          /* Small birds beat faster. */
          beat: (far ? 1.5 : 2.4) + rand() * 1.4,
          phase: rand(),
          amp: 0.72 + rand() * 0.42,
          mode: rand() > 0.45 ? "flap" : "glide",
          timer: 1 + rand() * 4,
          wander: new THREE.Vector2(rand() * 6.28, rand() * 6.28),
          wanderRate: new THREE.Vector2(0.16 + rand() * 0.22, 0.1 + rand() * 0.16),
          lastX: bird.position.x,
          bank: 0,
        };
        flock.push(flier);
        scene.add(bird);
      }

      built = true;
    };

    /* ---- The cinematic timeline ----
       Five beats. GSAP writes `flight`; the loop below turns it into
       metres. Built paused so the sequence starts when the website
       does, not behind the opening film. */
    const tl = gsap.timeline({ paused: true });
    tl
      /* 1 — establishing. Barely moving; the sky is simply there. */
      .to(flight, { spread: 1, duration: 2.6, ease: "power1.out" }, 0)
      /* 2 — the push forward begins, and the nose comes up. */
      .to(flight, { speed: 58, duration: 3.6, ease: "power2.in" }, 2.1)
      .to(flight, { lift: 7.5, duration: 4.4, ease: "sine.inOut" }, 2.4)
      /* 3 — in it now. A long bank, felt rather than seen. */
      .to(flight, { speed: 86, duration: 3.2, ease: "none" }, 5.7)
      .to(flight, { bank: 0.035, duration: 3, ease: "sine.inOut" }, 5.4)
      .to(flight, { sway: 1, duration: 4, ease: "sine.inOut" }, 6)
      /* 4 — through the cloud bank, and out the other side. */
      .to(flight, { speed: 104, duration: 2.1, ease: "power1.inOut" }, 8.9)
      .to(flight, { bank: -0.022, duration: 3.4, ease: "sine.inOut" }, 8.6)
      /* 5 — the landing. Everything comes off, and what is left is the
         ambient drift the hero keeps for as long as anyone looks. */
      .to(flight, { speed: 3.4, duration: 5.2, ease: "power3.out" }, 11)
      .to(flight, { lift: 0.5, duration: 4.8, ease: "power2.out" }, 11.4)
      .to(flight, { bank: 0, duration: 4.4, ease: "sine.inOut" }, 11.8)
      /* And the field thins as it settles. The flight is the arrival;
         what the visitor then sits with is ŹPF's photograph, with
         weather still moving through it — not a render that has
         covered the picture up. */
      .to(flight, { spread: 0.46, duration: 6, ease: "power2.out" }, 11.5);

    /* ---- Sizing ---- */
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* ---- The loop ---- */
    const clock = new THREE.Clock();
    let elapsed = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      /* Capped, so a backgrounded tab returning does not teleport the
         whole field through the camera in one step. */
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      if (built) {
        const travel = flight.speed * dt;

        for (const entry of clouds) {
          const mesh = entry.mesh;
          mesh.position.z += travel;
          mesh.position.x += entry.drift * dt;
          mesh.rotation.z += entry.spin * dt;

          /* In from nothing at the far plane, out again as it passes,
             so nothing ever pops into or out of the frame. */
          const d = Math.abs(mesh.position.z);
          const near = THREE.MathUtils.smoothstep(d, 6, 70);
          const far = 1 - THREE.MathUtils.smoothstep(d, 820, 1140);
          (mesh.material as THREE.MeshBasicMaterial).opacity =
            near * far * 0.62 * flight.spread;

          if (mesh.position.z > NEAR) placeCloud(entry, false);
        }

        for (const flier of flock) {
          const g = flier.group;
          g.position.z += travel + flier.speed * dt * 0.35;

          /* Wander: two slow oscillators, so no bird repeats a path. */
          flier.wander.x += flier.wanderRate.x * dt;
          flier.wander.y += flier.wanderRate.y * dt;
          g.position.x += Math.sin(flier.wander.x) * flier.speed * dt * 0.8;
          g.position.y += Math.sin(flier.wander.y) * flier.speed * dt * 0.3;

          /* Flapping comes in bursts with glides between, which is how
             a bird of any size actually crosses a sky. */
          flier.timer -= dt;
          if (flier.timer <= 0) {
            if (flier.mode === "flap") {
              flier.mode = "glide";
              flier.timer = 1.4 + Math.random() * 3.4;
            } else {
              flier.mode = "flap";
              flier.timer = 1.1 + Math.random() * 2.6;
            }
          }

          const want = flier.mode === "flap" ? flier.amp : 0.12;
          /* Eased between the two states rather than switched, so the
             bird settles into a glide instead of stopping dead. */
          flier.amp += (want - flier.amp) * Math.min(1, dt * 2.2);
          flier.phase += dt * flier.beat;

          const beat = wingbeat(flier.phase);
          const lift = 0.34 + beat * flier.amp * 0.8;
          flier.left.rotation.z = lift;
          flier.right.rotation.z = -lift;
          /* The wing feathers through the stroke. */
          flier.left.rotation.y = beat * 0.2;
          flier.right.rotation.y = -beat * 0.2;
          /* And the whole body rides the beat a little. */
          g.position.y += beat * flier.amp * dt * 1.4;

          /* Bank into the turn, read from the turn itself. */
          const turn = g.position.x - flier.lastX;
          flier.lastX = g.position.x;
          flier.bank += (-turn * 2.2 - flier.bank) * Math.min(1, dt * 2);
          g.rotation.z = THREE.MathUtils.clamp(flier.bank, -0.5, 0.5);
          g.rotation.y = Math.sin(flier.wander.x) * 0.3;
          g.rotation.x = -0.06 + beat * 0.03;

          if (g.position.z > NEAR + 30) {
            const far = flier.speed < 10;
            const z = far ? -700 - Math.random() * 300 : -260 - Math.random() * 220;
            g.position.set(
              (Math.random() - 0.5) * Math.abs(z) * 0.9,
              (Math.random() - 0.3) * Math.abs(z) * 0.3 + 12,
              z,
            );
            flier.lastX = g.position.x;
          }
        }

        /* The camera: lift, bank, and a slow sway. Small numbers — it
           is a camera in the air, not a camera being thrown. */
        camera.position.y = flight.lift + Math.sin(elapsed * 0.21) * 1.6 * flight.sway;
        camera.position.x = Math.sin(elapsed * 0.13) * 2.4 * flight.sway;
        camera.rotation.z = flight.bank + Math.sin(elapsed * 0.17) * 0.004 * flight.sway;
        camera.rotation.x = flight.lift * 0.0016;
      }

      renderer.render(scene, camera);
    };

    const start = () => {
      if (running) return;
      running = true;
      clock.getDelta();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    /* Nothing is rendered while the hero is off screen or the tab is
       in the background. */
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(host);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    /* A lost context must not leave a frozen canvas sitting over the
       photograph. */
    const onLost = (event: Event) => {
      event.preventDefault();
      stop();
      host.dataset.skyFlight = "lost";
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    /* ---- Go ---- */
    let release: (() => void) | undefined;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      build(cloudSprites(image, 5, rand));
      host.dataset.skyFlight = "ready";
      /* Behind the opening sequence there is nothing to see, and the
         flight is the first thing the website does once it has the
         screen. */
      release = afterIntro(() => tl.play());
    };
    image.onerror = () => {
      host.dataset.skyFlight = "no-plate";
    };
    image.src = src;

    return () => {
      release?.();
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      tl.kill();
      gsap.killTweensOf(flight);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      for (const item of disposables) item.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src]);

  return <div ref={hostRef} aria-hidden className="sky-flight" />;
}

/**
 * ------------------------------------------------------------------
 * THE ONE ASSET THAT WOULD CHANGE THIS
 * ------------------------------------------------------------------
 * The birds above are modelled and animated here, in code, because the
 * project has no bird asset and an unlicensed download has no place on
 * a client's site. What they give is a believable silhouette: real
 * shoulder articulation, a power stroke faster than the recovery, flap
 * and glide, banking into the turn. What they cannot give is feathers.
 *
 * To go further, the thing to buy is a rigged, animated bird — a .glb
 * with a flight cycle, from Sketchfab, TurboSquid, Quixel or CGTrader,
 * licensed for commercial web use. Drop it in `public/media/` and it
 * replaces `buildBird` and the wingbeat block in the loop: everything
 * else here — the depth, the flock behaviour, the recycling, the
 * camera — takes an animated GLTF without changing.
 * ------------------------------------------------------------------
 */
export const BIRD_ASSET = {
  required: false,
  path: "/media/bird.glb",
  note: "Optional. A rigged, commercially licensed bird with a flight cycle replaces the procedural flock.",
} as const;
