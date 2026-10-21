# ŹPF — Zeeshan Pasha Films

A cinematic portfolio site for ŹPF, a film production company based in New Delhi.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, GSAP and
Three.js. All
content lives in plain, typed objects under `src/data/`, so copy, projects and
images can be changed without touching a single React component.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npm run lint
```

---

## Typography

Two families, both **self-hosted by `next/font`**. They are fetched at build
time, emitted into the bundle and served from the site's own origin, so there
is no third-party request on any page, no account to configure and nothing
that can fail in front of a visitor.

| Family | Role | Axes used |
| --- | --- | --- |
| **Archivo** | the voice *and* the apparatus — headlines, navigation, body copy, tracked capitals | `wght` 400/500/600, `wdth` 88% (display) / 100–105% (interface) |
| **Courier Prime** | the technical record — the viewfinder readout, frame counters, film stock | 400, uppercase, tabular figures |

### Why a grotesque, and why these

The art direction is drawn from [kinoria.studio](https://kinoria.studio/), and
what that site is set in is verifiable rather than guessed at. Its document
preloads one font file and declares one family:

```css
@font-face{font-family:"Archivo";
  src:url("/fonts/Archivo/Archivo-Variable.woff2") format("woff2");
  font-weight:100 900;font-stretch:62% 125%;font-display:block}
```

…with `ui-monospace, Consolas, monospace` beside it for its viewfinder
numbers. So the reference is a **grotesque-and-mono** system, not an editorial
serif one — its display moments are etched technical marks rather than
high-contrast letterforms. This site is therefore set in the same grotesque,
the real one, and keeps Courier Prime for the technical role the reference
gives to a system mono: a film company reporting a specification should do it
in the typeface its scripts are written in.

### The width axis

Archivo ships two live axes, and the second one is the point. Headlines are
set a little **narrow** (88%) so a long line holds together as one shape;
tracked capitals are set a little **wide** (105%) so their counters survive at
11px; and the one accented line in a composition opens out to **112%** instead
of going italic. A width shift inside one family is a sharper distinction than
a second typeface would be — and Archivo has no drawn italic in this build, so
an italic accent would be a synthesised slant, which is worse than no accent.

> **The Adobe Fonts kit is no longer required.** The site used to be set in
> Freight Display Pro and Acumin Pro, served from an Adobe Web Project that
> had to be created by hand before the site had its own letterforms.
> `NEXT_PUBLIC_ADOBE_FONTS_KIT_ID` is no longer read anywhere; an existing
> value in `.env.local` is harmless and simply ignored.

### The design tokens

Set in `@theme` in `src/app/globals.css`, so they are available both as CSS
variables and as Tailwind utilities (`font-display`, `font-sans`, `font-slate`):

| Token | Utility class | Used for |
| --- | --- | --- |
| `--font-display` | `.display`, `.hero-headline` | headlines, section titles, portfolio titles, pull quotes |
| `--font-sans` | body default, `.meta` | body copy, navigation, buttons, eyebrows, indices |
| `--font-slate` | `.slate` | the viewfinder readout, frame counters, figure captions, the cursor label |

`.display` takes three values from custom properties, so a call site can
override any of them deterministically rather than depending on utility order:
`--display-leading` (default `0.98`), `--display-track` (default `-0.022em`)
and `--display-stretch` (default `88%`).

The hero headline is its own block (`.hero-headline`) because the masked
line-by-line entrance needs a little padding to clear ascenders and
descenders, taken back out with a negative margin so the lines still sit
tight. The third line is set at the wide width — the only width shift above
the fold, which is what makes it read as a cadence rather than as a style.
Which line is accented is `hero.accent` in `src/data/site.ts`; it must match
one of `hero.lines` exactly.

### Colour

The palette is warm, and every value in it was read out of the reference's own
document rather than sampled from a screenshot:

| Token | Value | Role |
| --- | --- | --- |
| `--color-ink` | `#050505` | page black |
| `--color-coal` | `#0b0908` | the warm step above it |
| `--color-bone` | `#f2ede4` | primary type |
| `--color-chalk` | `#e8e2d6` | inverted surfaces — what a pill fills with |
| `--color-ash` | `#a39a8f` | secondary type |
| `--color-stone` | `#5a534c` | muted type |
| `--color-signal` | `#c8503c` | the accent, at rest — a shutter, not a brand colour |
| `--color-ember` | `#e8563e` | the accent, lit |
| `--color-sand` | `#ecd6a8` | etched marks, the viewfinder's ink |

