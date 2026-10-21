import Link from "next/link";

import { Figure } from "@/components/ui/Figure";
import { Parallax } from "@/components/ui/Parallax";
import type { Project } from "@/data";

const RATIO: Record<Project["layout"], string> = {
  wide: "16 / 9",
  tall: "2 / 3",
  standard: "4 / 5",
};

const SIZES: Record<Project["layout"], string> = {
  wide: "(max-width: 48rem) 100vw, 83vw",
  tall: "(max-width: 48rem) 100vw, 42vw",
  standard: "(max-width: 48rem) 100vw, 50vw",
};

interface ProjectCardProps {
  project: Project;
  /** Position in the gallery, shown as the index. */
  index: number;
  className?: string;
}

/**
 * One project in the gallery.
 *
 * Every detail — category, title, description, client, year — is
 * rendered at rest. Hover only adds emphasis, so a touch visitor loses
 * nothing.
 */
export function ProjectCard({ project, index, className = "" }: ProjectCardProps) {
  return (
    <article className={className}>
      <Link
        href={`/work/${project.slug}`}
        data-cursor-label="VIEW"
        className="group block"
      >
        {/* The still drifts against the scroll inside its own frame,
            which is what gives a page of stationary rectangles the
            feeling of a camera moving past them. The drift is on the
            frame and the hover is on the photograph inside it, so the
            two never write to the same transform. The scale is the
            overfill the drift needs — without it the frame would show
            its own edge at the top or the bottom of the travel. */}
        <div className="overflow-hidden bg-charcoal">
          <Parallax distance={9}>
            <Figure
              asset={project.image}
              ratio={RATIO[project.layout]}
              sizes={SIZES[project.layout]}
              className="scale-[1.07]"
              imageClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              position={project.layout === "wide" ? "50% 42%" : "center"}
            />
          </Parallax>
        </div>

        <div className="mt-5 flex items-baseline gap-4">
          <span className="meta text-signal">
            {String(index).padStart(2, "0")}
          </span>
          <span aria-hidden className="h-px flex-1 bg-rule-soft" />
          <span className="meta text-ash">{project.category}</span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-6">
          <h3 className="display text-2xl text-bone md:text-3xl">
            {project.title}
          </h3>
          <span
            aria-hidden
            className="mt-1 shrink-0 text-xl text-ash transition-all duration-500 group-hover:translate-x-1 group-hover:text-signal"
          >
            →
          </span>
        </div>

        <p className="mt-3 max-w-prose text-sm leading-relaxed text-ash">
          {project.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="meta text-ash">
            {project.client ?? "Client / brand — to be added"}
          </span>
          {project.year ? (
            <span className="meta text-ash">{project.year}</span>
          ) : null}
          {project.status === "placeholder" ? (
            <span className="meta border border-signal/50 px-2 py-1 text-signal">
              Sample entry
            </span>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
