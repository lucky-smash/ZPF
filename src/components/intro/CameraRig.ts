import * as THREE from "three";

/**
 * ==================================================================
 * THE CAMERA — a rendered 35mm single-lens reflex
 * ==================================================================
 * The object the opening sequence is about. It turns, the lens comes
 * at the viewer, the shutter fires, and the website is behind the
 * light.
 *
 * ------------------------------------------------------------------
 * WHAT THIS IS, AND WHAT IT IS NOT
 * ------------------------------------------------------------------
 * It is built here, in geometry, from measured proportions. It is not
 * a scanned or purchased model, and it should not be described as a
 * photoreal one: a real camera carries moulding seams, worn edges,
 * printed lettering, screws, dust in the barrel threads and a
 * photographed environment in its glass, and none of those come out
 * of thirty primitives however carefully they are lit.
 *
 * It was built rather than downloaded because there is no camera
 * asset in this project and no licence for one, and this is the first
 * thing a visitor sees — so it cannot be a multi-megabyte download
 * that might fail, and it cannot be an unlicensed model on a client's
 * site. What it is instead is a *correctly proportioned, correctly
 * lit* camera: the lens is a real stack of rings at real radii, the
 * knurling is machined ridges in the mesh rather than a texture
 * pretending, the glass is a convex element with a coating bloom and
 * a barrel visible down inside it, and every material is physically
 * based and lit by one studio environment.
 *
 * If a licensed, high-quality GLB is bought later, see ASSET at the
 * foot of this file: the scene, the lighting, the choreography and the
 * flash all take a loaded model without changing.
 *
 * ------------------------------------------------------------------
 * HOW IT IS DRIVEN
 * ------------------------------------------------------------------
 * Nothing in here animates itself. `rig.state` is a flat bag of
 * numbers — orbit, elevation, distance, the push into the lens, the
 * three light levels, the iris, the body's recoil — and GSAP owns
 * those. The render loop reads them once per frame and integrates them
 * into transforms. So there is exactly one writer per value and no
 * second loop quietly overwriting what the timeline just set, which is
 * the same division of labour the sky flight uses.
 *
 * ------------------------------------------------------------------
 * UNITS
 * ------------------------------------------------------------------
 * One unit is one centimetre, and every dimension below is the real
 * measurement of the thing it draws: a 13.8cm body, a 9.4cm tall
 * plate, a 6.6cm lens diameter, a 6cm barrel. Working in real
 * measurements is why the lens looks like a 50mm prime and not like a
 * toy telescope — the proportion between the body and the barrel is
 * the single thing that most decides whether a drawn camera reads as
 * a camera.
 * ==================================================================
 */

/* ------------------------------------------------------------------
   THE BODY, IN CENTIMETRES
   ------------------------------------------------------------------ */
/* The corner radius is the thing that most decides whether this reads
   as a camera or as a rounded box: a real body is radiused at about
   8mm on a 94mm plate, and anything past about 10 starts to look
   moulded rather than cast. */
const BODY = { w: 13.8, h: 9.4, d: 5.2, radius: 0.78, bevel: 0.26 };

/** The optical axis. Centred across the body, a little below middle. */
const AXIS = { x: 0, y: -0.55 };

/** The front of the body, where the lens mount begins. */
const FRONT = BODY.d / 2;

/** Where the front element sits, in Z. Everything pushes toward this. */
const GLASS_Z = FRONT + 5.85;

/**
 * How close the viewing camera gets to the front element at the end of
 * the push, in centimetres from the subject's centre.
 *
 * It is a measurement rather than a factor because the framing it
 * produces has to be right: the element is 5.9cm across, and at this
 * distance with the field of view the push ends on it fills a little
 * over three quarters of the frame height. Closer than about 12 and
 * the camera is inside the front element; further than about 26 and
 * the barrel never stops being an object on a stage.
 */
const PUSH_DISTANCE = 18;

/* ==================================================================
   MATERIAL HELPERS
   ================================================================== */

/**
 * Greyscale value noise on a canvas, tiled.
 *
 * Used as a bump map, which is the cheapest honest way to give a
 * surface a surface. Without it every panel is perfectly smooth, and
 * perfectly smooth is what reads as plastic — a magnesium body shows
 * a fine cast texture and vulcanite shows a coarse one, and the only
 * difference between them here is `cell` and the bump scale they are
 * used at.
 */
