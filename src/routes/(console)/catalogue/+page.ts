import type { ProductFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: ProductFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>('/content/products/*.md', { eager: true });

export const load: PageLoad = async () => {
	const statusOrder: Record<string, number> = { available: 0, 'coming-soon': 1, 'sold-out': 2 };
	const products: ProductFrontmatter[] = Object.values(modules)
		.map((module) => module.metadata)
		.sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));

	return {
		products
	};
};
