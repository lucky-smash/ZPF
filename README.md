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

## Typography — one thing to set up

The site's identity is carried by three families served by **Adobe Fonts**:

| Family | Role | Styles needed |
| --- | --- | --- |
| **Freight Display Pro** | the voice — every oversized line | Light 300 + Light Italic, Book 400 + Book Italic |
| **Acumin Pro** | the apparatus — navigation, copy, buttons, labels | Light 300, Regular 400, Medium 500 |
| **Courier Prime** | the technical record — frame counters, film stock, slate data | Regular 400 |

Adobe serves these from a **Web Project**, which has to be created once in the
Adobe account that holds the licence. It cannot be created from the codebase
and the kit ID cannot be guessed — it is seven characters issued by Adobe.

1. Sign in at <https://fonts.adobe.com/> → **My Adobe Fonts → Web Projects →
   Create a new project**.
2. Add the three families above, ticking **only** the styles listed. Every
   extra style is another file a visitor may download.
3. Set the project's **font-display** to `swap`, and add your production domain
   and `localhost` to its domain list.
4. Adobe shows an embed code containing `https://use.typekit.net/XXXXXXX.css`.
   Copy the `XXXXXXX`.
5. Put it in `.env.local` (there is a template at `.env.local.example`):

```bash
# .env.local
NEXT_PUBLIC_ADOBE_FONTS_KIT_ID=XXXXXXX
```

Restart `npm run dev` and the fonts are live. The integration lives in
`src/lib/fonts.ts`; the stylesheet link is rendered in `src/app/layout.tsx`
**only when the kit ID is present**, so an unconfigured install makes no
network request at all rather than waiting on a 404.

**Until then, nothing is broken.** Each stack in `globals.css` names its Adobe
family first and then falls through to faces of the same species — the display
line falls to Hoefler Text / Baskerville / Georgia, the interface falls to
Space Grotesk, which Next self-hosts. The layout, hierarchy, composition and
line breaks are identical either way; only the letterforms change.

> Having these families synced to a Mac through Creative Cloud does **not**
> make them available to a browser. The Web Project is a separate thing, and it
> is the one that serves them to the web.

### The design tokens

Set in `@theme` in `src/app/globals.css`, so they are available both as CSS
variables and as Tailwind utilities (`font-display`, `font-sans`, `font-slate`):

| Token | Utility class | Used for |
| --- | --- | --- |
| `--font-display` | `.display`, `.hero-headline` | headlines, section titles, portfolio titles, pull quotes |
| `--font-sans` | body default, `.meta` | body copy, navigation, buttons, eyebrows, indices |
| `--font-slate` | `.slate` | frame counters, film stock, figure captions, the cursor label |

`.display` takes its leading from `--display-leading` (default `1.02`), so a
call site that needs a looser measure can set `[--display-leading:1.18]` and
win deterministically rather than depending on utility order.

The hero headline is its own block (`.hero-headline`) because the masked
line-by-line entrance needs padding to clear a serif's ascenders and
descenders, taken back out with a negative margin so the lines still sit
tight. The third line is set in italic — the only italic above the fold, which
is what makes it read as a cadence rather than as a style. Which line is
accented is `hero.accent` in `src/data/site.ts`; it must match one of
`hero.lines` exactly.

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

## The opening sequence — camera, shutter, flash, film

The first thing a visitor meets is a 35mm camera on a black screen.
Pressing the shutter fires a flash, feeds a strip of film out of the
camera body, runs six frames past the gate, and opens the last of them
into the hero. One click; no scrolling.

```
idle → shutterPressed → flash → filmReveal → websiteRevealed
```

It is **layered over** the home page, not a route of its own. The
finished page is rendered underneath it from the first byte.

### Editing it

`src/data/site.ts` → `intro`:

```ts
export const intro = {
  eyebrow: `${site.name} — ${site.legalName}`,
  tagline: site.tagline,
  prompt: "Click to capture a story",
  frames: [
    ...filmRoll.frames.slice(0, 5),
    { id: "story", caption: "The Story", image: hero.image, focal: "50% 42%" },
  ],
};
```

Two things are deliberate:

