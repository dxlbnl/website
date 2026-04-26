import type { ProductFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';
import { resolveProductImage } from '$lib/utils/image';

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: ProductFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>('/content/products/*.md', { eager: true });

export const load: PageLoad = async ({ params }) => {
	const productModule = Object.entries(modules).find(([, module]) => {
		return module.metadata.id === params.id;
	});

	if (!productModule) {
		throw error(404, `Product "${params.id}" not found`);
	}

	const [, { default: component, metadata }] = productModule;

	const images = metadata.images?.map((p) => resolveProductImage(p, metadata.id));

	return {
		component,
		product: { ...metadata, images }
	};
};
