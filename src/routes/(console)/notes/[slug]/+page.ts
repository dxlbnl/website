import type { NoteFrontmatter, ProductFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';

type NoteModule = { default: Component<SvelteComponent>; metadata: NoteFrontmatter };
type ProductModule = { metadata: ProductFrontmatter };

const modules = import.meta.glob<NoteModule>('/content/notes/*/index.md');
const productModules = import.meta.glob<ProductModule>('/content/products/*.md');

export const load: PageLoad = async ({ params }) => {
	const path = `/content/notes/${params.slug}/index.md`;
	const loadModule = modules[path];
	if (!loadModule) throw error(404, `Note not found: ${params.slug}`);
	const { default: component, metadata } = await loadModule();

	let productCta: string | undefined;
	if (metadata.productId) {
		const loadProduct = productModules[`/content/products/${metadata.productId}.md`];
		if (loadProduct) {
			const { metadata: p } = await loadProduct();
			const orderable = !!(p.stripePriceId || p.tindieUrl);
			if (p.status === 'available') productCta = 'GET ONE HERE';
			else if (p.status === 'coming-soon' && orderable) productCta = 'PREORDER NOW';
			else productCta = 'GET NOTIFIED';
		}
	}

	return { component, metadata, productCta };
};
