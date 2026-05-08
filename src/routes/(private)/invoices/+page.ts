import type { InvoiceFrontmatter } from "$lib/types";
import type { PageLoad } from "./$types";
import type { Component, SvelteComponent } from "svelte";
import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";

export const prerender = false;

type MarkdownModule = {
  default: Component<SvelteComponent>;
  metadata: InvoiceFrontmatter;
};

const modules = import.meta.env.DEV
  ? import.meta.glob<MarkdownModule>("/content/invoices/*.md", { eager: true })
  : {};

export const load: PageLoad = async () => {
  if (!dev) {
    throw error(404);
  }
  const invoices = Object.values(modules)
    .map((module) => module.metadata)
    .sort((a, b) => b.datum.localeCompare(a.datum));

  return { invoices };
};
