import type { RepositoryFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: RepositoryFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>('/content/repository/*/index.md', { eager: true });

export const load: PageLoad = async () => {
    // Extract slug from directory name
	const entries = Object.entries(modules).map(([path, module]) => {
        const parts = path.split('/');
        const slug = parts[parts.length - 2];
        return {
            slug,
            ...module.metadata
        };
    });

    // sort by date descending
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return {
		entries
	};
};
