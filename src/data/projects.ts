import { assets } from "./assets";
import type { Project } from "./types";

/**
 * ------------------------------------------------------------------
 * SELECTED WORK
 * ------------------------------------------------------------------
 * ⚠️  EVERY ENTRY BELOW IS SAMPLE CONTENT.
 *
 * The photography is ŹPF's own, taken from the company introduction
 * deck. The titles, clients, years and descriptions are placeholders
 * that exist only to demonstrate the gallery layout. They are flagged
 * `status: "placeholder"`, which makes the site render a visible
 * "Sample" marker on the card and a notice on the project page.
 *
 * To publish a real project:
 *   1. Replace title / client / year / description / category.
 *   2. Point `image` at the real still (add it to the asset registry).
 *   3. Add `videoUrl` and `gallery` if they exist.
 *   4. Change `status` to "approved" — the sample marker disappears.
 *
 * `layout` controls the shape the project takes in the gallery:
 *   "wide"     — full width, cinematic crop
 *   "tall"     — portrait frame
 *   "standard" — half width
 * ------------------------------------------------------------------
 */
export const projects: Project[] = [
  {
    slug: "sample-project-01",
    title: "Replace With Project Name",
    category: "Brand / Corporate Films",
    description:
      "Project description — add approved copy describing the brief, the approach and what the finished film set out to do.",
    image: assets["pangong-shore"],
    layout: "wide",
    featured: true,
    status: "placeholder",
    credits: [
      { role: "Director", name: "To be added" },
      { role: "Cinematographer", name: "To be added" },
    ],
  },
  {
    slug: "sample-project-02",
    title: "Replace With Project Name",
    category: "Documentaries",
    description:
      "Project description — add approved copy describing the brief, the approach and what the finished film set out to do.",
    image: assets["ladakh-gathering"],
    layout: "tall",
    status: "placeholder",
    gallery: [assets["mountain-dusk"], assets["pangong-shore"]],
  },
  {
    slug: "sample-project-03",
    title: "Replace With Project Name",
    category: "Industrial Films",
    description:
      "Project description — add approved copy describing the brief, the approach and what the finished film set out to do.",
    image: assets["craft-hands"],
    layout: "standard",
    status: "placeholder",
  },
  {
    slug: "sample-project-04",
    title: "Replace With Project Name",
    category: "State Tourism Films",
    description:
      "Project description — add approved copy describing the brief, the approach and what the finished film set out to do.",
    image: assets["mountain-dusk"],
    layout: "standard",
    status: "placeholder",
  },
  {
    slug: "sample-project-05",
    title: "Replace With Project Name",
    category: "Conceptual TVCs",
    description:
      "Project description — add approved copy describing the brief, the approach and what the finished film set out to do.",
    image: assets["sky-monsoon"],
    layout: "wide",
    status: "placeholder",
  },
  {
    slug: "sample-project-06",
    title: "Replace With Project Name",
    category: "Music Videos",
    description:
      "Project description — add approved copy describing the brief, the approach and what the finished film set out to do.",
    image: assets["corridor-mono"],
    layout: "tall",
    status: "placeholder",
  },
  {
    slug: "sample-project-07",
    title: "Replace With Project Name",
    category: "Architectural Films & Still Shoots",
    description:
      "Project description — add approved copy describing the brief, the approach and what the finished film set out to do.",
    image: assets["corridor-sepia"],
    layout: "standard",
    status: "placeholder",
  },
  {
    slug: "sample-project-08",
    title: "Replace With Project Name",
    category: "Product Launch / Unboxing Films",
    description:
      "Project description — add approved copy describing the brief, the approach and what the finished film set out to do.",
    image: assets["rain-asphalt"],
    layout: "standard",
    status: "placeholder",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Returns the projects either side of `slug`, wrapping at both ends. */
export function getAdjacentProjects(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}