- **The frames are the film roll's.** The same five thematic captions,
  so there is one list to keep honest rather than two.
- **The last frame is the hero photograph**, at the hero's own focal
  point. When it expands past its film borders it *is* the hero
  backdrop, so the sequence and the website resolve into one another
  instead of cutting. Change `hero.image` and this follows it — but if
  you ever give the final frame a different picture, the hand-over
  becomes a dissolve between two photographs rather than a seamless one.

### The camera

`src/components/intro/RetroCamera.tsx`, plus the small `.cam-*` section in
`globals.css`. It is **drawn in SVG** — there is no asset to download, nothing
to 404, and it stays sharp at any size. Four things come from drawing it in
vector rather than in CSS boxes:

- **Real optical geometry.** The barrel is concentric rings at measured radii,
  and the knurling on the focus and aperture rings is a dashed stroke around
  the annulus, so the ridges run radially the way machined ridges do.
- **Surface.** One `feTurbulence` pass lays a fine irregular grain over the
  whole body, under a drawn cross-hatch for the vulcanite covering. CSS cannot
  make noise, and a perfectly smooth panel is what reads as plastic.
- **One light.** A soft key from the upper left, a weak fill from the lower
  right, a rim along the top edges, and a shadow on the ground underneath.
- **Depth in the glass.** A well, a coating bloom off-centre, the studio
  softbox reflected in it, and the barrel's own inner ring visible down inside.

It is a true front elevation, so it is handed the way a camera actually is when
it is pointed at you: the photographer's right hand is the viewer's left, which
puts the shutter release and the advance lever on the left of the drawing and
the rewind knob on the right.

Every dimension is a multiple of one unit, `--u`, declared on `.intro-reel`:

```css
--u: min(clamp(2.7px, 0.88vw, 8px), 0.78vh);
```

Width-led, with a height ceiling so a short or landscape phone scales the whole
object down rather than overflowing. Change that one line and the camera, its
shutter, its lens and the film coming out of it all resize together.

The camera also wears the site's own typefaces — the maker's plate in the
display face, the film stock and frame counter in the one screenplays are set
in — so it changes with the typography rather than being a picture of a
different brand.

Two things move while it waits, and neither of them moves the camera: the key
light travels the length of the top plate (`.cam-sheen`, 13s) and the coating
bloom in the glass breathes (`.cam-coat`, 9s). That is the whole of "alive".

The whole camera is the button, which is how a camera behaves in the hand and
gives touch a target the size of the viewport instead of a 40px dome. The
release is still drawn, lit and pressed, so it is obvious where the camera is
being pressed.

The parts the sequence animates carry `data-cam-*` attributes, so the drawing
can be reworked without touching the choreography in `CameraIntro.tsx`.

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

Modelled and animated in code, because the project has no bird asset. Each one
is a lathed body with a head, neck and tail taper, and two wings that pivot at
the shoulder — with a **power stroke roughly a third of the beat and a slower
recovery**, which is the single clearest difference between a bird and a sine
wave. They flap in bursts and glide between, bank into their own turns, feather
the wing through the stroke, and every one has its own beat rate, amplitude,
speed and wander, so the flock never synchronises.

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

- [ ] Create the Adobe Fonts Web Project and set `NEXT_PUBLIC_ADOBE_FONTS_KIT_ID`
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
    layout.tsx            Adobe Fonts, metadata, Open Graph, grain overlay
    page.tsx              the ten sections, in narrative order
    work/[slug]/page.tsx  reusable project page template
    not-found.tsx         404
    sitemap.ts, robots.ts
  components/
    intro/                the opening sequence: IntroBoot arms it,
                          RetroCamera draws the camera, CameraIntro
                          owns the timeline and the state machine
    sections/             one file per section of the home page
                          (FilmRoll.tsx is the pinned film sequence,
                          HeroSky.tsx the moving cloud environment,
                          SkyFlight.tsx the Three.js flight over it)
    site/                 header, footer, cursor, back-to-top
    ui/                   Figure, ProjectCard, Reveal, Parallax, form, player
  data/                   all editable content — start here
  lib/fonts.ts            the Adobe Fonts web project, in one place
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
