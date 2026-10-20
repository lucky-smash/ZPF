/**
 * ------------------------------------------------------------------
 * CONTENT MODEL
 * ------------------------------------------------------------------
 * These types describe every piece of editable content on the site.
 * They are deliberately shaped to map onto Sanity documents later:
 * each interface below corresponds to one future Sanity schema type,
 * so moving to the CMS means swapping the data source, not the UI.
 * ------------------------------------------------------------------
 */

/** A single image, with the real pixel dimensions needed to reserve space. */
export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  /** Describes the picture for screen readers and when loading fails. */
  alt: string;
  /** Optional inlined low-resolution preview. */
  blurDataURL?: string;
}

/**
 * Marks content as unverified sample material.
 * `placeholder` entries render a visible "sample" marker so nothing
 * invented is ever presented to a visitor as real, finished work.
 */
export type ContentStatus = "approved" | "placeholder";

export interface ProjectCredit {
  role: string;
  name: string;
}

export interface Project {
  /** URL segment: /work/<slug> */
  slug: string;
  title: string;
  /** Client or brand. Leave undefined until the company confirms it. */
  client?: string;
  category: string;
  /** Four digit year, omitted when unknown. */
  year?: string;
  /** One or two sentences shown on the card and at the top of the detail page. */
  description: string;
  /** Longer copy shown only on the detail page. */
  body?: string[];
  image: ImageAsset;
  /** Full watch link (YouTube, Vimeo, or a self-hosted file). */
  videoUrl?: string;
  /** Any other external link worth surfacing. */
  externalUrl?: string;
  gallery?: ImageAsset[];
  credits?: ProjectCredit[];
  /**
   * Controls the shape this project takes in the gallery, so the grid
   * reads as an edit rather than a repeating template.
   */
  layout: "wide" | "tall" | "standard";
  /** Featured projects lead the gallery. */
  featured?: boolean;
  status: ContentStatus;
}

export interface Service {
  /** Stable key, also used as the anchor id. */
  id: string;
  /** The company's own wording for this capability. */
  title: string;
  /** Optional supporting line. Left blank until the company approves copy. */
  description?: string;
  image?: ImageAsset;
  /** Slug of a project that demonstrates this service, once one exists. */
  relatedProject?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  /** Person or organisation being quoted, exactly as supplied. */
  attribution: string;
  status: ContentStatus;
}

/** Reserved for future use. No team profiles are published yet. */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: ImageAsset;
  bio?: string;
  status: ContentStatus;
}

/** A production discipline the company covers in house. */
export interface Discipline {
  id: string;
  title: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface PhoneNumber {
  /** As written for people to read. */
  display: string;
  /** Digits only, including country code, for tel: and wa.me links. */
  e164: string;
  /** Optional company-supplied WhatsApp short link, used in place of wa.me. */
  whatsappUrl?: string;
}

export interface ShowreelConfig {
  title: string;
  year?: string;
  /**
   * "youtube" plays the real film in the YouTube player after a click.
   * "file"    plays a self-hosted video with the site's own controls.
   * "none"    shows a clearly marked, non-playing placeholder frame.
   */
  provider: "youtube" | "file" | "none";
  /** YouTube video id, or the path/URL of a self-hosted video file. */
  source?: string;
  /** Public watch page, linked as a fallback. */
  watchUrl?: string;
  poster: ImageAsset;
  runtime?: string;
}

export interface SiteSettings {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  location: string;
  email: string;
  phones: PhoneNumber[];
  socials: SocialLink[];
  /** Shown in the footer beside the copyright. */
  footerNote: string;
  url: string;
}
