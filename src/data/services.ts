import { assets } from "./assets";
import type { Discipline, Service } from "./types";

/**
 * ------------------------------------------------------------------
 * SERVICES — "We Carve"
 * ------------------------------------------------------------------
 * The twelve categories are the company's own wording, taken verbatim
 * from the introduction deck. Descriptions are left empty on purpose:
 * add approved copy to `description` and it appears automatically.
 * `image` drives the preview that follows the cursor on desktop and
 * sits inline on touch devices.
 * ------------------------------------------------------------------
 */
export const services: Service[] = [
  { id: "brand-corporate", title: "Brand / Corporate Films", image: assets["corridor-sepia"] },
  { id: "industrial", title: "Industrial Films", image: assets["craft-hands"] },
  { id: "architectural", title: "Architectural Films & Still Shoots", image: assets["corridor-mono"] },
  { id: "product-launch", title: "Product Launch / Unboxing Films", image: assets["craft-hands"] },
  { id: "event", title: "Small & Large Format Event Films", image: assets["ladakh-gathering"] },
  { id: "tvc", title: "Conceptual TVCs", image: assets["sky-monsoon"] },
  { id: "music-videos", title: "Music Videos", image: assets["rain-asphalt"] },
  { id: "state-tourism", title: "State Tourism Films", image: assets["pangong-shore"] },
  { id: "documentaries", title: "Documentaries", image: assets["ladakh-gathering"] },
  { id: "brand-archival", title: "Brand Archival Films", image: assets["mountain-dusk"] },
  { id: "talk-shows", title: "Talk Shows", image: assets["corridor-mono"] },
  { id: "podcasts", title: "Podcasts", image: assets["rain-asphalt"] },
];

/**
 * ------------------------------------------------------------------
 * PRODUCTION DISCIPLINES — "Team at ŹPF"
 * ------------------------------------------------------------------
 * The roles the company covers in house, as listed in the deck.
 * These describe a production capability, not named individuals.
 * ------------------------------------------------------------------
 */
export const disciplines: Discipline[] = [
  { id: "director", title: "Director" },
  { id: "executive-producer", title: "Executive Producer" },
  { id: "script-writer", title: "Script Writer" },
  { id: "cinematographers", title: "Sr & Jr Cinematographers" },
  { id: "line-producers", title: "Line Producers" },
  { id: "stylist-makeup", title: "Stylist & Makeup Team" },
  { id: "operations", title: "Operations Team" },
  { id: "retouchers", title: "Image Retouchers" },
  { id: "editors", title: "Sr & Jr Editors" },
  { id: "gfx", title: "GFX Team" },
  { id: "color", title: "Color Corrector" },
  { id: "audio", title: "Audio Mastering" },
  { id: "casting", title: "Casting Agent" },
  { id: "vfx", title: "VFX & Animation Team" },
];