function noiseTexture(size: number, cell: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const cells = Math.max(2, Math.round(size / cell));
    const grid = new Float32Array(cells * cells);
    for (let i = 0; i < grid.length; i += 1) grid[i] = Math.random();

    /* Bilinear between cell centres, so the noise is a surface rather
       than television static. Wrapped at the edges, so the texture
       tiles without a seam. */
    const image = ctx.createImageData(size, size);
    const px = image.data;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const fx = (x / size) * cells;
        const fy = (y / size) * cells;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = fx - x0;
        const ty = fy - y0;
        const i00 = (y0 % cells) * cells + (x0 % cells);
        const i10 = (y0 % cells) * cells + ((x0 + 1) % cells);
        const i01 = ((y0 + 1) % cells) * cells + (x0 % cells);
        const i11 = ((y0 + 1) % cells) * cells + ((x0 + 1) % cells);
        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);
        const top = grid[i00] + (grid[i10] - grid[i00]) * sx;
        const bottom = grid[i01] + (grid[i11] - grid[i01]) * sx;
        const value = Math.round((top + (bottom - top) * sy) * 255);
        const p = (y * size + x) * 4;
        px[p] = value;
        px[p + 1] = value;
        px[p + 2] = value;
        px[p + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

/**
 * A radial falloff, white in the middle to nothing at the edge.
 * The coating bloom in the glass, and the contact shadow on the floor.
 */
function radialTexture(stops: [number, string][]): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * The engraved scale that runs round a lens barrel.
 *
 * Ticks cut into dark paint, long at the marked stops and short
 * between them. It is a texture rather than geometry because the ring
 * it wraps is 70mm of circumference: cutting a hundred marks into it
 * would cost more triangles than the rest of the camera put together,
 * and at the size this is seen they would be a pixel each either way.
 */
function scaleTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#16151a";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#cdbb98";
    /* Sixteen marks: eight stops, and a half between each. */
    for (let i = 0; i < 16; i += 1) {
      const x = Math.round((i / 16) * w);
      const major = i % 2 === 0;
      ctx.fillRect(x, major ? 16 : 26, major ? 4 : 3, major ? 30 : 14);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  return texture;
}

/* ==================================================================
   GEOMETRY HELPERS
   ================================================================== */

/**
 * A rounded rectangle, extruded with a real bevel.
 *
 * This is what the body shell is made of rather than a box, and the
 * bevel is the point: a chamfered edge catches the key light as a
 * bright line along the top of the camera, which is the single
 * strongest cue that an object is made of metal. A BoxGeometry has
 * one hard edge and no highlight along it at all.
 */
function shellGeometry(
  w: number,
  h: number,
  depth: number,
  radius: number,
  bevel: number,
  curveSegments = 8,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const r = Math.min(radius, w / 2, h / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, depth - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: 3,
    curveSegments,
  });
  /* Extrude builds from z = 0 forward; centre it on its own depth so
     a part's position is its middle, like every other primitive. */
  geometry.translate(0, 0, -(depth - bevel * 2) / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * A knurled ring: a cylinder whose radius rises and falls around its
 * circumference, so the ridges run along the barrel the way machined
 * ridges actually do.
 *
 * This is the detail that most separates a drawn lens from a lens.
 * The alternative is a cone gradient or a stripe texture, and both of
 * them stay flat under a moving light — these catch the key on every
 * ridge and go dark between them as the camera turns, because they
 * are geometry.
 */
function knurledRing(
  radius: number,
  height: number,
  ridges: number,
  depth: number,
): THREE.CylinderGeometry {
  /* Four segments per ridge: enough for the crest to round over
     rather than read as a sawtooth. */
  const segments = ridges * 4;
  const geometry = new THREE.CylinderGeometry(
    radius,
    radius,
    height,
    segments,
    1,
    true,
  );
  const position = geometry.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const angle = Math.atan2(z, x);
    const scale = 1 + (depth / radius) * Math.sin(angle * ridges);
    position.setX(i, x * scale);
    position.setZ(i, z * scale);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  /* Lathed about Y by default; the whole lens runs down Z. */
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

/** A plain barrel section, already turned to face down Z. */
function barrelGeometry(
  top: number,
  bottom: number,
  height: number,
  segments: number,
  open = true,
): THREE.CylinderGeometry {
  const geometry = new THREE.CylinderGeometry(
    top,
    bottom,
    height,
    segments,
    1,
    open,
  );
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

/** A flat annulus facing the viewer — the face of a ring. */
function faceGeometry(inner: number, outer: number, segments: number) {
  return new THREE.RingGeometry(inner, outer, segments);
}

/**
 * The front element: a shallow convex cap, lathed from an arc.
 *
 * A sphere segment would do, but a lathe lets the profile flatten
 * toward the rim the way a real element's does, and gives the edge a
 * thickness where it meets the retaining ring rather than a knife
 * edge that goes transparent at grazing angles.
 */
function glassGeometry(radius: number, bulge: number, segments: number) {
  const points: THREE.Vector2[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const r = radius * t;
    /* Flattens toward the rim: a cosine rather than a circle. */
    const z = bulge * Math.cos((t * Math.PI) / 2);
    points.push(new THREE.Vector2(r, z));
  }
  const geometry = new THREE.LatheGeometry(points, segments);
  /* Lathe spins about Y, so the profile's height runs up +Y. Turning
     it +90° about X sends +Y to +Z, which puts the bulge toward the
     viewer — the whole lens runs down Z. */
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

/* ==================================================================
   THE STUDIO
   ================================================================== */

/**
 * The environment the camera is lit and reflected by.
 *
 * Built as a scene of emissive panels and pre-filtered into a cubemap
 * — a real softbox above and to the left, a weak bounce from the
 * lower right, and a long strip behind that rims the top edges. That
 * is what a product photographer puts round a camera, and it is the
 * reason the glass has something to reflect: an unlit environment
 * makes a physically based material look like matte plastic no matter
 * how many point lights are added.
 *
 * It is also where the grade is set. The key is warm sand
 * (rgb 236,214,168 — the reference's own etching ink), the bounce is
 * a cool slate, and the proportion between them is what ties the
 * rendered camera to the warm-black photography it dissolves into.
 */
function studioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060a);

  const panel = (
    color: number,
    intensity: number,
    w: number,
    h: number,
    place: (mesh: THREE.Mesh) => void,
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      }),
    );
    place(mesh);
    scene.add(mesh);
    return mesh;
  };

  /* The key softbox: large, close, upper left. */
  panel(0xecd6a8, 6.4, 60, 40, (mesh) => {
    mesh.position.set(-42, 34, 26);
    mesh.lookAt(0, 0, 0);
  });

  /* The fill: weak, cool, lower right, far enough to wrap. */
  panel(0x8fa2bd, 1.05, 70, 50, (mesh) => {
    mesh.position.set(46, -18, 18);
    mesh.lookAt(0, 0, 0);
  });

  /* The rim strip: narrow, high, behind — this is what draws the
     bright line along the top plate and the top of the barrel. */
  panel(0xffeccd, 11.5, 92, 11, (mesh) => {
    mesh.position.set(0, 28, -42);
    mesh.lookAt(0, 0, 0);
  });

  /* A dark floor, so the underside of the camera has something to
     pick up other than black. */
  panel(0x12100e, 1, 120, 120, (mesh) => {
    mesh.position.set(0, -26, 0);
    mesh.rotation.x = -Math.PI / 2;
  });

  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.04);
  pmrem.dispose();

  /* The source scene has done its job the moment it is filtered. */
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      (object.material as THREE.Material).dispose();
    }
  });

  return target.texture;
}

