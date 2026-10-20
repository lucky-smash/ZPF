import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

interface SectionIntroProps {
  /** Chapter number, e.g. "04". */
  index: string;
  /** Short label above the heading. */
  eyebrow: string;
  children?: ReactNode;
  className?: string;
}

/**
 * The chapter marker that opens each section: an index, a hairline and
 * a label. Repeating it is what makes the page read as one film.
 */
export function SectionIntro({
  index,
  eyebrow,
  children,
  className = "",
}: SectionIntroProps) {
  return (
    <Reveal className={`flex items-baseline gap-4 ${className}`}>
      <span className="meta text-signal">{index}</span>
      <span aria-hidden className="h-px flex-1 translate-y-[-0.3em] bg-rule" />
      <span className="meta text-ash">{eyebrow}</span>
      {children}
    </Reveal>
  );
}
