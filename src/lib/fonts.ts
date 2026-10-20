/**
 * ------------------------------------------------------------------
 * THE TYPOGRAPHIC IDENTITY — ADOBE FONTS
 * ------------------------------------------------------------------
 * Three families carry the whole site, each with a job:
 *
 *   Freight Display Pro  the voice. Editorial, literary, high contrast,
 *                        with a true italic used as an accent rather
 *                        than as decoration. Every oversized line on
 *                        the site is set in it.
 *   Acumin Pro           the apparatus. Navigation, body copy, buttons,
 *                        labels. A neo-grotesque with a wide weight
 *                        range, so the interface hierarchy comes out of
 *                        one family.
 *   Courier Prime        the technical record. The typeface screenplays
 *                        are written in, used only where the site is
 *                        reporting a specification: frame counters,
 *                        film stock, slate data, the camera's own
 *                        markings.
 *
 * ------------------------------------------------------------------
 * WHAT HAS TO BE SET UP ONCE, IN AN ADOBE ACCOUNT
 * ------------------------------------------------------------------
 * Adobe serves these from a "Web Project", which is created in the
 * account that holds the licence. It cannot be created from the
 * codebase, and a kit ID cannot be guessed — it is seven characters
 * issued by Adobe. So:
 *
 *   1. Sign in at https://fonts.adobe.com/
 *   2. Create a Web Project containing exactly the families and styles
 *      listed in ADOBE_FONTS.families below.
 *   3. Set the project's font-display to "swap" and add the production
 *      domain (plus localhost) to its domain list.
 *   4. Adobe shows an embed code containing
 *      https://use.typekit.net/XXXXXXX.css — copy the XXXXXXX.
 *   5. Put it in .env.local (see .env.local.example):
 *        NEXT_PUBLIC_ADOBE_FONTS_KIT_ID=XXXXXXX
 *
 * Until that value is present the stylesheet is simply not requested
 * and the stacks in globals.css fall through to their fallbacks — the
 * site is complete and intentional either way, and sharpens into its
 * real identity the moment the kit ID lands. Nothing here is
 * conditional on the fonts having arrived.
 *
 * Note: having these families synced to a Mac through Creative Cloud
 * does NOT make them available to a browser. The Web Project is what
 * serves them to the web, and it is a separate thing.
 * ------------------------------------------------------------------
 */

/** The Adobe Fonts web project. One value, from the environment. */
const kitId = (process.env.NEXT_PUBLIC_ADOBE_FONTS_KIT_ID ?? "").trim();

/**
 * The families the web project must contain, with the exact styles the
 * site uses. Nothing else should be added to the project: every extra
 * style is another file the browser may fetch.
 *
 * `css` is the family name Adobe serves — always the lowercase slug,
 * which is what the font stacks in globals.css are written against.
 */
export const ADOBE_FONTS = {
  kitId,
  families: [
    {
      name: "Freight Display Pro",
      css: "freight-display-pro",
      slug: "freight-display-pro",
      role: "Display — headlines, section titles, pull quotes",
      styles: ["Light 300", "Light Italic 300", "Book 400", "Book Italic 400"],
    },
    {
      name: "Acumin Pro",
      css: "acumin-pro",
      slug: "acumin-pro",
      role: "Supporting — navigation, body copy, buttons, labels",
      styles: ["Light 300", "Regular 400", "Medium 500"],
    },
    {
      name: "Courier Prime",
      css: "courier-prime",
      slug: "courier-prime",
      role: "Technical — frame counters, film stock, slate data",
      styles: ["Regular 400"],
    },
  ],
} as const;

/** True once a web project has actually been configured. */
export const hasAdobeFonts = kitId.length > 0;

/**
 * The kit stylesheet, or null when there is no kit. Returning null
 * rather than a broken URL is deliberate: a request to
 * use.typekit.net/.css would 404 on every page load and cost a
 * round trip to learn nothing.
 */
export const adobeFontsHref = hasAdobeFonts
  ? `https://use.typekit.net/${kitId}.css`
  : null;