/* ==================================================================
   THE RIG
   ================================================================== */

/** Everything GSAP is allowed to write. The loop only reads it. */
export interface RigState {
  /** Degrees about Y. Negative shows the lens's left flank. */
  orbit: number;
  /** Degrees above the optical axis. */
  elevation: number;
  /** Centimetres from the subject, before the push. */
  distance: number;
  /** 0 → framed on the whole camera, 1 → inside the front element. */
  push: number;
  /** Field of view in degrees. Narrows through the push. */
  fov: number;
  /** The three lights, 0–1, raised through the reveal. */
  key: number;
  fill: number;
  rim: number;
  /** 1 → iris wide open, 0 → closed. The shutter. */
  iris: number;
  /** Recoil, in centimetres, when the shutter fires. */
  kick: number;
  /** Exposure, so the scene can be brought up out of black. */
  exposure: number;
  /** How bright the coating bloom in the glass sits. */
  bloom: number;
}

export interface CameraRig {
  readonly state: RigState;
  /**
   * Compiles every shader and uploads every texture, now.
   *
   * It has to happen before the sequence plays rather than during it.
   * A program compile is a synchronous stall of a few hundred
   * milliseconds, GSAP's clock keeps running through it, and the
   * timeline comes out the other side already a second and a half in
   * — so the whole atmospheric reveal is skipped and the sequence
   * begins mid-turn. Measured: the turn arrived at 657ms into a
   * timeline that places it at 1900.
   *
   * Doing it here puts that stall in the hold before the first beat,
   * where there is nothing to miss.
   */
  warm(): void;
  /** Renders one frame from the current state. */
  render(time: number): void;
  /** Call on resize. */
  resize(width: number, height: number): void;
  /**
   * Where the centre of the front element currently is on screen, in
   * percentages — which is where the flash has to come from.
   * Returns null before the first frame.
   */
  lensPoint(): { x: number; y: number } | null;
  /** Drops every GPU resource this created. */
  dispose(): void;
  readonly canvas: HTMLCanvasElement;
}

export interface RigOptions {
  width: number;
  height: number;
  /** Fewer segments, no shadow map, lower pixel ratio. */
  lean?: boolean;
}

/** True when a context can actually be had. Cheap, and cached. */
let webglChecked: boolean | null = null;

export function supportsWebGL(): boolean {
  if (webglChecked !== null) return webglChecked;
  try {
    const canvas = document.createElement("canvas");
    webglChecked = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    webglChecked = false;
  }
  return webglChecked;
}

