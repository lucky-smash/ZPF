/**
 * A tiled film-grain layer over the whole page.
 *
 * Decorative only: it sits above the content, ignores pointer events
 * and is hidden from assistive technology.
 */
export function Grain() {
  return (
    <div
      aria-hidden
      className="grain-layer pointer-events-none fixed inset-0 z-[60]"
    />
  );
}
