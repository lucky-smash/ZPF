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
    </div>
  );
}
