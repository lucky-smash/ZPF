import { ProjectCard } from "@/components/ui/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { projects } from "@/data";

/**
 * Where each project sits on the twelve column grid.
 *
 * This is art direction, not content: the gallery is composed by hand
 * so it reads as an edit rather than a repeating template. Entries
 * beyond this list fall back to a half-width slot.
 */
const PLACEMENT = [
  "md:col-span-12",
  "md:col-span-5",
  "md:col-span-6 md:col-start-7 md:mt-[12vw]",
  "md:col-span-6 md:col-start-1",
  "md:col-span-10 md:col-start-3",
  "md:col-span-5 md:col-start-8",
  "md:col-span-6 md:col-start-1",
  "md:col-span-5 md:col-start-8 md:mt-[7vw]",
];

export function SelectedWork() {
  const placeholders = projects.filter(
    (project) => project.status === "placeholder",
  ).length;

  return (
    <section id="work" className="shell scroll-mt-24 border-t border-rule-soft beat">
      <SectionIntro index="04" eyebrow="Selected work" />

      <div className="mt-10 flex flex-col gap-6 md:mt-16 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <h2 className="display max-w-[16ch] text-[clamp(2.5rem,6vw,5.5rem)]">
            Films made for brands that matter.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="max-w-sm">
          <p className="text-sm leading-relaxed text-ash">
            A selection of brand films, documentaries and commercial work.
          </p>
        </Reveal>
      </div>

      {placeholders > 0 ? (
        <Reveal
          delay={0.15}
          className="mt-10 border-l-2 border-signal bg-charcoal/60 px-5 py-4 md:mt-14"
        >
          <p className="text-sm leading-relaxed text-ash">
            <span className="text-bone">Sample content.</span> The
            photography below is ŹPF&rsquo;s own, but the project titles,
            clients and descriptions are placeholders held until the
            company supplies approved details. They are not finished
            projects.
          </p>
        </Reveal>
      ) : null}

      <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-16 md:mt-16 md:grid-cols-12 md:gap-y-24">
        {projects.map((project, index) => (
          <Reveal
            key={project.slug}
            y={40}
            className={`self-start ${PLACEMENT[index] ?? "md:col-span-6"}`}
          >
            <ProjectCard project={project} index={index + 1} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
