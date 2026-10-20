import type { MetadataRoute } from "next";

import { projects, site } from "@/data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    // Sample entries are excluded until they hold real projects.
    ...projects
      .filter((project) => project.status === "approved")
      .map((project) => ({
        url: `${site.url}/work/${project.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
