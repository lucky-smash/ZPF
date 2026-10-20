import { intro, site } from "@/data";

/** The six iris leaves. The angle is the only thing that differs. */
const BLADES = [0, 60, 120, 180, 240, 300];

/** Lens centre and the radius of the front element, in camera units. */
const LENS = { x: 50, y: 37.5, glass: 10.8 };

/** Shutter release centre, reused by the CSS affordances over it. */
const RELEASE = { x: 20, y: 6.8 };

interface RetroCameraProps {
  onCapture: () => void;
  /** Spent once the sequence is running, so a second press is impossible. */
  disabled: boolean;
}

/**
 * A VINTAGE 35MM SINGLE-LENS REFLEX
 *
 * Drawn, not photographed and not modelled. There is no camera asset in
 * the project and no licence for one, so the alternative to drawing it
 * was a stock photograph nobody owns or a WebGL scene for one static
 * object — and this is the first thing a visitor sees, so it cannot be
 * a download that might fail.
 *
 * It is drawn in SVG rather than in CSS boxes, which is the whole
 * difference between this and what it replaces. Four things only vector
 * drawing gives:
 *
 *  - Real optical geometry. The barrel is concentric rings at measured
 *    radii, and the knurling on the focus and aperture rings is a
 *    dashed stroke around the annulus — so the ridges run radially, as
 *    machined ridges do, instead of being a cone gradient pretending.
 *  - Surface. One feTurbulence pass lays a fine irregular grain over
 *    the whole body, under a drawn cross-hatch for the vulcanite. CSS
 *    cannot make noise; without it every panel is perfectly smooth,
 *    and perfectly smooth is what reads as plastic.
 *  - One light. A soft key from the upper left, a weak fill from the
 *    lower right, a rim along the top edges, and a shadow on the
 *    ground underneath. Every gradient in here is pointed the same
 *    way, which is what the previous drawing was missing most.
 *  - Depth in the glass. The front element is a well, a coating bloom
 *    off-centre, the studio softbox reflected in it, and the barrel's
 *    own inner ring visible down inside — layered, and clipped to the
 *    element, rather than one lit disc.
 *
 * The layout is a true front elevation, which means it is handed the
 * way a camera actually is when it is pointed at you: the photographer's
 * right hand is the viewer's left, so the shutter release and the
 * advance lever are on the left of the drawing and the rewind knob is
 * on the right. It looks "backwards" next to a product shot taken from
 * three-quarters. It is not.
 *
 * Every dimension is a camera unit, and the reel above declares what a
 * unit is worth — so the whole object scales as one physical thing
 * rather than as a dozen breakpoints. The viewBox is offset by the room
 * the prism needs above and the shadow needs below, which is why the
 * body sits at 0–100 by 0–62 inside it: the film slot stays exactly
 * where the film expects to come out.
 *
 * The parts the sequence animates carry data attributes rather than
 * refs, so the choreography stays in CameraIntro and this file stays
 * drawing. Nothing about those hooks changed with the redraw.
 *
 * The whole camera is the control. Pressing anywhere on the body fires
 * the shutter, which is how a camera behaves in the hand, and gives
 * touch a target the size of the viewport rather than a 40px dome. The
 * release is still drawn, lit and pressed, so it is obvious *where* the
 * camera is being pressed.
 */
