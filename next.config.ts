import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Keep the project root clean for handover: no generated agent rules file.
  agentRules: false,
  images: {
    // AVIF handles heavy film grain far better than JPEG; WebP is the
    // fallback for browsers that do not take it.
    formats: ["image/avif", "image/webp"],
    // Next only honours the qualities declared here. 68 and 70 are used
    // by the full-bleed backdrops, which sit under a scrim.
    qualities: [68, 70, 75],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin the workspace root: a stray lockfile above this folder would
    // otherwise make Turbopack treat the home directory as the root.
    root: path.resolve(process.cwd()),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
