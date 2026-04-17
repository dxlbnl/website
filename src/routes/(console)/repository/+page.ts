import type { RepositoryFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: RepositoryFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>('/content/repository/*.md', { eager: true });

export const load: PageLoad = async () => {
    // Extract slug from file path to dynamically link them
	const entries = Object.entries(modules).map(([path, module]) => {
        const slug = path.split('/').pop()?.replace('.md', '');
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