export function RetroCamera({ onCapture, disabled }: RetroCameraProps) {
  return (
    <button
      type="button"
      data-cam
      data-cursor-label="Capture"
      onClick={onCapture}
      disabled={disabled}
      aria-label={intro.action}
      className="cam"
    >
      <svg
        className="cam-art"
        viewBox="-10 -14 120 90"
        aria-hidden
        focusable="false"
      >
        <defs>
          {/* ---- MATERIALS -------------------------------------------
              One light: key from the upper left, fill from the lower
              right. Every gradient below is turned the same way. */}

          {/* Brushed top plate. */}
          <linearGradient id="cam-plate" x1="0" y1="0" x2="0.18" y2="1">
            <stop offset="0" stopColor="#56575e" />
            <stop offset="0.14" stopColor="#3e3f46" />
            <stop offset="0.5" stopColor="#2b2c31" />
            <stop offset="0.82" stopColor="#1c1d21" />
            <stop offset="1" stopColor="#0e0f12" />
          </linearGradient>

          {/* The pentaprism housing, a facet brighter than the plate. */}
          <linearGradient id="cam-prism" x1="0.1" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#63646b" />
            <stop offset="0.34" stopColor="#3f4046" />
            <stop offset="1" stopColor="#1f2024" />
          </linearGradient>

          {/* Body shell under the leatherette. */}
          <linearGradient id="cam-shell" x1="0.08" y1="0" x2="0.72" y2="1">
            <stop offset="0" stopColor="#1b1b1f" />
            <stop offset="0.46" stopColor="#121216" />
            <stop offset="1" stopColor="#07070a" />
          </linearGradient>

          {/* Machined metal, for knobs and the chrome name ring: bright
              where the key light lands, dark where it falls away. */}
          <linearGradient id="cam-chrome" x1="0.12" y1="0" x2="0.88" y2="1">
            <stop offset="0" stopColor="#d8d4cb" />
            <stop offset="0.22" stopColor="#9d9a92" />
            <stop offset="0.52" stopColor="#4e4c48" />
            <stop offset="0.78" stopColor="#8e8b83" />
            <stop offset="1" stopColor="#35332f" />
          </linearGradient>

          <linearGradient id="cam-knob" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#787982" />
            <stop offset="0.42" stopColor="#4b4c54" />
            <stop offset="1" stopColor="#23242a" />
          </linearGradient>

          {/* Lens barrel. */}
          <linearGradient id="cam-barrel" x1="0.14" y1="0.04" x2="0.82" y2="0.94">
            <stop offset="0" stopColor="#43444a" />
            <stop offset="0.3" stopColor="#272830" />
            <stop offset="0.66" stopColor="#16171b" />
            <stop offset="1" stopColor="#0b0b0e" />
          </linearGradient>

          {/* A rim of key light along the top left of a round part,
              falling to nothing before the bottom right. */}
          <linearGradient id="cam-rim" x1="0.1" y1="0" x2="0.78" y2="0.9">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="0.38" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="0.75" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* The soft key, laid over the plate and the prism. */}
          <linearGradient id="cam-key" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.17" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* The weak fill coming back off the floor. */}
          <linearGradient id="cam-fill" x1="1" y1="1" x2="0.3" y2="0.1">
            <stop offset="0" stopColor="#c7b9a4" stopOpacity="0.085" />
            <stop offset="0.42" stopColor="#c7b9a4" stopOpacity="0.015" />
            <stop offset="1" stopColor="#c7b9a4" stopOpacity="0" />
          </linearGradient>

          {/* ---- THE FRONT ELEMENT ---------------------------------- */}
          <radialGradient id="cam-glass" cx="0.37" cy="0.29" r="0.82">
            <stop offset="0" stopColor="#2b3551" />
            <stop offset="0.33" stopColor="#121a2c" />
            <stop offset="0.71" stopColor="#05070d" />
            <stop offset="1" stopColor="#010205" />
          </radialGradient>

          {/* Multi-coating. Two blooms, one cold and one green, which is
              what a coated element throws back at this angle. */}
          <radialGradient id="cam-coat-cold" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#4a63b4" stopOpacity="0.5" />
            <stop offset="0.55" stopColor="#2c3a73" stopOpacity="0.17" />
            <stop offset="1" stopColor="#1b2448" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="cam-coat-warm" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#2f7d6d" stopOpacity="0.34" />
            <stop offset="1" stopColor="#1d4a42" stopOpacity="0" />
          </radialGradient>

          {/* The edge of the glass, catching the key. */}
          <linearGradient id="cam-glass-edge" x1="0.12" y1="0" x2="0.8" y2="0.92">
            <stop offset="0" stopColor="#cfd6e2" stopOpacity="0.42" />
            <stop offset="0.34" stopColor="#8d97a8" stopOpacity="0.08" />
            <stop offset="0.72" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#9aa3b4" stopOpacity="0.1" />
          </linearGradient>

          {/* The point of light that gathers behind the iris before the
              flash leaves, so it comes *through* the aperture. */}
          <radialGradient id="cam-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fffbf2" stopOpacity="0.96" />
            <stop offset="0.44" stopColor="#ffead0" stopOpacity="0.36" />
            <stop offset="0.74" stopColor="#ffe3bd" stopOpacity="0" />
          </radialGradient>

          {/* And the spill over the barrel when it does. */}
          <radialGradient id="cam-bloom" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff6e6" stopOpacity="0.62" />
            <stop offset="0.38" stopColor="#fff0d7" stopOpacity="0.2" />
            <stop offset="0.66" stopColor="#fff0d7" stopOpacity="0" />
          </radialGradient>

          {/* Each iris leaf: dark, with the glint along its leading
              edge where it faces the centre of the glass. */}
          <linearGradient id="cam-blade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f1116" />
            <stop offset="0.52" stopColor="#171a20" />
            <stop offset="0.88" stopColor="#2b3039" />
            <stop offset="0.958" stopColor="#525966" />
            <stop offset="1" stopColor="#090b0e" />
          </linearGradient>

          {/* ---- SURFACE -------------------------------------------- */}
          {/* Vulcanite. The fine cross-hatch a camera body is covered
              in, drawn once and tiled. */}
          <pattern
            id="cam-hatch"
            width="2.6"
            height="2.6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="2.6" height="2.6" fill="#0d0d10" />
            <path
              d="M0 0.5h2.6M0 1.8h2.6"
              stroke="#ffffff"
              strokeOpacity="0.05"
              strokeWidth="0.42"
            />
            <path
              d="M0.6 0h0.01v2.6h-0.01z"
              stroke="#000000"
              strokeOpacity="0.45"
              strokeWidth="0.3"
            />
          </pattern>

          {/* One irregular grain over everything, so no panel is
              perfectly smooth. The only filter doing real work. */}
          <filter
            id="cam-grain"
            x="-6%"
            y="-6%"
            width="112%"
            height="112%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="2.9"
              numOctaves="3"
              seed="11"
              result="noise"
            />
            <feColorMatrix in="noise" type="saturate" values="0" />
          </filter>

          {/* Soft shadows: the one on the ground, and the hard-edged
              recesses in the plate. */}
          <filter id="cam-soft" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>

          <filter id="cam-softer" x="-40%" y="-120%" width="180%" height="340%">
            <feGaussianBlur stdDeviation="1" />
          </filter>

          {/* ---- CLIPS --------------------------------------------- */}
          <clipPath id="cam-clip-body">
            <path d="M3 0h94a3 3 0 0 1 3 3v55a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V3a3 3 0 0 1 3-3z" />
          </clipPath>

          <clipPath id="cam-clip-plate">
            <path d="M3 0h94a3 3 0 0 1 3 3v10.6H0V3a3 3 0 0 1 3-3z" />
          </clipPath>

          <clipPath id="cam-clip-front">
            <path d="M0 13.6h100V58a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V13.6z" />
          </clipPath>

          <clipPath id="cam-clip-glass">
            <circle cx={LENS.x} cy={LENS.y} r={LENS.glass} />
          </clipPath>
        </defs>

        {/* ==== THE GROUND ========================================
            Two soft pools under the corners of the body rather than
            one band across the middle: the camera is grounded, and the
            film that feeds out of the slot does not have to travel
            through its own shadow. */}
        <g className="cam-ground" filter="url(#cam-soft)">
          <ellipse cx="19" cy="63.4" rx="23" ry="4.4" fill="#000000" opacity="0.72" />
          <ellipse cx="81" cy="63.4" rx="23" ry="4.4" fill="#000000" opacity="0.72" />
          <ellipse cx="50" cy="63" rx="46" ry="2.6" fill="#000000" opacity="0.4" />
        </g>

        {/* ==== THE CAMERA ======================================== */}
        <g data-cam-body className="cam-body">
          {/* ---- Pentaprism housing, with the hot shoe on top ---- */}
          <g>
            <path
              d="M34 0 37.9-7.9a1.5 1.5 0 0 1 1.4-0.9h21.4a1.5 1.5 0 0 1 1.4 0.9L66 0z"
              fill="url(#cam-prism)"
            />
            <path
              d="M34 0 37.9-7.9a1.5 1.5 0 0 1 1.4-0.9h21.4a1.5 1.5 0 0 1 1.4 0.9L66 0z"
              fill="url(#cam-key)"
            />
            {/* The housing's own right facet turning away from the key. */}
            <path d="M62.1-8.8 66 0h-3.6l-3-8.8z" fill="#000000" opacity="0.38" />
            {/* Hot shoe: a recess with a chrome lip, not a bar laid on. */}
            <rect x="44.4" y="-8.7" width="11.2" height="2.1" rx="0.3" fill="#111115" />
            <rect x="45.1" y="-8.7" width="9.8" height="0.6" rx="0.25" fill="#5e5f67" />
            <rect x="45.1" y="-7.3" width="9.8" height="0.55" rx="0.25" fill="#46474e" />
            <rect x="48.9" y="-8.1" width="2.2" height="1.1" rx="0.25" fill="#060608" />
          </g>

          {/* ---- Top plate ------------------------------------------ */}
          <g>
            <path
              d="M3 0h94a3 3 0 0 1 3 3v10.6H0V3a3 3 0 0 1 3-3z"
              fill="url(#cam-plate)"
            />
            <g clipPath="url(#cam-clip-plate)">
              {/* Brushed, along the length of the plate. */}
              <rect
                x="0"
                y="0"
                width="100"
                height="13.6"
                fill="url(#cam-key)"
              />
              <path
                className="cam-brush"
                d="M0 0.8h100M0 1.5h100M0 2.3h100M0 3h100M0 3.8h100M0 4.5h100M0 5.3h100M0 6h100M0 6.8h100M0 7.5h100M0 8.3h100M0 9h100M0 9.8h100M0 10.5h100M0 11.3h100M0 12h100M0 12.8h100"
                stroke="#ffffff"
                strokeOpacity="0.022"
                strokeWidth="0.16"
              />
              {/* The one piece of continuous motion: the key light
                  travelling the length of the plate, so the metal is
                  alive without the camera moving. */}
              <rect
                className="cam-sheen"
                x="-46"
                y="-2"
                width="34"
                height="18"
                fill="url(#cam-key)"
                transform="skewX(-22)"
              />
            </g>
            {/* The seam where the plate meets the body. */}
            <rect x="0" y="13.1" width="100" height="0.55" fill="#000000" opacity="0.85" />
            <rect x="0" y="0.1" width="100" height="0.3" fill="#ffffff" opacity="0.12" />
          </g>

          {/* ---- Film advance lever, far left ---------------------- */}
          <g>
            <path
              d="M1.4 4.4h10.4l3.1 1.6-3.1 1.6H1.4z"
              fill="url(#cam-knob)"
            />
            <path d="M1.4 4.4h10.4l3.1 1.6H1.4z" fill="#ffffff" opacity="0.12" />
            <circle cx="12.6" cy="6" r="0.5" fill="#0a0a0c" />
          </g>

          {/* ---- The shutter release ------------------------------
              A machined collar sunk into the plate, a chrome dome
              inside it, and the cable-release thread at its centre.
              The dome is the part the sequence presses. */}
          <g>
            <ellipse
              cx={RELEASE.x}
              cy={RELEASE.y + 0.5}
              rx="5.8"
              ry="5.6"
              fill="#000000"
              opacity="0.55"
              filter="url(#cam-softer)"
            />
            <circle cx={RELEASE.x} cy={RELEASE.y} r="5.6" fill="url(#cam-knob)" />
            <circle
              cx={RELEASE.x}
              cy={RELEASE.y}
              r="5.6"
              fill="none"
              stroke="url(#cam-rim)"
              strokeWidth="0.5"
            />
            {/* The well the release sits down inside. */}
            <circle cx={RELEASE.x} cy={RELEASE.y} r="4.3" fill="#0e0e11" />
            <circle
              cx={RELEASE.x}
              cy={RELEASE.y}
              r="4.3"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.8"
              strokeWidth="0.6"
            />
            <g data-cam-dome className="cam-dome">
              <circle cx={RELEASE.x} cy={RELEASE.y} r="3.5" fill="url(#cam-chrome)" />
              <circle
                cx={RELEASE.x - 0.5}
                cy={RELEASE.y - 0.7}
                r="2.4"
                fill="#ffffff"
                opacity="0.17"
              />
              {/* The cable-release thread: a real mechanical control,
                  not a painted dot. */}
              <circle cx={RELEASE.x} cy={RELEASE.y} r="1.35" fill="#16161a" />
              <circle
                cx={RELEASE.x}
                cy={RELEASE.y}
                r="1.35"
                fill="none"
                stroke="#000000"
                strokeOpacity="0.7"
                strokeWidth="0.35"
              />
              <circle cx={RELEASE.x} cy={RELEASE.y} r="0.62" fill="#6d1018" />
              <circle
                cx={RELEASE.x - 0.14}
                cy={RELEASE.y - 0.18}
                r="0.3"
                fill="#b8202c"
                opacity="0.75"
              />
            </g>
          </g>

          {/* ---- Shutter speed dial -------------------------------- */}
          <g>
            <circle cx="31.4" cy="6.6" r="4.4" fill="url(#cam-knob)" />
            {/* Milled edge: a dashed stroke around the annulus, so the
                ridges run radially the way machined ridges do. */}
            <circle
              cx="31.4"
              cy="6.6"
              r="3.9"
              fill="none"
              stroke="#0c0c0f"
              strokeOpacity="0.9"
              strokeWidth="1.1"
              strokeDasharray="0.42 0.62"
            />
            <circle cx="31.4" cy="6.6" r="2.9" fill="#2a2b30" />
            <circle cx="31.4" cy="6.6" r="2.9" fill="url(#cam-key)" />
            <rect x="31.1" y="3.2" width="0.6" height="1.5" rx="0.3" fill="#d8d4cb" opacity="0.8" />
          </g>

          {/* ---- Rewind knob and the frame-counter window ---------- */}
          <g>
            <circle cx="78" cy="6.6" r="5.4" fill="url(#cam-knob)" />
            <circle
              cx="78"
              cy="6.6"
              r="4.8"
              fill="none"
              stroke="#0c0c0f"
              strokeOpacity="0.85"
              strokeWidth="1.2"
              strokeDasharray="0.5 0.72"
            />
            <circle cx="78" cy="6.6" r="3.5" fill="#33343a" />
            <circle cx="78" cy="6.6" r="3.5" fill="url(#cam-key)" />
            {/* The fold-out crank, lying flat. */}
            <rect x="75.6" y="6.2" width="4.8" height="0.8" rx="0.4" fill="#15161a" />
            <circle cx="78" cy="6.6" r="0.9" fill="#4e4f57" />
            <circle
              cx="78"
              cy="6.6"
              r="5.4"
              fill="none"
              stroke="url(#cam-rim)"
              strokeWidth="0.45"
            />
          </g>

          <g>
            <rect x="87.5" y="4.3" width="9" height="4.4" rx="0.6" fill="#0b0b0e" />
            <rect x="88.1" y="4.9" width="7.8" height="3.2" rx="0.4" fill="#1d1e22" />
            <text
              className="cam-counter"
              x="92"
              y="7.6"
              textAnchor="middle"
            >
              {intro.stock}
            </text>
          </g>

          {/* ---- The front ---------------------------------------- */}
          <g>
            <path
              d="M0 13.6h100V58a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V13.6z"
              fill="url(#cam-shell)"
            />
            <g clipPath="url(#cam-clip-front)">
              {/* Leatherette, over the shell. */}
              <rect x="0" y="13.6" width="100" height="48.4" fill="url(#cam-hatch)" />
              {/* The plate's shadow falling across the top of it. */}
              <rect x="0" y="13.6" width="100" height="6" fill="#000000" opacity="0.55" />
              <rect x="0" y="13.6" width="100" height="2.4" fill="#000000" opacity="0.4" />
              {/* Key, and the fill coming back off the floor. */}
              <rect x="0" y="13.6" width="100" height="48.4" fill="url(#cam-key)" />
              <rect x="0" y="13.6" width="100" height="48.4" fill="url(#cam-fill)" />
              {/* A seam down each side, where the covering is wrapped
                  around the body casting. */}
              <path
                d="M11.4 13.6V62M88.6 13.6V62"
                stroke="#000000"
                strokeOpacity="0.5"
                strokeWidth="0.4"
              />
              <path
                d="M11.8 13.6V62M89 13.6V62"
                stroke="#ffffff"
                strokeOpacity="0.045"
                strokeWidth="0.35"
              />
            </g>

            {/* Maker's plate and film stock, engraved into the
                covering. The camera wears the site's own typography. */}
            <text className="cam-brand" x="74.6" y="27.4">
              {site.name}
            </text>
            <text className="cam-badge" x="75" y="33.4">
              {intro.stock}
            </text>

            {/* Self-timer lever, on the photographer's right — which
                from the front is the left of the drawing. */}
            <g>
              <circle cx="17.4" cy="47.6" r="3.4" fill="#141418" />
              <circle
                cx="17.4"
                cy="47.6"
                r="3.4"
                fill="none"
                stroke="url(#cam-rim)"
                strokeWidth="0.4"
              />
              <path
                d="M16.6 47.6a0.8 0.8 0 0 1 1.6 0l-0.3 3.4h-1z"
                fill="url(#cam-chrome)"
              />
              <circle cx="17.4" cy="47.6" r="1" fill="#3c3d43" />
            </g>

            {/* Lens release button. */}
            <g>
              <circle cx="76.4" cy="44.6" r="2.4" fill="#17171b" />
              <circle cx="76.4" cy="44.6" r="1.7" fill="url(#cam-knob)" />
              <circle cx="75.9" cy="44" r="0.7" fill="#ffffff" opacity="0.12" />
            </g>

            {/* Flash sync socket. */}
            <circle cx="88.2" cy="52.6" r="1.5" fill="#0a0a0c" />
            <circle
              cx="88.2"
              cy="52.6"
              r="1.5"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.08"
              strokeWidth="0.3"
            />
          </g>

          {/* ---- THE LENS ----------------------------------------
              Concentric rings at measured radii: the mount shoulder,
              the focus ring, the aperture ring, the chrome name ring,
              the retaining ring, and the front element. */}
          <g data-cam-lens className="cam-lens">
            {/* The shadow the barrel throws onto the body. */}
            <ellipse
              cx={LENS.x + 1.4}
              cy={LENS.y + 2.6}
              rx="21"
              ry="20.4"
              fill="#000000"
              opacity="0.6"
              filter="url(#cam-softer)"
            />

            {/* Mount shoulder. */}
            <circle cx={LENS.x} cy={LENS.y} r="20.6" fill="url(#cam-barrel)" />
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="20.6"
              fill="none"
              stroke="url(#cam-rim)"
              strokeWidth="0.6"
            />
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="20.2"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.55"
              strokeWidth="0.7"
            />

            {/* Focus ring: coarse knurling. */}
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="18"
              fill="none"
              stroke="#2e2f36"
              strokeWidth="4.2"
            />
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="18"
              fill="none"
              stroke="#07070a"
              strokeOpacity="0.95"
              strokeWidth="4.2"
              strokeDasharray="0.44 0.68"
            />
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="18"
              fill="none"
              stroke="url(#cam-rim)"
              strokeWidth="4.2"
            />

            {/* The step between the two rings. */}
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="15.7"
              fill="none"
              stroke="#0a0a0d"
              strokeWidth="0.8"
            />

            {/* Aperture ring: finer knurling, and the index mark. */}
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="14.4"
              fill="none"
              stroke="#262730"
              strokeWidth="2.4"
            />
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="14.4"
              fill="none"
              stroke="#08080b"
              strokeOpacity="0.9"
              strokeWidth="2.4"
              strokeDasharray="0.3 0.52"
            />
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="14.4"
              fill="none"
              stroke="url(#cam-rim)"
              strokeWidth="2.4"
            />
            <rect
              x={LENS.x - 0.26}
              y={LENS.y - 15.8}
              width="0.52"
              height="2.8"
              fill="#c8c4bb"
              opacity="0.75"
            />

            {/* The chrome name ring. */}
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="12.8"
              fill="none"
              stroke="url(#cam-chrome)"
              strokeWidth="1.5"
            />
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="12.05"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.6"
              strokeWidth="0.4"
            />

            {/* Retaining ring, holding the element in. */}
            <circle cx={LENS.x} cy={LENS.y} r="11.8" fill="#131418" />
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="11.8"
              fill="none"
              stroke="url(#cam-rim)"
              strokeWidth="0.5"
            />
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r="11.1"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.9"
              strokeWidth="0.9"
            />

            {/* ---- The front element ----
                A well, the coating, the softbox reflected in it, and
                the barrel's own inner ring down inside. */}
            <circle cx={LENS.x} cy={LENS.y} r={LENS.glass} fill="url(#cam-glass)" />

            <g clipPath="url(#cam-clip-glass)">
              {/* Down the inside of the barrel. */}
              <circle
                cx={LENS.x}
                cy={LENS.y}
                r="8.4"
                fill="none"
                stroke="#070a11"
                strokeWidth="1.6"
                opacity="0.85"
              />
              <circle
                cx={LENS.x}
                cy={LENS.y}
                r="5.6"
                fill="none"
                stroke="#0b0f18"
                strokeWidth="1.1"
                opacity="0.7"
              />

              {/* Coating. */}
              <ellipse
                className="cam-coat"
                cx={LENS.x - 4.4}
                cy={LENS.y - 5.2}
                rx="7.6"
                ry="6"
                fill="url(#cam-coat-cold)"
              />
              <ellipse
                cx={LENS.x + 5.6}
                cy={LENS.y + 5.4}
                rx="5.2"
                ry="4"
                fill="url(#cam-coat-warm)"
              />

              {/* The studio softbox, reflected in the glass. The one
                  thing that tells you it is glass and not paint. */}
              <g filter="url(#cam-soft)" opacity="0.4">
                <ellipse
                  cx={LENS.x - 4.6}
                  cy={LENS.y - 6.2}
                  rx="4.2"
                  ry="1.9"
                  fill="#dfe6f2"
                  transform={`rotate(-22 ${LENS.x - 4.6} ${LENS.y - 6.2})`}
                />
              </g>

              {/* The iris. Six leaves, each a half-plane whose edge
                  passes through the centre of the glass; pushing them
                  out along their own axis opens a hexagon, letting
                  them back in shuts it. One variable drives all six,
                  so the sequence animates --blade and the aperture
                  does the rest. */}
              <g data-cam-blades className="cam-blades">
                {/* Pins the group's bounding box to the glass, so the
                    sequence's rotation of the whole iris turns about
                    the optical axis and not about wherever the leaves
                    happen to have been pushed to. */}
                <rect
                  x={LENS.x - LENS.glass}
                  y={LENS.y - LENS.glass}
                  width={LENS.glass * 2}
                  height={LENS.glass * 2}
                  fill="none"
                />
                {BLADES.map((angle) => (
                  <rect
                    key={angle}
                    className="cam-blade"
                    style={{ ["--rot" as string]: `${angle}deg` }}
                    x={LENS.x - LENS.glass}
                    y={LENS.y - LENS.glass}
                    width={LENS.glass * 2}
                    height={LENS.glass}
                    fill="url(#cam-blade)"
                  />
                ))}
              </g>

              {/* Behind the leaves in paint order it would be lost, so
                  the gathering light sits here — the blades are drawn
                  above it and the burst reads as coming through the
                  iris rather than sitting on it. */}
              <circle
                data-cam-core
                cx={LENS.x}
                cy={LENS.y}
                r="6"
                fill="url(#cam-core)"
                opacity="0"
              />
            </g>

            {/* The edge of the element, catching the key light. */}
            <circle
              cx={LENS.x}
              cy={LENS.y}
              r={LENS.glass - 0.35}
              fill="none"
              stroke="url(#cam-glass-edge)"
              strokeWidth="0.7"
            />
          </g>

          {/* The spill over the barrel when the flash fires. */}
          <circle
            data-cam-bloom
            cx={LENS.x}
            cy={LENS.y}
            r="31"
            fill="url(#cam-bloom)"
            opacity="0"
          />

          {/* ---- The film gate at the foot of the body ------------
              A cut through the casting, with the strip's top edge
              tucked behind it. */}
          <g>
            <rect x="12" y="58.9" width="76" height="3.1" rx="1.1" fill="#000000" />
            <rect x="12" y="58.9" width="76" height="1.1" rx="0.5" fill="#000000" opacity="0.9" />
            <rect x="12.6" y="61.3" width="74.8" height="0.5" rx="0.25" fill="#2a2b30" />
            <rect x="12" y="58.6" width="76" height="0.4" rx="0.2" fill="#ffffff" opacity="0.07" />
          </g>

          {/* ---- Grain over the whole object ----------------------
              Last, and clipped to the body: one irregular surface
              across plate, covering and barrel alike, so nothing on
              the camera is perfectly smooth. */}
          <g clipPath="url(#cam-clip-body)">
            <rect
              className="cam-grain"
              x="-2"
              y="-2"
              width="104"
              height="66"
              filter="url(#cam-grain)"
            />
          </g>
        </g>
      </svg>

      {/* The affordances. Kept in HTML and positioned over the release
          in camera units, so the pulse and the focus collar stay in
          the cascade where the phase rules can reach them. */}
      <span aria-hidden className="cam-press" />
      <span aria-hidden className="cam-press-collar" />

      <span className="cam-cue" data-intro-copy>
        <span aria-hidden className="cam-cue-dot" />
        {intro.prompt}
      </span>
    </button>
  );
}
