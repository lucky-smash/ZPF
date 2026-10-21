import { assets } from "./assets";
import type { ShowreelConfig, SiteSettings } from "./types";

/**
 * ------------------------------------------------------------------
 * SITE SETTINGS
 * ------------------------------------------------------------------
 * Company details, contact routes and social profiles.
 * Every value here was taken from the ŹPF company introduction deck.
 * ------------------------------------------------------------------
 */
/**
 * ------------------------------------------------------------------
 * THE LIVE ORIGIN
 * ------------------------------------------------------------------
 * Resolved once, in this order:
 *
 *   1. NEXT_PUBLIC_SITE_URL           the domain you have settled on
 *   2. VERCEL_PROJECT_PRODUCTION_URL  Vercel's own production host,
 *                                     set automatically on every build
 *   3. CANONICAL_URL                  local development, any other host
 *
 * Only the canonical tag, the Open Graph URLs, robots.txt and
 * sitemap.xml read this, so a wrong value costs reach, never a render.
 * Set NEXT_PUBLIC_SITE_URL in the Vercel project the day the real
 * domain is connected and nothing in this file has to change.
 * ------------------------------------------------------------------
 */
const CANONICAL_URL = "https://zeeshanpashafilms.com";

/**
 * Vercel supplies its hosts bare — "zpf.vercel.app", no scheme — while
 * a hand-typed value usually arrives with one, and sometimes with a
 * trailing slash. `new URL(site.url)` in the root layout wants exactly
 * one clean origin, so every route in takes the same shape here.
 */
function toOrigin(host: string): string {
  const withScheme = /^https?:\/\//.test(host) ? host : `https://${host}`;
  return withScheme.replace(/\/+$/, "");
}

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return toOrigin(configured);

  /* Vercel points this at the production domain even from a preview
     build, which is what a canonical tag should claim. */
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) return toOrigin(vercelHost);

  return CANONICAL_URL;
}

export const site: SiteSettings = {
  name: "ŹPF",
  legalName: "Zeeshan Pasha Films",
  tagline: "Every frame begins with a feeling.",
  description:
    "ŹPF — Zeeshan Pasha Films is a film production company based in New Delhi, with over 20 years of experience creating commercial films for brands.",
  location: "New Delhi, India",
  email: "zeeshanpashafilms@gmail.com",
  phones: [
    {
      display: "+91 99710 28676",
      e164: "919971028676",
      // Company-supplied WhatsApp link from the introduction deck.
      whatsappUrl: "https://wa.link/0riy8h",
    },
    {
      display: "+91 92869 76722",
      e164: "919286976722",
      whatsappUrl: "https://wa.me/message/AVX6LP4P2JZBD1",
    },
  ],
  socials: [
    {
      label: "YouTube",
      href: "https://www.youtube.com/channel/UCzSRNzrG3J2a4vgEvL4gb4Q",
    },
    { label: "Instagram", href: "https://www.instagram.com/zeeshaanpashafilms/" },
  ],
  footerNote: "Connect. Collaborate. Create.",
  // The live origin, resolved from the environment — see THE LIVE
  // ORIGIN above.
  url: resolveSiteUrl(),
};

/**
 * The hero and the opening statement.
 * `heroLines` are rendered one line per element so they animate in sequence.
 */
export const hero = {
  lines: ["Every frame", "begins with", "a feeling."],
  /**
   * The one line set in the display face's italic. Typographic
   * emphasis, not semantic: it is what turns three stacked lines into
   * a composition, and it is deliberately the only italic on the page
   * above the fold. Must match one of `lines` exactly, or no line is
   * accented and the headline is simply all roman.
   */
  accent: "a feeling.",
  supporting:
    "Films shaped by people, places and the moments that stay with us.",
  primaryCta: { label: "Explore our work", href: "#work" },
  secondaryCta: { label: "Start a conversation", href: "#contact" },
  image: assets["sky-monsoon"],
};

/**
 * ------------------------------------------------------------------
 * SHOWREEL
 * ------------------------------------------------------------------
 * Points at the real ŹPF showreel published on the company's channel.
 *
 * To host the film yourself instead, set:
 *   provider: "file"
 *   source:   "/media/showreel.mp4"   (drop the file into public/media/)
 * and the site renders a native player with its own controls.
 *
 * Setting provider: "none" shows a clearly marked placeholder frame.
 * ------------------------------------------------------------------
 */
export const showreel: ShowreelConfig = {
  title: "Showreel",
  provider: "youtube",
  source: "ikrlaRWZCio",
  watchUrl: "https://youtu.be/ikrlaRWZCio",
  poster: assets["showreel-poster"],
};