export function createCameraRig(options: RigOptions): CameraRig {
  const { width, height, lean = false } = options;

  /* ---- THE RENDERER ----------------------------------------------
     ACES filmic, because the key light is deliberately hot enough to
     blow a highlight on the chrome and a linear transfer would clip
     it to a flat white disc. Exposure is a tweenable value — the
     scene is brought up out of black through it rather than by fading
     a black overlay away, which is the difference between a camera
     being lit and a camera being uncovered. */
  const renderer = new THREE.WebGLRenderer({
    antialias: !lean,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lean ? 1.5 : 2));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0;

  if (!lean) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const scene = new THREE.Scene();
  const view = new THREE.PerspectiveCamera(34, width / height, 0.1, 400);

  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  /* ---- THE ENVIRONMENT ------------------------------------------- */
  const environment = studioEnvironment(renderer);
  scene.environment = environment;
  disposables.push(environment);

  /* ---- MATERIALS -------------------------------------------------
     Five, and every one of them is a real material with a real
     roughness. Nothing here is emissive and nothing glows: every
     highlight on the camera is the studio above reflecting in it. */
  const segments = lean ? 48 : 96;

  const bodyBump = keep(noiseTexture(256, 3));
  bodyBump.repeat.set(5, 5);
  const hideBump = keep(noiseTexture(256, 7));
  hideBump.repeat.set(16, 16);

  /** Painted magnesium alloy: the top plate, the baseplate, the shell. */
  const alloy = keep(
    new THREE.MeshStandardMaterial({
      /* Lifted from near-black. A body at 0x1a on a black stage has
         no value left to model with — the bevels and the top plate
         come out as one flat shape, and the object stops reading as
         metal. This is still a dark grey camera; it is just one that
         has somewhere to go when the key lands on it. */
      color: 0x2c2a30,
      roughness: 0.4,
      metalness: 0.68,
      bumpMap: bodyBump,
      bumpScale: 0.07,
      envMapIntensity: 1.26,
    }),
  );

  /** Vulcanite: the covering on the front and back of the body. */
  const hide = keep(
    new THREE.MeshStandardMaterial({
      /* Lifted, and given more of the room. At 0x141214 with half the
         environment the covering fell to the same value as the stage
         behind it and took the whole silhouette with it — the body
         read as a hole rather than as leather. */
      color: 0x1d1a1c,
      roughness: 0.82,
      metalness: 0.04,
      bumpMap: hideBump,
      bumpScale: 0.4,
      envMapIntensity: 0.78,
    }),
  );

  /** Machined aluminium: the lens rings, the dials. */
  const machined = keep(
    new THREE.MeshStandardMaterial({
      /* Blackened metal, not brass.

         These two rings are the focus and the aperture, and together
         they are the largest metal surface on the object — putting
         brass on them turned the whole lens gold, which is the one
         thing a vintage barrel never is. A real one is blackened
         alloy with its knurling catching the key, and the brass is
         saved for the name ring. Warm in the shadow rather than
         neutral, so it still belongs to the room. */
      color: 0x55504a,
      roughness: 0.3,
      metalness: 1,
      envMapIntensity: 1.2,
    }),
  );

  /** Bright chrome: the name ring, the release, the shoe. */
  const chrome = keep(
    new THREE.MeshStandardMaterial({
      /* Champagne, a half step off white, so the name ring and the
         release separate from the brass below them without turning
         into chrome. */
      color: 0xd6c9ad,
      roughness: 0.12,
      metalness: 1,
      envMapIntensity: 1.72,
    }),
  );

  /** Aged brass. One ring, and the index mark's collar — that is the
      whole of it. Restraint is the difference between an instrument
      and an ornament. */
  const brass = keep(
    new THREE.MeshStandardMaterial({
      color: 0x8c7549,
      roughness: 0.34,
      metalness: 1,
      envMapIntensity: 1.3,
    }),
  );

  /** The painted ring the aperture scale is engraved into. */
  const engraved = keep(
    new THREE.MeshStandardMaterial({
      map: keep(scaleTexture()),
      roughness: 0.56,
      metalness: 0.18,
      envMapIntensity: 0.8,
    }),
  );

  /** The index mark. The one piece of colour on the whole object. */
  const accent = keep(
    new THREE.MeshStandardMaterial({
      color: 0x8e2a1c,
      roughness: 0.42,
      metalness: 0.1,
      envMapIntensity: 0.6,
    }),
  );

  /** Flat black: the baffles, the mount, the iris blades. */
  const matte = keep(
    new THREE.MeshStandardMaterial({
      color: 0x08080a,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.22,
    }),
  );

  /**
   * The same flat black, seen from inside.
   *
   * Its own material rather than `matte` with the side flipped: these
   * are shared instances, and turning one inside out would turn the
   * baffles, the mount and the iris blades inside out with it.
   */
  const matteInner = keep(
    new THREE.MeshStandardMaterial({
      color: 0x07070a,
      roughness: 0.96,
      metalness: 0,
      envMapIntensity: 0.16,
      side: THREE.BackSide,
    }),
  );

  /**
   * The front element.
   *
   * Opaque and nearly black, with a clearcoat over it — which is what
   * a coated element photographs as. Transmission would be the
   * physically literal choice and the wrong one: it costs a second
   * render pass per frame, and a real lens does not show you what is
   * behind it anyway. What it shows is the room, so what this needs
   * is reflection.
   */
  const glass = keep(
    new THREE.MeshPhysicalMaterial({
      color: 0x020306,
      roughness: 0.022,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      /* A high index of refraction narrows the Fresnel falloff, so the
         element is nearly black where it faces the viewer and bright
         only at the rim and where the softbox lands. At 1.5 with the
         environment turned up it mirrors the whole room evenly, which
         is what makes a lens render as a shiny ball. */
      ior: 1.85,
      reflectivity: 0.85,
      envMapIntensity: 1.35,
    }),
  );

  /* ---- THE CAMERA ITSELF -----------------------------------------
     One group for the whole object. It does NOT turn: `orbit` moves
     the viewing camera around it instead.

     That is a real decision and it has to be one or the other. Turning
     the object *and* orbiting the viewing camera by the same angle
     compounds — the apparent rotation comes out at twice what the
     timeline asked for, and the push at the end of the sequence walks
     down an axis the lens is no longer pointing along. Orbiting the
     view is the one that keeps the optical axis where the push can
     find it, and the studio still sweeps across the metal because the
     environment is fixed in world space and the view vector is not. */
  const rig = new THREE.Group();
  scene.add(rig);

  /** The part that recoils when the shutter fires. */
  const chassis = new THREE.Group();
  rig.add(chassis);

  const mesh = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Object3D = chassis,
  ) => {
    const item = new THREE.Mesh(keep(geometry), material);
    item.castShadow = !lean;
    parent.add(item);
    return item;
  };

  /* The shell. */
  const shell = mesh(
    shellGeometry(BODY.w, BODY.h, BODY.d, BODY.radius, BODY.bevel),
    alloy,
  );
  shell.receiveShadow = !lean;

  /* The vulcanite, as panels standing just off the shell on both
     faces, so there is a real step where the covering ends. */
  for (const z of [FRONT + 0.015, -FRONT - 0.015]) {
    /* Standing further proud than it did: at 0.12 deep the covering
       was flush enough with the shell that the step where it ends
       never caught the key, and the whole front read as one flat
       slab of paint rather than as leather laid onto metal. */
    const panel = mesh(
      shellGeometry(BODY.w - 0.5, BODY.h - 0.9, 0.3, 0.62, 0.07, 6),
      hide,
    );
    panel.position.z = z;
  }

  /* The grip, on the viewer's left — this is a front elevation, so
     the photographer's right hand is on that side. Proud of the front
     plate, and swelling past the body's own edge. */
  const grip = mesh(
    shellGeometry(3.0, BODY.h - 0.5, BODY.d + 1.3, 0.7, 0.28, 8),
    hide,
  );
  grip.position.set(-BODY.w / 2 + 1.3, -0.08, 0.2);

  /* The pentaprism. Narrower than the body and set back from the
     front plate, with the eyepiece behind it. */
  const prism = mesh(shellGeometry(5.0, 2.9, 4.3, 0.3, 0.18, 6), alloy);
  prism.position.set(0, BODY.h / 2 + 1.05, 0.35);

  const eyepiece = mesh(barrelGeometry(1.0, 1.0, 0.9, 24, false), matte);
  eyepiece.position.set(0, BODY.h / 2 + 0.95, -1.75);

  /* The accessory shoe on top of the prism. */
  const shoe = mesh(shellGeometry(2.3, 1.5, 0.34, 0.1, 0.04, 4), chrome);
  shoe.rotation.x = -Math.PI / 2;
  shoe.position.set(0, BODY.h / 2 + 2.56, 0.3);

  /* The top plate's controls: the shutter release on a collar, the
     mode dial beside it, the rewind knob on the far side. */
  const release = mesh(barrelGeometry(0.42, 0.42, 0.3, 20, false), chrome);
  release.position.set(-3.6, BODY.h / 2 + 0.12, 0.55);
  release.rotation.x = Math.PI / 2;

  const collar = mesh(barrelGeometry(0.78, 0.78, 0.26, 24, false), machined);
  collar.position.set(-3.6, BODY.h / 2 - 0.02, 0.55);
  collar.rotation.x = Math.PI / 2;

  const dial = mesh(knurledRing(1.12, 0.5, 40, 0.03), machined);
  dial.position.set(-5.2, BODY.h / 2 + 0.1, -1.0);
  dial.rotation.x = Math.PI / 2;

  const rewind = mesh(knurledRing(0.95, 0.4, 34, 0.028), machined);
  rewind.position.set(5.1, BODY.h / 2 + 0.08, -0.9);
  rewind.rotation.x = Math.PI / 2;

  /* Strap lugs. Small, and the single cheapest thing that says a
     camera is carried rather than mounted — a 35mm body is never
     without them, and their absence is read long before their
     presence is noticed. */
  for (const side of [-1, 1]) {
    const lug = mesh(shellGeometry(1.0, 1.25, 0.46, 0.3, 0.1, 5), machined);
    lug.rotation.y = Math.PI / 2;
    lug.position.set(side * (BODY.w / 2 + 0.06), BODY.h / 2 - 1.5, 0);
  }

  /* ---- THE LENS ---------------------------------------------------
     A stack of rings down the optical axis, at real radii. Read from
     the mount outward, this is: the mount flange, the aperture ring,
     the barrel waist, the focus ring, the name ring, the retaining
     rim, and the element itself.
     ------------------------------------------------------------------ */
  const lens = new THREE.Group();
  lens.position.set(AXIS.x, AXIS.y, 0);
  chassis.add(lens);

  const ring = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    z: number,
  ) => {
    const item = mesh(geometry, material, lens);
    item.position.z = z;
    return item;
  };

  /* The mount flange, standing off the body plate. */
  ring(barrelGeometry(3.62, 3.62, 0.5, segments), machined, FRONT + 0.25);
  const flangeFace = ring(faceGeometry(3.3, 3.62, segments), machined, FRONT + 0.5);
  flangeFace.castShadow = false;

  /* Aperture ring: fine knurling, because it is clicked rather than
     turned through a long travel. */
  /* Ridge counts are high on purpose. Real knurling on a 70mm barrel
     runs to a hundred-odd ridges; at forty it stops being a machined
     finish and starts being a gear. */
  ring(knurledRing(3.52, 1.25, 104, 0.035), machined, FRONT + 1.15);

  /* The waist: painted, and carrying the aperture scale. This is
     where a real barrel puts its markings — between the ring you
     click and the ring you turn. */
  ring(barrelGeometry(3.38, 3.38, 1.2, 96), engraved, FRONT + 2.3);

  /* And the index mark the scale is read against, at twelve o'clock
     on the barrel. */
  const index = mesh(barrelGeometry(0.11, 0.11, 0.3, 10, false), accent, lens);
  index.position.set(0, 3.42, FRONT + 3.05);
  index.rotation.x = Math.PI / 2;

  /* Focus ring: coarse, deep knurling with a long travel. */
  ring(knurledRing(3.58, 2.0, 76, 0.055), machined, FRONT + 3.85);

  /* The name ring, in brass, where a real lens carries its
     specification — and the only brass on the camera. */
  ring(barrelGeometry(3.42, 3.42, 0.52, segments), brass, FRONT + 5.1);

  /* The retaining rim that holds the element in. */
  ring(barrelGeometry(3.34, 3.3, 0.5, segments), alloy, FRONT + 5.6);
  const rim = ring(faceGeometry(2.92, 3.32, segments), alloy, FRONT + 5.85);
  rim.castShadow = false;

  /* The barrel's inside: a dark taper running back from the element,
     so there is real depth down the lens rather than a lit disc. */
  const well = ring(
    barrelGeometry(2.9, 1.5, 4.6, segments),
    matteInner,
    FRONT + 3.4,
  );
  well.castShadow = false;

  /* Two baffles down the well, which is what actually reads as
     "there are elements in there". */
  for (const [z, inner, outer] of [
    /* The first one reaches almost to the barrel wall on purpose: it
       is what hides the outer ends of the iris blades behind it. */
    [FRONT + 3.3, 1.9, 3.1],
    [FRONT + 2.1, 1.35, 2.0],
  ] as const) {
    const baffle = ring(faceGeometry(inner, outer, segments), matte, z);
    baffle.castShadow = false;
  }

  /* The rear element, deep in the barrel, catching a little light. */
  const rear = ring(glassGeometry(1.5, 0.1, segments), glass, FRONT + 1.6);
  rear.castShadow = false;

  /* ---- THE IRIS ---------------------------------------------------
     Eight blades on the optical axis. Each one is a plane pushed out
     along its own radius and rotated about the axis, so at `iris` = 1
     they sit outside the aperture and leave it clean, and as it falls
     they slide in and meet in the middle as an octagon. That is what
     a diaphragm does; a ring of scaling wedges is not.
     ------------------------------------------------------------------ */
  const BLADES = 8;
  const irisGroup = new THREE.Group();
  irisGroup.position.z = FRONT + 2.75;
  lens.add(irisGroup);

  /**
   * One blade, with its origin at its INNER edge rather than its
   * centre — the plane spans 0 to 1.9 along its own radius, so
   * positioning it at radius r puts its inner edge exactly there.
   *
   * That offset is the whole of making this behave. Centred blades
   * have to be pushed out by half their own length to clear the
   * aperture, and at that distance their far corners stand further
   * from the axis than the barrel is wide — so eight of them come
   * through the outside of the lens as a dark gear. Offset, the
   * geometry is bounded: at the widest setting here the farthest
   * corner sits at 3.24, inside the barrel's own 3.3.
   */
  const bladeGeometry = keep(new THREE.PlaneGeometry(1.9, 1.5));
  bladeGeometry.translate(0.95, 0, 0);
  const blades: THREE.Mesh[] = [];
  for (let i = 0; i < BLADES; i += 1) {
    const blade = new THREE.Mesh(bladeGeometry, matte);
    blade.rotation.z = (i / BLADES) * Math.PI * 2;
    blade.castShadow = false;
    irisGroup.add(blade);
    blades.push(blade);
  }

  /* ---- THE FRONT ELEMENT ----------------------------------------- */
  /* Sagitta of about 5% of the radius. A 50mm front element is very
     nearly flat; at the 15% it was first drawn at, it is a marble. */
  const element = ring(glassGeometry(2.94, 0.15, segments), glass, GLASS_Z);
  element.castShadow = false;

  /**
   * The coating bloom.
   *
   * A real coated element throws a soft off-centre flare of its
   * coating's colour back at the viewer. Additive, so it adds light
   * rather than covering the reflection underneath it, and sat just
   * in front of the glass — off-axis, because a bloom centred in the
   * element reads as a glowing eye.
   */
  const bloomTexture = keep(
    radialTexture([
      [0, "rgba(255,214,170,0.95)"],
      [0.35, "rgba(226,142,96,0.42)"],
      [0.7, "rgba(120,80,70,0.12)"],
      [1, "rgba(0,0,0,0)"],
    ]),
  );
  /* Small, and well off the axis.
     At four centimetres square and centred it stopped being a flare on
     the glass and became the glass: a warm dome where a dark element
     with one sharp highlight should be. A coating flare is a small
     bright thing near the rim, and the element's own reflection of the
     softbox is what the viewer should mostly be seeing. */
  const bloom = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(2.7, 2.7)),
    keep(
      new THREE.MeshBasicMaterial({
        map: bloomTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.4,
      }),
    ),
  );
  bloom.position.set(AXIS.x - 1.18, AXIS.y + 1.14, GLASS_Z + 0.26);
  /* Left in the element's own plane rather than turned to face the
     viewer: it is a flare *on the glass*, so it should foreshorten as
     the camera orbits away from the front of the lens, which is what a
     reflection on a curved surface does. A billboard would keep it
     perfectly round from every angle and read as a sprite. */
  chassis.add(bloom);

  /** Where the flash comes from, tracked in world space. */
  const lensAnchor = new THREE.Object3D();
  lensAnchor.position.set(AXIS.x, AXIS.y, GLASS_Z);
  chassis.add(lensAnchor);

  /* ---- THE ROOM ---------------------------------------------------
     A floor the camera stands on, and a contact shadow where it meets
     it. The floor is nearly black and slightly rough: it is there to
     take a shadow and a faint reflection of the key, not to be seen.
     ------------------------------------------------------------------ */
  const floorY = -BODY.h / 2 - 0.05;

  /**
   * The ground is a shadow catcher and nothing else.
   *
   * It was a dark MeshStandardMaterial first, and that was wrong for a
   * reason worth keeping written down: the viewing camera looks along
   * this plane at about ten degrees, which is exactly where Fresnel
   * reflection is strongest, so even a nearly black surface at
   * roughness 0.74 came back as a broad pale sheen off the studio
   * environment — a lit dome behind the camera, brighter than the
   * camera. Physically correct, and the opposite of the shot.
   *
   * ShadowMaterial draws only where something occludes a light. So
   * there is no albedo to light, no sheen to catch and no far edge to
   * read as a horizon: the object stands in the dark, and the only
   * thing on the ground is its own shadow.
   */
  const floor = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(70, 70)),
    keep(new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.5 })),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  floor.receiveShadow = !lean;
  scene.add(floor);

  /* The contact shadow: a soft dark pool directly under the body.
     A shadow map alone leaves the point where an object meets a
     surface too open — this is the occlusion that sells the contact,
     and it is one textured quad. */
  const contact = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(26, 15)),
    keep(
      new THREE.MeshBasicMaterial({
        map: keep(
          radialTexture([
            [0, "rgba(0,0,0,0.82)"],
            [0.45, "rgba(0,0,0,0.42)"],
            [1, "rgba(0,0,0,0)"],
          ]),
        ),
        transparent: true,
        depthWrite: false,
      }),
    ),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, floorY + 0.02, 1.4);
  scene.add(contact);

  /* ---- THE LIGHTS -------------------------------------------------
     Three, matching the environment panel for panel, because the
     environment gives reflection and these give direction and the
     shadow. Their intensities are tweened, which is how the camera is
     revealed: the object is in position from the first frame and the
     room comes up around it.
     ------------------------------------------------------------------ */
  const keyLight = new THREE.DirectionalLight(0xffeccd, 0);
  keyLight.position.set(-16, 20, 16);
  keyLight.castShadow = !lean;
  if (!lean) {
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 70;
    keyLight.shadow.camera.left = -18;
    keyLight.shadow.camera.right = 18;
    keyLight.shadow.camera.top = 18;
    keyLight.shadow.camera.bottom = -18;
    keyLight.shadow.bias = -0.0012;
    keyLight.shadow.normalBias = 0.022;
    keyLight.shadow.radius = 3;
  }
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9fb2cc, 0);
  fillLight.position.set(14, -6, 12);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xfff3e0, 0);
  rimLight.position.set(2, 14, -18);
  scene.add(rimLight);

  /* A very low ambient, so a surface turned away from all three is
     dark rather than absent. */
  /* Low, but not nothing. The front plate faces the viewer and the
     key is behind the camera's shoulder, so without this the whole
     front of the body — the half a visitor spends the sequence
     looking at — has no value at all. */
  const ambient = new THREE.AmbientLight(0x2a2824, 0.9);
  scene.add(ambient);

  /* ==================================================================
     STATE
     ================================================================== */
  const state: RigState = {
    orbit: -34,
    elevation: 13,
    distance: 44,
    push: 0,
    fov: 34,
    key: 0,
    fill: 0,
    rim: 0,
    iris: 1,
    kick: 0,
    exposure: 0,
    bloom: 0,
  };

  const screen = new THREE.Vector3();
  let lensScreen: { x: number; y: number } | null = null;

  /* The viewing camera's target: the body at first, drifting to the
     front element as the push takes over, so the lens ends up dead
     centre of frame without the whole composition lurching. */
  const bodyTarget = new THREE.Vector3(0, 0.2, 0);
  const lensTarget = new THREE.Vector3(AXIS.x, AXIS.y, GLASS_Z);
  const target = new THREE.Vector3();

  const DEG = Math.PI / 180;

  function render(time: number) {
    /* ---- the object ------------------------------------------------
       It recoils when the shutter fires, and otherwise only breathes:
       a fraction of a degree of sway, far too small to read as
       movement and just enough that the highlight on the top plate is
       never perfectly still. */
    rig.rotation.z = Math.sin(time * 0.00031) * 0.0045;
    chassis.position.z = state.kick;

    /* ---- the iris --------------------------------------------------
       Each blade slides out along its own radius. At 1 the blades are
       back at the barrel wall and the aperture is clear; at 0 they
       have crossed the axis and met. */
    const reach = -0.3 + state.iris * 1.55;
    for (let i = 0; i < blades.length; i += 1) {
      const angle = (i / blades.length) * Math.PI * 2;
      blades[i].position.set(Math.cos(angle) * reach, Math.sin(angle) * reach, 0);
    }

    /* ---- the lights ------------------------------------------------ */
    keyLight.intensity = state.key * 3.4;
    fillLight.intensity = state.fill * 1.6;
    rimLight.intensity = state.rim * 3.4;
    (bloom.material as THREE.MeshBasicMaterial).opacity = state.bloom;

    /* ---- the viewing camera ----------------------------------------
       Orbit and elevation put it on a sphere about the subject; the
       push then walks it in along the optical axis toward the front
       element and narrows the field of view as it goes.

       Narrowing while closing the distance is the whole of Shot C: a
       flat zoom enlarges the picture, and moving in while the field
       of view tightens compresses the barrel and makes the glass come
       at the viewer. */
    const eased = state.push * state.push * (3 - 2 * state.push);
    target.copy(bodyTarget).lerp(lensTarget, eased);

    const radius = state.distance + (PUSH_DISTANCE - state.distance) * eased;
    const yaw = state.orbit * DEG;
    /* The push flattens the elevation as it closes, so the shot ends
       square on the optical axis rather than looking down into it. */
    const pitch = state.elevation * DEG * (1 - eased * 0.86);

    view.position.set(
      target.x + Math.sin(yaw) * Math.cos(pitch) * radius,
      target.y + Math.sin(pitch) * radius,
      target.z + Math.cos(yaw) * Math.cos(pitch) * radius,
    );
    view.lookAt(target);
    view.fov = state.fov;
    view.updateProjectionMatrix();

    renderer.toneMappingExposure = state.exposure;

    renderer.render(scene, view);

    /* Where the glass landed, for the flash to come out of. */
    lensAnchor.getWorldPosition(screen);
    screen.project(view);
    lensScreen = {
      x: (screen.x * 0.5 + 0.5) * 100,
      y: (-screen.y * 0.5 + 0.5) * 100,
    };
  }

  return {
    state,
    warm() {
      renderer.compile(scene, view);
      /* One real frame, so anything compile() misses — the shadow
         pass, the depth-only programs — is paid for here too. */
      render(0);
    },
    render,
    resize(w: number, h: number) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lean ? 1.5 : 2));
      renderer.setSize(w, h, false);
      view.aspect = w / h;
      view.updateProjectionMatrix();
    },
    lensPoint: () => lensScreen,
    dispose() {
      for (const item of disposables) item.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
    canvas: renderer.domElement,
  };
}

