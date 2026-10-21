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
 *
 * Every row but the last carries two frames. That is the one rule the
 * composition keeps, and it is why the slots are written as they are:
 * a grid item with a `col-start` is placed in the first row where that
 * span is still free, so pairing the spans is what decides whether two
 * projects share a row or each gets one of their own. The version
 * before this had five single-project rows in a twelve column grid,
 * which is where the gallery's height — and the long reaches of empty
 * black down one side of it — came from.
 *
 * The offsets are what stop the pairs reading as a table: the second
 * frame in a row is dropped against the first, by less than the
 * difference in their heights, so the two never line up at the top and
 * never leave a hole at the bottom.
 */
const PLACEMENT = [
  /* 01 — the opener, at the full measure. */
  "md:col-span-12",
  /* 02 + 03 — a portrait against a dropped square. */
  "md:col-span-5",
  "md:col-span-6 md:col-start-7 md:mt-[6vw]",
  /* 04 + 05 — the same pairing, reversed and tighter. */
  "md:col-span-6",
  "md:col-span-5 md:col-start-8 md:mt-[8vw]",
  /* 06 + 07 — the narrowest frame on the page, and the one beside it.
     06 only closes to four columns once there are enough of them for
     that to read as a held portrait rather than as a thumbnail: on a
     tablet, four of twelve is 226px, and a project title does not fit
     across it. */
  "md:col-span-5 lg:col-span-4",
  "md:col-span-6 md:col-start-7 lg:col-start-6 md:mt-[4vw]",
  /* 08 — centred, alone, and the close. */
  "md:col-span-8 md:col-start-3",
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

      <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-16 md:mt-16 md:grid-cols-12 md:gap-y-20">
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
