import Image from "next/image";
import type { ImageAsset } from "@/data";

interface FigureProps {
  asset: ImageAsset;
  /** CSS aspect-ratio for the frame, e.g. "16 / 9". */
  ratio?: string;
  /** Required so the browser downloads an appropriately sized file. */
  sizes: string;
  /** Set on the hero image only — everything else loads lazily. */
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** Which part of the photograph to keep when the frame crops it. */
  position?: string;
  /** Overrides the alt text from the asset registry. */
  alt?: string;
  /** Compression, 1-100. Lower it for images sitting under a scrim. */
  quality?: number;
  /**
   * The house grade, laid over the photograph. On by default.
   *
   * Turn it off for an image that already sits under a scrim of its
   * own — the hero, the visual breath, the frame the opening sequence
   * resolves into — where a second pass would only crush it.
   */
  grade?: boolean;
}

/**
 * The single way an image reaches the page.
 *
 * The frame reserves its space from `ratio` before the file arrives, so
 * nothing shifts as images load, and it carries a charcoal backdrop so a
 * failed image degrades to a dark panel rather than a white hole.
 */
export function Figure({
  asset,
  ratio = "3 / 4",
  sizes,
  priority = false,
  className = "",
  imageClassName = "",
  position = "center",
  alt,
  quality,
  grade = true,
}: FigureProps) {
  return (
    <div
      className={`relative overflow-hidden bg-charcoal ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={asset.src}
        alt={alt ?? asset.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        loading={priority ? undefined : "lazy"}
        placeholder={asset.blurDataURL ? "blur" : "empty"}
        blurDataURL={asset.blurDataURL}
        className={`object-cover ${imageClassName}`}
        style={{ objectPosition: position }}
      />
      {/* ---- THE GRADE --------------------------------------------
          One pass over every photograph on the site: warm where the
          light is, cool and down in the shadow, from the same token
          the rendered camera is lit to.

          This is what makes a monochrome Himalayan still, a warm
          corridor and a rendered lens belong to one film. It is
          deliberately light — the brief is to grade the photography,
          not to tint it — and it is here, in the one component every
          image goes through, rather than at forty call sites. */}
      {grade ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:var(--grade-photo)]"
        />
      ) : null}
    </div>
  );
}
