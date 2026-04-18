import type { RepositoryFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: RepositoryFrontmatter;
};

// Use the same globbing pattern as the index to ensure consistency
const modules = import.meta.glob<MarkdownModule>('/content/repository/*/index.md');

export const load: PageLoad = async ({ params }) => {
    const path = `/content/repository/${params.slug}/index.md`;
    const loadModule = modules[path];

	if (!loadModule) {
        throw new Error(`Log entry not found: ${params.slug}`);
    }

    const module = await loadModule();

    return {
        component: module.default,
        metadata: module.metadata
    };
};
