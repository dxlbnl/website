import type { ProductFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: ProductFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>('/content/products/*.md', { eager: true });

export const load: PageLoad = async () => {
	const products: ProductFrontmatter[] = Object.values(modules).map((module) => module.metadata);

	return {
		products
	};
};