/** Section 03 — the storytelling statement. */
export const statement = {
  lead: [
    "From the quiet details of everyday life",
    "to the scale of the extraordinary,",
    "we look for the stories worth",
    "bringing to the screen.",
  ],
  body: "Based in New Delhi, ŹPF is a film production company with over 20 years of experience creating commercial films for brands.",
  image: assets["pangong-shore"],
};

/** Section 07 — about. */
export const about = {
  headline: ["Rooted in the world.", "Told through film."],
  // Proposed website copy, written from the company's stated philosophy.
  body: [
    "Our work begins with observation: the character of a place, the rhythm of a moment, the people behind a story. Inspired by nature, travel, culture and world cinema, we create films that bring those observations to the screen.",
  ],
  // Verified facts from the company introduction.
  facts: [
    { label: "Based in", value: "New Delhi, India" },
    { label: "Experience", value: "Over 20 years" },
    { label: "Focus", value: "Commercial films for brands" },
  ],
  philosophy:
    "Our philosophy and inspiration are rooted in elements of nature, places, travels, culture, people, and the world's cinema.",
  images: [assets["corridor-mono"], assets["corridor-sepia"]],
};

/** Section 09 — the visual breath. */
export const breath = {
  headline: "Look closer. There's always a story.",
  image: assets["mountain-dusk"],
};

/** Section 10 — contact. */
export const contact = {
  headline: ["Have a story", "in mind?"],
  supporting: "Connect. Collaborate. Create.",
};

/**
 * ------------------------------------------------------------------
 * SECTION 3B — INSIDE THE FRAME (the film roll)
 * ------------------------------------------------------------------
 * The scroll-driven film strip that carries the visitor from the
 * company's philosophy into the work itself.
 *
 * The captions are thematic — they describe what ŹPF looks for when it
 * films, not individual completed projects. Swap the images for approved
 * production stills whenever they are available.
 *
 * The last frame deliberately uses the same still that opens Selected
 * Work, so the film opens out into the first project.
 * ------------------------------------------------------------------
 */
export const filmRoll = {
  label: "Inside the frame",
  outro: "Selected work",
  /**
   * `focal` is the part of each photograph to keep when the 16:9 frame
   * crops it — most of this photography is portrait, so the default
   * centre crop would cut faces and horizons. CSS object-position
   * syntax; omit it for a centre crop.
   */
  frames: [
    {
      id: "people",
      caption: "The People",
      image: assets["ladakh-gathering"],
      focal: "50% 26%",
    },
    {
      id: "places",
      caption: "The Places",
      image: assets["mountain-dusk"],
      focal: "50% 45%",
    },
    {
      id: "details",
      caption: "The Details",
      image: assets["rain-asphalt"],
      focal: "50% 50%",
    },
    {
      id: "craft",
      caption: "The Craft",
      image: assets["craft-hands"],
      focal: "50% 38%",
    },
    {
      id: "culture",
      caption: "The Culture",
      image: assets["corridor-sepia"],
      focal: "50% 30%",
    },
    /* Keep this one aligned with the first project card in Selected
       Work, so the final frame opens into the identical composition. */
    {
      id: "story",
      caption: "The Story",
      image: assets["pangong-shore"],
      focal: "50% 42%",
    },
  ],
};

/**
 * ------------------------------------------------------------------
 * THE OPENING SEQUENCE — the rendered camera
 * ------------------------------------------------------------------
 * A camera on a dark stage: the room comes up around it, it turns, the
 * lens comes at the viewer, the shutter fires, and the homepage is
 * behind the light. See src/components/intro/CameraIntro.tsx for the
 * shot list and src/components/intro/CameraRig.ts for the camera.
 *
 * There is no copy to write for it beyond the slate in the corner and
 * the numbers etched into the viewfinder. The sequence is about an
 * object, and the less type stands in front of that object the better
 * it works.
 * ------------------------------------------------------------------
 */
export const intro = {
  eyebrow: `${site.name} — ${site.legalName}`,
  tagline: site.tagline,
  skip: "Skip intro",
  replay: "Replay the opening",
  /**
   * The viewfinder's own markings. A real readout: the aperture the
   * lens is drawn at, the speed the shutter fires at, and the name
   * etched into the finder. The percentage beside them is written by
   * the sequence and is its real progress, so the number a visitor
   * sees is never a decoration.
   */
  finder: {
    name: site.name,
    aperture: "f 2.0",
    speed: "1/60",
  },
} as const;
