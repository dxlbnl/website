import type { ProductFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: ProductFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>('/content/products/*.md', { eager: true });

export const load: PageLoad = async ({ params }) => {
	const productModule = Object.entries(modules).find(([path, module]) => {
		return module.metadata.id === params.id;
	});

	if (!productModule) {
		throw error(404, `Product "${params.id}" not found`);
	}

	const [, { default: component, metadata }] = productModule;

	return {
		component,
		product: metadata
	};
};
