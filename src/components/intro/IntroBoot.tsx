import { INTRO_BOOT_SCRIPT } from "@/lib/intro";

/**
 * Arms the opening sequence before the first paint.
 *
 * It has to be inline and parser-blocking: anything deferred would let
 * the homepage paint first, and the visitor would see the website for a
 * frame before a camera dropped over it. Rendered as the first thing in
 * the body, so nothing can paint ahead of it.
 *
 * It only ever *adds* the attributes the overlay needs, and carries its
 * own watchdog to take them away again if the sequence never comes to
 * life. Every failure path ends with the plain website.
 */
export function IntroBoot() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }}
    />
  );
}
