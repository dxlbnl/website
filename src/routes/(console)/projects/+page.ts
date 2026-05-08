import type { ProjectFrontmatter } from "$lib/types";
import type { PageLoad } from "./$types";
import type { Component, SvelteComponent } from "svelte";

type MarkdownModule = {
  default: Component<SvelteComponent>;
  metadata: ProjectFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>("/content/projects/*.md", { eager: true });

export const load: PageLoad = async () => {
  const projects: ProjectFrontmatter[] = Object.values(modules)
    .map((m) => m.metadata)
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return { projects };
};
