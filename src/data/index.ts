/**
 * Single entry point for the content layer. Components import from
 * "@/data" only, so swapping these local objects for Sanity queries
 * later means changing this file — not the UI.
 */
export * from "./types";
export * from "./assets";
export * from "./site";
export * from "./projects";
export * from "./services";
export * from "./testimonials";
export * from "./team";