/**
 * ------------------------------------------------------------------
 * THE ONE ASSET THAT WOULD CHANGE THIS
 * ------------------------------------------------------------------
 * The camera above is modelled here, in code, because the project has
 * no camera asset and an unlicensed download has no place on a
 * client's site. What it gives is correct proportion, real machined
 * geometry, physically based materials and one coherent studio. What
 * it cannot give is the things that only exist on a manufactured
 * object: moulding seams, screw heads, printed lettering, worn paint
 * on the edges, and the dust and micro-scratches that make a
 * photograph of a lens read as a photograph.
 *
 * To go further, the thing to buy is a scanned or hand-built body
 * with its maps — a .glb with albedo, roughness, metalness and normal
 * textures, from Sketchfab, TurboSquid, Quixel or CGTrader, licensed
 * for commercial web use. Drop it in `public/media/`, load it with
 * GLTFLoader, and parent it to `chassis` in place of the block that
 * builds the shell and the lens: the studio environment, the three
 * lights, the iris, the choreography, the lens anchor the flash comes
 * out of and the whole of CameraIntro take a loaded model without
 * changing. Keep it under about 2.5 MB with Draco or Meshopt — it is
 * the first thing a visitor waits for.
 * ------------------------------------------------------------------
 */
export const CAMERA_ASSET = {
  required: false,
  path: "/media/camera.glb",
  note: "Optional. A licensed, textured camera body replaces the procedural geometry; the scene, lighting and choreography are unchanged.",
} as const;
