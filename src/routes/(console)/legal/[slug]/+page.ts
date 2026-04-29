import type { LegalFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';

type LegalModule = { default: Component<SvelteComponent>; metadata: LegalFrontmatter };

const modules = import.meta.glob<LegalModule>('/content/legal/*.md');

export const load: PageLoad = async ({ params }) => {
	const path = `/content/legal/${params.slug}.md`;
	const loadModule = modules[path];
	if (!loadModule) throw error(404, `Page not found: ${params.slug}`);
	const { default: component, metadata } = await loadModule();
	return { component, metadata };
};
