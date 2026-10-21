import { Archivo, Courier_Prime } from "next/font/google";

/**
 * ------------------------------------------------------------------
 * THE TYPOGRAPHIC IDENTITY
 * ------------------------------------------------------------------
 * Two families carry the whole site, each with one job:
 *
 *   Archivo        the voice and the apparatus. A grotesque with two
 *                  live axes — weight 100–900 and width 62–125% — so
 *                  the display type, the navigation, the body copy and
 *                  the tracked capitals all come out of one family and
 *                  differ by axis rather than by typeface.
 *   Courier Prime  the technical record. The typeface screenplays are
 *                  written in, used only where the site is reporting a
 *                  specification: the viewfinder readout, frame
 *                  counters, film stock, the camera's own markings.
 *
 * WHY THESE, AND WHY NOT A SERIF
 *
 * The art direction is drawn from kinoria.studio, and what that site
 * is actually set in is verifiable rather than guessed — its document
 * preloads one file and declares one family:
 *
 *   <link rel="preload" as="font" type="font/woff2"
 *         href="/fonts/Archivo/Archivo-Variable.woff2" crossorigin>
 *   @font-face{font-family:"Archivo";
 *     src:url("/fonts/Archivo/Archivo-Variable.woff2") format("woff2");
 *     font-weight:100 900;font-stretch:62% 125%;font-display:block}
 *
 * …with `ui-monospace, Consolas, monospace` beside it for its
 * viewfinder numbers. So the reference is a grotesque-and-mono system,
 * not an editorial serif one, and its display moments are etched
 * technical marks rather than high-contrast letterforms.
 *
 * This site is therefore set in the same grotesque — the real one, not
 * an approximation of it — and keeps Courier Prime for the technical
 * role the reference gives to a system mono, because a film company
 * reporting a specification should do it in the typeface its scripts
 * are written in.
 *
 * WHY NO ADOBE ACCOUNT IS NEEDED ANY MORE
 *
 * Both families are served from the project itself: next/font fetches
 * them at build time, self-hosts them, and emits the @font-face rules
 * with no runtime request to a third party. There is no kit to create,
 * no key to paste, nothing to configure, and no network dependency
 * that can fail in front of a visitor. NEXT_PUBLIC_ADOBE_FONTS_KIT_ID
 * is no longer read anywhere; an existing value in .env.local is
 * harmless and simply ignored.
 *
 * WHAT THE WIDTH AXIS IS FOR
 *
 * Headlines are set a little narrow (--display-stretch, 88% by
 * default) and the tracked capitals a little wide. That is the one
 * typographic move the reference's own font file invites by shipping
 * the axis at all, and it is what keeps a single grotesque from
 * reading as a single weight of a single grotesque.
 * ------------------------------------------------------------------
 */

/**
 * The voice and the apparatus.
 *
 * Variable, so no `weight` is declared: the whole 100–900 range is one
 * file. `axes: ["wdth"]` adds the width axis to it — without that line
 * Next serves the weight axis alone and every `font-stretch` in
 * globals.css would silently do nothing.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/**
 * The technical record. One weight, upright: it never sets a paragraph
 * and never needs an emphasis.
 */
export const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-courier",
  display: "swap",
});

/** Both variable-name hooks, for the <html> class. */
export const fontVariables = `${archivo.variable} ${courierPrime.variable}`;

/**
 * The families, their roles and the axis settings the site uses them
 * at. Documentation that cannot drift: the values below are the ones
 * globals.css is written against.
 */
export const TYPOGRAPHY = {
  families: [
    {
      name: "Archivo",
      role: "Display, navigation, body copy, tracked capitals",
      axes: "wght 100–900, wdth 62–125%",
      used: "wght 400/500/600, wdth 88% (display) and 100% (interface)",
    },
    {
      name: "Courier Prime",
      role: "Technical readout — viewfinder, frame counters, film stock",
      axes: "none (static 400)",
      used: "wght 400, uppercase, tabular figures",
    },
  ],
} as const;
