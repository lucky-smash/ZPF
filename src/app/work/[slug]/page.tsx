import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { getAdjacentProjects, getProject, projects, site } from "@/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Every project is known at build time, so all of them prerender. */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };

  const title =
    project.status === "placeholder"
      ? `${project.category} (sample entry)`
      : project.title;

  return {
    title,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    // Sample entries stay out of search results until they hold real work.
    robots:
      project.status === "placeholder"
        ? { index: false, follow: true }
        : { index: true, follow: true },
    openGraph: {
      type: "article",
      title: `${title} — ${site.name}`,
      description: project.description,
      url: `/work/${project.slug}`,
      images: [
        {
          url: project.image.src,
          width: project.image.width,
          height: project.image.height,
          alt: project.image.alt,
        },
      ],
    },
  };
}

/**
 * The shell — header, footer, page frame — renders immediately, and the
 * project streams in behind a boundary. Reading `params` inside the
 * Suspense boundary is what keeps navigation into a project instant.
 */
export default function ProjectPage({ params }: PageProps) {
  return (
    <>
      <Header />
      <main id="main">
        <Suspense fallback={<ProjectFallback />}>
          <ProjectBody params={params} />
        </Suspense>
      </main>
      <Footer />
      <SmoothScroll />
    </>
  );
}

/** Holds the page's shape for the moment before the project resolves. */
function ProjectFallback() {
  return (
    <div className="shell pb-16 pt-28 md:pt-40" aria-hidden>
      <div className="h-px w-full bg-rule-soft" />
      <div className="mt-10 h-[clamp(2.5rem,7vw,6.5rem)] w-3/4 bg-charcoal md:mt-14" />
      <div className="mt-14 aspect-video w-full bg-charcoal" />
    </div>
  );
}

async function ProjectBody({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { previous, next } = getAdjacentProjects(project.slug);

  return (
    <>
      <article>
        {/* Opening frame for the project. */}
        <header className="shell pb-10 pt-28 md:pb-16 md:pt-40">
          <Reveal className="flex items-center gap-4">
            <Link href="/#work" className="meta link-underline text-ash">
              ← Selected work
            </Link>
            <span aria-hidden className="h-px flex-1 bg-rule-soft" />
            <span className="meta text-signal">{project.category}</span>
          </Reveal>

          <Reveal delay={0.05} className="mt-10 md:mt-14">
            <h1 className="display text-[clamp(2.5rem,7vw,6.5rem)]">
              {project.title}
            </h1>
          </Reveal>

          {project.status === "placeholder" ? (
            <Reveal
              delay={0.1}
              className="mt-8 border-l-2 border-signal bg-charcoal/60 px-5 py-4"
            >
              <p className="text-sm leading-relaxed text-ash">
                <span className="text-bone">Sample entry.</span> The
                photograph is ŹPF&rsquo;s own, but this project&rsquo;s
                title, client and description are placeholders awaiting
                approved content. It does not describe a finished project.
              </p>
            </Reveal>
          ) : null}

          <Reveal
            delay={0.1}
            className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-rule-soft pt-8 md:mt-14 md:grid-cols-4"
          >
            <div>
              <p className="meta text-ash">Client</p>
              <p className="mt-2 text-base text-bone">
                {project.client ?? "To be added"}
              </p>
            </div>
            <div>
              <p className="meta text-ash">Category</p>
              <p className="mt-2 text-base text-bone">{project.category}</p>
            </div>
            <div>
              <p className="meta text-ash">Year</p>
              <p className="mt-2 text-base text-bone">
                {project.year ?? "To be added"}
              </p>
            </div>
            <div>
              <p className="meta text-ash">Status</p>
              <p className="mt-2 text-base text-bone">
                {project.status === "placeholder" ? "Sample" : "Published"}
              </p>
            </div>
          </Reveal>
        </header>

        <Reveal y={40} className="shell">
          <Figure
            asset={project.image}
            ratio="3 / 2"
            sizes="100vw"
            priority
            position="50% 28%"
          />
        </Reveal>

        <div className="shell grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-24">
          <div className="md:col-span-7">
            <Reveal>
              <p className="measure-wide text-lg leading-relaxed text-dust md:text-xl">
                {project.description}
              </p>
            </Reveal>

            {project.body?.length ? (
              <Reveal delay={0.1} stagger={0.08} className="mt-8 flex flex-col gap-5">
                {project.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-relaxed text-ash">
                    {paragraph}
                  </p>
                ))}
              </Reveal>
            ) : null}

            {/* Only rendered once a real watch link exists. */}
            {project.videoUrl || project.externalUrl ? (
              <Reveal delay={0.1} className="mt-10 flex flex-wrap gap-4">
                {project.videoUrl ? (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meta pill pill-solid group"
                  >
                    Watch the film <span aria-hidden>↗</span>
                  </a>
                ) : null}
                {project.externalUrl ? (
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meta pill group"
                  >
                    View project <span aria-hidden>↗</span>
                  </a>
                ) : null}
              </Reveal>
            ) : null}
          </div>

          {project.credits?.length ? (
            <div className="md:col-span-4 md:col-start-9">
              <Reveal stagger={0.06}>
                <p className="meta border-b border-rule-soft pb-4 text-ash">
                  Credits
                </p>
                {project.credits.map((credit) => (
                  <div
                    key={`${credit.role}-${credit.name}`}
                    className="flex items-baseline justify-between gap-6 border-b border-rule-soft py-4"
                  >
                    <span className="meta text-ash">{credit.role}</span>
                    <span className="text-right text-base text-bone">
                      {credit.name}
                    </span>
                  </div>
                ))}
              </Reveal>
            </div>
          ) : null}
        </div>

        {project.gallery?.length ? (
          <div className="shell grid grid-cols-1 gap-6 pb-16 md:grid-cols-2 md:gap-8 md:pb-24">
            {project.gallery.map((image, index) => (
              <Reveal
                key={image.src}
                y={40}
                className={index % 2 === 1 ? "md:pt-16" : undefined}
              >
                <Figure
                  asset={image}
                  ratio="4 / 5"
                  sizes="(max-width: 48rem) 100vw, 46vw"
                />
              </Reveal>
            ))}
          </div>
        ) : null}
      </article>

      {/* Keep moving through the work. */}
      <nav
        aria-label="More projects"
        className="shell grid grid-cols-1 gap-px border-t border-rule-soft sm:grid-cols-2"
      >
        {previous ? (
          <Link
            href={`/work/${previous.slug}`}
            className="group flex flex-col gap-2 border-b border-rule-soft py-10 sm:border-b-0 sm:pr-8"
          >
            <span className="meta text-ash">← Previous</span>
            <span className="display text-xl text-bone transition-colors duration-500 group-hover:text-signal md:text-2xl">
              {previous.category}
            </span>
          </Link>
        ) : null}
        {next ? (
          <Link
            href={`/work/${next.slug}`}
            className="group flex flex-col gap-2 py-10 sm:items-end sm:border-l sm:border-rule-soft sm:pl-8"
          >
            <span className="meta text-ash">Next →</span>
            <span className="display text-xl text-bone transition-colors duration-500 group-hover:text-signal md:text-2xl">
              {next.category}
            </span>
          </Link>
        ) : null}
      </nav>
    </>
  );
}
