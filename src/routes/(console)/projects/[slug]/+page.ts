import type { ProjectFrontmatter } from "$lib/types";
import type { PageLoad } from "./$types";
import type { Component, SvelteComponent } from "svelte";
import { error } from "@sveltejs/kit";
import { resolveProjectImage } from "$lib/utils/image";

type MarkdownModule = {
  default: Component<SvelteComponent>;
  metadata: ProjectFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>("/content/projects/*.md", { eager: true });

export const load: PageLoad = async ({ params }) => {
  const entry = Object.values(modules).find((m) => m.metadata.slug === params.slug);
  if (!entry) throw error(404, `Project "${params.slug}" not found`);

  const { default: component, metadata } = entry;
  const images = (metadata.images ?? (metadata.image ? [metadata.image] : []))
    .filter(Boolean)
    .map((p) => resolveProjectImage(p));

  return { component, metadata, images };
};

export const entries = () => {
  return Object.values(modules).map((m) => ({ slug: m.metadata.slug }));
};