Four gradients are declared on `:root` and nothing else may invent one:
`--grade-scrim` (behind hero type), `--grade-vignette` (the frame falling off),
`--grade-photo` (laid over every photograph by `<Figure>`, which is what makes
a monochrome Himalayan still and a rendered lens belong to one film) and
`--grade-seam` (between sections).

`--kpx` is the chrome scale **as a length**: 1px up to a 1920 × 1080 window and
more above it, so the furniture of the opening sequence holds its proportion of
the frame on a phone and on a 5K display alike. The reference does exactly the
same thing for the same reason.

---

## What is real, and what is a placeholder

This matters more than anything else in this README.

### Real — taken from the company introduction deck

| Item | Where it lives |
| --- | --- |
| Company description, location, 20+ years of experience | `src/data/site.ts` |
| Brand philosophy quote | `src/data/site.ts` → `about.philosophy` |
| All six client testimonials, wording and attribution unchanged | `src/data/testimonials.ts` |
| The twelve work categories, in the company's own wording | `src/data/services.ts` → `services` |
| The fourteen in-house production roles | `src/data/services.ts` → `disciplines` |
| Phone numbers, WhatsApp links, email address | `src/data/site.ts` → `site.phones`, `site.email` |
| YouTube channel and Instagram profile | `src/data/site.ts` → `site.socials` |
| The showreel (a real film on the company's channel) | `src/data/site.ts` → `showreel` |
| The film-roll stills (ŹPF photography; thematic captions) | `src/data/site.ts` → `filmRoll` |
| Every photograph on the site, and the ŹPF monogram | `public/media/`, `public/brand/` |

### Placeholder — must be replaced before launch

| Item | Where it lives |
| --- | --- |
| All eight projects: titles, clients, years, descriptions | `src/data/projects.ts` |
| The production domain used for canonical URLs and share cards | `src/data/site.ts` → `site.url` |

Nothing else was invented. There are no fabricated awards, statistics, client
claims, project outcomes, team names or social URLs anywhere in the site.

---

## Replacing the placeholder projects

Every project carries a `status` field. While it is `"placeholder"` the site
renders a visible "Sample entry" marker on the card, a notice on the project
page, and keeps that page out of search results and the sitemap. Setting it to
`"approved"` removes all three.

1. **Add the still** to `public/media/`, then register it in
   `src/data/assets.ts` with its real pixel width and height:

   ```ts
   "ladakh-gathering": {
     src: "/media/ladakh-gathering.jpg",
     width: 1367,
     height: 2048,
     alt: "Women in traditional Ladakhi dress gathered at a festival",
   },
   ```

   `width` and `height` must match the file, or the page will shift as it
   loads. `blurDataURL` is optional — delete the line if you do not have one.

2. **Edit the entry** in `src/data/projects.ts`:

   ```ts
   {
     slug: "yamaha-brand-film",          // becomes /work/yamaha-brand-film
     title: "The Sound of Making",
     client: "Yamaha Music India",
     category: "Brand / Corporate Films", // use a category from services.ts
     year: "2025",
     description: "One or two sentences, shown on the card and the project page.",
     body: ["Longer paragraphs, project page only."],
     image: assets["ladakh-gathering"],
     videoUrl: "https://youtu.be/…",      // optional; adds a "Watch the film" button
     externalUrl: "https://…",            // optional
     gallery: [assets["mountain-dusk"]],  // optional
     credits: [{ role: "Director", name: "…" }], // optional
     layout: "wide",                      // "wide" | "tall" | "standard"
     featured: true,                      // optional
     status: "approved",                  // removes the sample marker
   }
   ```

3. **`layout`** decides the shape the project takes in the gallery —
   `wide` is a full-width 16:9 frame, `tall` a portrait frame, `standard` a
   half-width frame. The gallery's column placement is art direction, not
   content: it lives in `PLACEMENT` in
   `src/components/sections/SelectedWork.tsx`.

Projects beyond the eighth fall back to a half-width slot. Add more entries to
`PLACEMENT` to compose them deliberately.

---

## Other content you can edit

| What | Where |
| --- | --- |
| Hero lines, supporting text, buttons | `src/data/site.ts` → `hero` |
| Showreel film, poster, year, runtime | `src/data/site.ts` → `showreel` |
| The storytelling statement | `src/data/site.ts` → `statement` |
| About copy, facts, philosophy, images | `src/data/site.ts` → `about` |
| The full-width "visual breath" frame | `src/data/site.ts` → `breath` |
| Contact headline | `src/data/site.ts` → `contact` |
| Film-roll label, captions, stills and crops | `src/data/site.ts` → `filmRoll` |
| Opening-sequence copy and frames | `src/data/site.ts` → `intro` |
| Footer line, social links, contact details | `src/data/site.ts` → `site` |
| Service descriptions (currently blank) | `src/data/services.ts` |
| Testimonials | `src/data/testimonials.ts` |

### Service descriptions

Each service may carry a `description`. They are all empty, because no approved
copy exists for them. Add one and it appears under that row automatically:

```ts
{ id: "documentaries", title: "Documentaries", description: "…", image: … },
```

### Team profiles

`src/data/team.ts` is intentionally empty. No individual names, biographies or
portraits have been supplied, so none are published. The craft section instead
presents the fourteen roles as one production capability.

To publish profiles later, add entries with `status: "approved"` to `team.ts`.
`<TeamProfiles />` is already wired into the craft section and renders nothing
while the array is empty.

---

## The opening sequence — a rendered camera

The first thing a visitor meets is a professional 35mm camera on a dark stage.
The room comes up around it, it turns, the lens comes at the viewer, the
shutter fires, and the home page is behind the light. **5.9 seconds**, no
scrolling, nothing to click, and Skip or Escape leaves at any point.

```
idle → reveal → turn → push → fire → revealed
```

Six shots, placed at absolute times in `CameraIntro.tsx` so the whole sequence
reads down the page as a shot list:

| Shot | At | What happens |
| --- | --- | --- |
| **A** reveal | 0.0s | exposure, then key, then fill and rim. The object is in position from the first frame; what changes is the light on it. A slow 64 → 50cm dolly. |
| **B** turn | 1.4s | a controlled ~47° sweep, eased in and out, with the elevation coming down. This is the shot the knurling and the bevels are for. |
| **C** push | 3.1s | the camera walks in along the optical axis to 18cm while the field of view closes 34° → 24°. Both at once: closing the distance alone walks past the barrel, narrowing the field alone enlarges a picture. |
| **D** fire | 4.65s | the iris snaps shut in 90ms, the body recoils 2mm and springs back, the readout flicks to 1/125. The only fast thing in the sequence. |
| **E** flash | 4.79s | out of the front element and nowhere else — the gradient's centre and transform origin are written from where the glass actually landed on screen the frame before. Peach at the core, not white. |
| **F** reveal | 4.87s | the hero comes up *inside* the flash's falloff while the lens is still blown out, so the cut from render to photograph happens where it cannot be seen. |

It is **layered over** the home page, not a route of its own. The finished page
is rendered underneath it from the first byte, and the photograph the flash
resolves into is the hero's own file at the hero's own crop and scrim — so the
hand-over is a dissolve between two identical images and the only visible
change is the headline arriving.

### Editing it

`src/data/site.ts` → `intro`. There is deliberately very little: the sequence
is about an object, and the less type stands in front of that object the
better it works.

```ts
export const intro = {
  eyebrow: `${site.name} — ${site.legalName}`,
  tagline: site.tagline,
  skip: "Skip intro",
  replay: "Replay the opening",
  finder: { name: site.name, aperture: "f 2.0", speed: "1/60" },
};
```

The percentage between the aperture and the shutter speed is written by the
sequence and is its **real progress** — the one honest thing a loading number
can be.

Retiming is three constants in `CameraIntro.tsx` (`B`, `C`, `D`) plus the
durations placed against them. Phones run the identical sequence at a 0.76
stride.

### Reload variation

Small and bounded: a few degrees of opening bearing, a couple of degrees of
elevation, a few degrees on where the turn ends. Enough that two reloads are
visibly not the same take, never enough to put the camera somewhere it was not
art-directed to be — a random angle is a random composition, and most of them
are worse than the one that was designed.

### The camera

`src/components/intro/CameraRig.ts`. Built in geometry from measured
proportions, in centimetres: a 13.8cm body, a 9.4cm plate, a 6.6cm lens
diameter, a 6cm barrel. Working in real measurements is why the lens reads as a
50mm prime rather than a toy telescope — the proportion between body and barrel
is the single thing that most decides whether a drawn camera reads as a camera.

**It is not a photoreal model and should not be described as one.** A real
camera carries moulding seams, worn edges, printed lettering, screws, dust in
the barrel threads and a photographed environment in its glass, and none of
those come out of thirty primitives however carefully they are lit. What it is
instead is a correctly proportioned, correctly lit camera:

- **The lens is a real stack of rings** at real radii — mount flange, aperture
  ring, barrel waist, focus ring, name ring, retaining rim, element.
- **The knurling is machined ridges in the mesh**, not a texture. A cylinder
  whose radius rises and falls around its circumference, at 104 ridges on the
  aperture ring and 76 on the focus ring. Below about forty it stops being a
  machined finish and starts being a gear.
- **The body is extruded from a rounded profile with a real bevel**, because a
  chamfered edge catches the key as a bright line along the top plate, and a
  `BoxGeometry` has no highlight along its edge at all.
- **The glass is a shallow convex element** — about 5% sagitta, because a 50mm
  front element is very nearly flat — in a physical material at `ior: 1.85`, so
  it is nearly black where it faces the viewer and bright only at the rim and
  where the softbox lands. There is a dark tapering well behind it with two
  baffles, so there is real depth down the barrel rather than a lit disc.
- **The iris is eight blades** whose geometry is offset to its inner edge, so
  they slide out to the barrel wall and in across the axis without their far
  corners ever standing outside the lens.
- **It is lit by one studio**, pre-filtered into a cubemap from a scene of
  emissive panels: a warm key softbox upper-left, a cool bounce lower-right, a
  rim strip behind. That environment is why the metal has anything to reflect —
  a physically based material in an unlit environment looks like matte plastic
  however many point lights are added.
- **The ground is a `ShadowMaterial`**, drawing only the shadow. It was a dark
  standard material first, and that was wrong: the view looks along the plane at
  about ten degrees, which is exactly where Fresnel is strongest, so even a
  nearly black surface came back as a pale sheen brighter than the camera.

Tone mapping is ACES filmic and the exposure is a tweened value, so the scene
is brought up *out of black* rather than having a black overlay faded away —
the difference between a camera being lit and a camera being uncovered. There
is no post-processing: the flash is DOM, which is cheaper and far more
controllable.

**To go further**, buy a scanned or hand-built body with its maps — a `.glb`
with albedo, roughness, metalness and normal textures, licensed for commercial
web use. Parent it to `chassis` in place of the block that builds the shell and
the lens; the studio, the three lights, the iris, the choreography and the lens
anchor the flash comes out of all take a loaded model without changing. Keep it
under ~2.5 MB — it is the first thing a visitor waits for. See `CAMERA_ASSET`
at the foot of the file.

### When it cannot run

| Condition | What happens |
| --- | --- |
| `prefers-reduced-motion: reduce` | **No sequence at all.** The page is handed over on the first frame. An opening title is exactly the kind of thing the preference is about. |
| No WebGL context | The drawn SVG camera (`RetroCamera.tsx`) is held for a beat and flashed through — the same shutter in two shots instead of six. A fallback that can itself fail is not one. |
| Context lost mid-sequence | The sequence ends immediately and the website takes the screen. A frozen canvas is never left over the page. |
| JavaScript off, or hydration never happens | The overlay is never displayed and the site is simply the site. |

### Why shaders are compiled before the first beat

`rig.warm()` calls `renderer.compile()` and renders one frame during the hold,
before the timeline plays. A program compile is a synchronous stall of a few
hundred milliseconds, GSAP's clock keeps running through it, and without this
the timeline came out the other side already a second and a half in — the whole
atmospheric reveal was skipped and the sequence began mid-turn. Measured: the
turn arrived at 657ms into a timeline that places it at 1900. With the warm-up
it arrives at 1916.

`gsap.ticker.lagSmoothing(250, 25)` in `src/lib/gsap.ts` is the other half of
that: past a 250ms stall a tick counts for 25ms, so a jank spike becomes a
brief slow-down instead of a jump, for every animation on the site.

### The shutter, heard

Synthesised rather than loaded — two short filtered noise bursts, a mirror and
a blade. Nothing is downloaded for it and there is no audio asset in the
project.

It is strictly optional and the sequence never waits on it. Every browser
refuses to start an audio context before the visitor has interacted with the
document, and that refusal is correct, so this checks `navigator.userActivation`
and stays silent if there has been no interaction. **In practice: silent on a
cold load, audible on a replay from the footer or after any click**, which is
the right way round. The mechanical beat of the shot — the iris, the recoil —
is visual and always plays.

### How it is armed, and why it can never trap anyone

The overlay is in the markup from the first byte but is **not
displayed**. A blocking script in the root layout
(`src/components/intro/IntroBoot.tsx`) arms it before the first paint by
setting two attributes on `<html>`:

| Attribute | Effect |
| --- | --- |
| `data-intro="armed"` | the overlay is displayed |
| `data-intro-lock` | the page behind it is held still |

Everything else — the overlay, the hero's entrance, the header — reads
those attributes rather than keeping its own copy of the state. Both
default to absent, so **the page is the website unless something
actively arms the intro.** If the script never runs, if storage is
unavailable, if React never hydrates, or if GSAP fails, nobody is held
on a screen that cannot proceed. The script also carries its own
watchdog that takes the attributes away again if the sequence has not
come to life within eight seconds.

It arms on the home page only. `<CameraIntro />` lives there alone, so
arming it on a project page would lock the scroll with nothing there to
unlock it — anyone arriving straight at `/work/…` from a search result
gets the page immediately.

### Skipping, replaying, returning

- **Skip** sits top-right for the whole sequence. Escape does the same.
- It plays **once per browsing session** (`sessionStorage`, one key,
  no personal data). Reloading, or moving between sections, does not
  replay it.
- **"Replay the opening"** in the footer plays it again on demand.
- **Reduced motion** gets the camera and a quiet dissolve into the
  page: no flash, no unrolling.

### Handing over

The headline, the navigation and the hero buttons are the last beat of
the sequence, not something that happened behind it. `afterIntro()` in
`src/lib/intro.ts` holds those entrances back and releases them as the
film opens out. It plays them immediately when no sequence is running,
and plays them regardless after a long stop-gap — so nothing on the
page can be left invisible by an animation that failed.

---

## The hero sky — weather in a photograph

`src/components/sections/HeroSky.tsx`, with its layers described in the
`.sky-*` block in `globals.css`.

There is no cloud footage in the project and none has been licensed, so none of
the movement is stock video or an unrelated loop. It is built out of the
company's own photograph:

- **The plate.** `assets["sky-monsoon"]`, exactly as before, drifting very
  slowly across the frame.
- **The bank.** The same photograph again, mirrored, enlarged and screened back
  over itself. Because it is a different crop at a different scale moving at a
  different speed, the two cloud masses cross one another — which is what makes
  it read as depth rather than as a picture being dragged sideways. It costs no
  extra download: same file, same `sizes`, same quality, so it is the request
  the plate already made.
- **The atmosphere.** Two soft gradients, one warm and one cold, travelling and
  breathing on their own clocks. This is the light changing.

The clocks are 41s, 47s, 53s, 61s, 67s, 76s, 89s, 97s and 103s. None is a
multiple of another, so the composite never arrives back where it started and
there is no loop point to notice.

Three things it deliberately does not do:

- **It does not start until the opening sequence has handed over.** The
  sequence ends by dissolving an identical copy of this photograph into this
  one, and "identical" has to stay true until it has. Everything is built
  paused and released by `afterIntro`.
- **It never moves the plate with the pointer.** Only the bank and the
  atmosphere answer the cursor, by a few pixels, on a fine pointer — so there
  is depth without the whole sky following the mouse.
- **Under `prefers-reduced-motion` none of it is built.** The added layers
  default to `opacity: 0` in CSS and only GSAP raises them, so a reduced-motion
  visitor — or anyone whose JavaScript never runs — gets the still photograph
  and nothing else.

To swap the sky, point `hero.image` at a different asset in
`src/data/site.ts`. The opening sequence's final film frame follows it
automatically, so the two can never drift apart.

---

## The flight — Three.js over the photograph

`src/components/sections/SkyFlight.tsx`, mounted by `HeroSky`.

A WebGL layer that puts real three-dimensional space in front of the hero
photograph: cloud volumes at true depths, a flock with articulated wings, and a
camera that accelerates forward into the weather and settles.

### Why it sits *over* the photograph rather than replacing it

The canvas is transparent and the photograph stays underneath, in the DOM,
where it already was. Three things follow:

- The opening sequence ends by dissolving an identical copy of that photograph
  into the hero. Replacing the hero with a rendered sky would break that
  hand-over; layering over it cannot.
- The brand's own photography stays the backdrop of its own website.
- If WebGL is missing or the context is lost, nothing is lost — the hero is the
  photograph and its CSS layers, and the CSS flock takes over.

### How it is built

- **The world moves, not the camera.** Flying a camera forever down −Z drifts
  into float imprecision and makes recycling awkward. The cloud field and the
  flock travel toward the camera — the same relative motion, the same
  perspective and parallax, because perspective division gives each layer a
  rate set by its own depth for free. The camera still lifts, banks and sways.
- **GSAP owns the parameters, the loop owns the integration.** The timeline
  writes `speed`, `lift`, `bank`, `sway` and `spread`; the render loop turns
  those into positions once per frame. Nothing is written twice and there is no
  second loop overwriting what the timeline just set.
- **The clouds are cut from ŹPF's own sky photograph at runtime.** Luminance
  becomes alpha, so what was cloud in the frame stays and what was sky falls
  away — real photographic cloud edges, nothing extra to download, nothing to
  license, and if `hero.image` is swapped the weather follows it.

### The five beats

| s | beat |
| --- | --- |
| 0–2.6 | establishing — the field opens up, barely moving |
| 2.1–6 | the push forward begins and the nose comes up |
| 5.4–8.9 | in it: top speed, a long bank, a slow sway |
| 8.6–11 | through the cloud bank and out the other side |
| 11–17 | the landing: everything comes off, the field thins, and what is
left is the ambient drift the hero keeps |

### The birds

Modelled and animated in code, because the project has no bird asset. What a
bird crossing a sky at this distance actually is, optically, is a dark
silhouette with a shape — so the whole of the realism is in the shape and in
how it bends, and none of it is in shading. Four things carry it:

- **The wing is two segments, not a plate.** An arm from the shoulder and a
  hand from the wrist, parented, with the hand reading the beat a sixth of a
  cycle behind the shoulder and at a greater amplitude. That lag is the wing's
  whip: the tip is still coming down as the shoulder starts back up. It is the
  most recognisable thing about a bird in flight and the thing a rigid wing
  rolling about its root can never do — no amount of easing on the beat fixes
  it.
- **The primaries are separated.** The hand's tip is notched into four fingers,
  drawn as part of the same outline so it stays one geometry. A gliding
  silhouette with split primaries is instantly a bird; the same silhouette with
  a smooth tip is a dart.
- **The wings droop.** Camber across the span, quadratic so the inner wing is
  nearly flat and the fall is all at the tip. With a few degrees of dihedral
  this gives the shallow V with falling tips that a soaring bird holds.
- **They are silhouettes, not lit objects.** `MeshBasicMaterial`, one per bird,
  with its opacity written each frame from its depth. A lit flat panel changes
  value as it rotates, so a flapping wing strobes between light and dark —
  which is exactly the plastic, cartoon read this replaced. A bird against a
  bright sky is a hole in the light, and its tone is set by how much air is in
  front of it and nothing else. That is aerial perspective, and it is what
  makes a far bird read as far away rather than as small.

On top of that: a **power stroke roughly a third of the beat and a slower
recovery** (a sine wave spends equal time on both and is the other clear tell),
flapping in bursts with glides between, banking read out of their own turns,
wingspans varying by a factor of two across the flock so eight birds are not
eight copies of one bird, and per-bird beat rate, amplitude, speed and wander
so they never synchronise. They fade up as they enter at the back of the field
and down as they pass the camera, so nothing ever appears or vanishes as a pop.

What they give is a believable silhouette. What they cannot give is feathers.

**To go further**, buy a rigged, animated bird — a `.glb` with a flight cycle,
from Sketchfab, TurboSquid, Quixel or CGTrader, licensed for commercial web
use. Drop it in `public/media/` and it replaces `buildBird` and the wingbeat
block in the loop; the depth, flock behaviour, recycling and camera all take an
animated GLTF without changing. See `BIRD_ASSET` at the foot of the file.

### Budget

Fill, not geometry, is the cost: every cloud is a large transparent quad and a
stack of them over the same pixels is overdraw. So the budget is set by screen
size — 18 clouds / 9 birds / 1.5× pixel ratio / antialiasing on desktop, 10 / 5
/ 1.25× / off below 48rem. Rendering stops entirely when the hero is scrolled
out of view or the tab is in the background, and everything is disposed on
unmount.

---

## "Inside the frame" — the film roll

The strip of film between the opening statement and Selected Work.
Not to be confused with the opening sequence above: that one is
click-driven and ends in the hero, this one is scroll-driven and bridges
into the work. They share the perforation drawing in `globals.css` and
the frame captions in `src/data`, and nothing else — and this one is
deliberately the shorter of the two, so nobody sits through two long
films before reaching the portfolio.

Edit it in `src/data/site.ts` → `filmRoll`:

```ts
frames: [
  {
    id: "people",
    caption: "The People",
    image: assets["ladakh-gathering"],
    focal: "50% 26%",   // which part of the photo the 16:9 frame keeps
  },
  …
]
```

Three things worth knowing before changing it:

- **The captions are thematic, not projects.** "The People", "The Places"
  and so on describe what ŹPF looks for when it films. They are not
  titles of completed work, and nothing in this section claims to be.
- **`focal` matters.** Most of this photography is portrait, and the film
  frame is 16:9, so the default centre crop cuts faces and horizons.
  `focal` is plain CSS `object-position`.
- **The last frame is deliberate.** It uses the same still that opens
  Selected Work, so when the film opens out at the end of the sequence
  it becomes the first project. If you change the first project's image,
  change the last frame's image to match — otherwise the handoff cuts
  instead of flowing.

Add or remove frames freely; the sequence measures itself and the
captions, counter and scroll length follow.

### How it behaves

On a desktop with motion allowed, the section pins for about 2.4
viewport heights: the strip rises in, each frame travels through the
centre with its caption beside it, and the final frame expands to full
bleed. It is scroll-scrubbed, so scrolling back up runs it backwards
exactly rather than replaying it.

Everywhere else — phones, tablets, and anyone who asked for reduced
motion on any screen — the same markup is simply a tall, readable strip
in normal document flow with every caption visible. There is no second
implementation to keep in step. The switch is driven by a `data-mode`
attribute the component sets only when the sequence actually
initialises, so the fallback is tied to real behaviour rather than to a
screen-width guess.

---

## The cursor

On a desktop with a mouse, an ivory disc tracks the pointer and a ring
trails it, opening into a labelled red frame over anything clickable.
Give any element a label with a data attribute:

```tsx
<Link href="…" data-cursor-label="VIEW">
<button data-cursor-label="PLAY">
```

The rules it follows:

- The native cursor is **only** hidden once the custom one has actually
  moved. If the script never runs, never gets a pointer event, or throws,
  the system cursor is left alone — the page is never left with no
  pointer at all.
- Text fields keep their own I-beam; the custom cursor steps aside.
- Touch devices never load it and never lose their native behaviour.
- With reduced motion it snaps to the pointer instead of trailing. A
  pointer is not decoration, so it is never removed outright.

What the pointer is over is resolved from its coordinates on every move,
coalesced into one hit-test per frame, rather than from
`pointerover`/`pointerout` bookkeeping — which is what keeps the visible
state from drifting out of sync with where the pointer really is.

---

## The showreel

`showreel` in `src/data/site.ts` supports three modes:

```ts
provider: "youtube"   // poster first; the YouTube player loads only on click
provider: "file"      // a self-hosted video with the site's own controls
provider: "none"      // a clearly marked placeholder, no fake player
```

It currently points at the company's published showreel. Nothing is requested
from YouTube until a visitor presses play, and the player brings its own play,
pause and volume controls. Sound never starts on its own.

To host the film yourself, drop an MP4 into `public/media/`, then set
`provider: "file"` and `source: "/media/showreel.mp4"`. That path renders a
native player with the site's own play/pause and mute controls.

---

## The enquiry form

The form has two honest delivery routes and never claims a success it cannot
stand behind.

**Default (no configuration):** opens the visitor's email client with the
message composed, and says plainly that nothing has been sent yet.

**With a backend:** set an endpoint and the form POSTs the enquiry as JSON
(`name`, `email`, `company`, `projectType`, `timeline`, `details`) and reports
what actually came back:

```bash
# .env.local
NEXT_PUBLIC_ENQUIRY_ENDPOINT=https://your-form-endpoint.example.com/enquiries
```

Any service that accepts a JSON POST works — Formspree, a Next route handler,
or your own API.

---

## Before going live

      (see **Typography** above). Without it the site renders in its declared
      fallbacks — complete, but not in its own letterforms.
- [ ] Replace the eight placeholder projects in `src/data/projects.ts`.
- [ ] Set `site.url` in `src/data/site.ts` to the real domain. Canonical URLs,
      the sitemap and social share cards all derive from it.
- [ ] Decide on the enquiry form route (mailto, or set the endpoint above).
- [ ] Optionally add approved `description` copy to the services.

---

## How it is put together

```
src/
  app/
    layout.tsx            fonts, metadata, Open Graph, grain overlay
    page.tsx              the ten sections, in narrative order
    work/[slug]/page.tsx  reusable project page template
    not-found.tsx         404
    sitemap.ts, robots.ts
  components/
    intro/                the opening sequence: IntroBoot arms it,
                          CameraRig builds and renders the camera,
                          CameraIntro owns the shot list and the state
                          machine, RetroCamera is the drawn fallback
                          for a browser with no WebGL context
    sections/             one file per section of the home page
                          (FilmRoll.tsx is the pinned film sequence,
                          HeroSky.tsx the moving cloud environment,
                          SkyFlight.tsx the Three.js flight over it)
    site/                 header, footer, cursor, back-to-top
    ui/                   Figure, ProjectCard, Reveal, Parallax, form, player
  data/                   all editable content — start here
  lib/fonts.ts            the two self-hosted families, in one place
  lib/gsap.ts             GSAP + ScrollTrigger registration
  lib/intro.ts            opening-sequence state, in one place
public/
  brand/                  monogram, grain texture, share image
  media/                  photography and the showreel poster
```

### Moving to Sanity

The content layer was shaped for it. Each interface in `src/data/types.ts`
(`Project`, `Service`, `Testimonial`, `TeamMember`, `SiteSettings`,
`SocialLink`, `ImageAsset`) maps to one Sanity document type, and every
component imports from `@/data` only. Swapping the local objects for Sanity
queries means rewriting the exports in `src/data/index.ts` — not the UI.

### Smooth scrolling

Wheel and trackpad input arrives from the browser in discrete jumps — a
single notch moves the page a few hundred pixels in one frame. Because
the pinned film roll and the parallax stills are all scrubbed from the
scroll position, that stepping showed up in every one of them at once.

[Lenis](https://github.com/darkroomengineering/lenis) normalises it into
a continuously interpolated value. Measured over a three-notch gesture:
native scroll moved on 3 frames out of 60, in steps of 320px each;
smoothed, the same distance spreads across 36 frames in steps of 16–47px.

It is set up in `src/components/site/SmoothScroll.tsx`:

- Lenis is advanced from the **GSAP ticker**, not its own
  `requestAnimationFrame` loop, so the scroll position and the tweens
  reading it can never be a frame apart.
- In-page anchors and "back to top" route through `scrollTo()` in
  `src/lib/smooth-scroll.ts`. Anything calling `window.scrollTo`
  directly would be overridden by the scroller on the next frame.
- **Off entirely for reduced-motion visitors**, who keep native
  scrolling, and touch keeps its own momentum (`syncTouch: false`) —
  smoothing that fights the OS.

To remove it: delete `<SmoothScroll />` from `src/app/page.tsx` and
`src/app/work/[slug]/page.tsx`. Everything else keeps working; the
scroll simply goes back to stepping.

### Motion

GSAP with ScrollTrigger, used deliberately rather than everywhere: the
opening sequence, the hero line reveal, section entrances, a slow parallax
on selected stills, the pinned film roll, the services cursor preview and
the custom cursor.

The opening sequence is the one piece that is **not** scroll-driven: it is
a single paused timeline played by a click, built inside a `gsap.context`
so every tween and every inline style it writes is reverted on teardown.
Its `fromTo` tweens all carry `immediateRender: false` — a `fromTo`
renders its "from" state the moment it is created, which in the final
phase would measure the last film frame while it was still inside the
camera.

Three rules hold throughout:

- **The page is complete without JavaScript.** Markup renders in its finished
  state; GSAP only ever animates *from* a hidden state, set before first paint.
- **`prefers-reduced-motion` is respected.** Every animation sits inside a
  `gsap.matchMedia` guard and simply does not run.
- **Expensive effects are desktop-only.** Parallax, the cursor preview and the
  custom cursor require a fine pointer and a wide viewport.
- **Scrubbed effects ease into their value.** Parallax and the film roll
  use a short `scrub` catch-up rather than `scrub: true`, which tracks
  raw input deltas and reads as stepping.

### Accessibility

Skip link, semantic landmarks, one `h1` per page, labelled form fields with
inline error messages, visible focus rings, a keyboard-trapped mobile menu that
closes on Escape, and descriptive alt text on every image. Nothing essential is
behind a hover: the services index shows its stills inline on touch, and every
project card renders its metadata at rest.
