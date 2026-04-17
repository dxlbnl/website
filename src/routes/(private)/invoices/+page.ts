import type { InvoiceFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';

if (import.meta.env.MODE !== 'development') {
	throw new Error('Invoice routes are only available in development mode');
}

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: InvoiceFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>('/content/invoices/*.md', { eager: true });

export const load: PageLoad = async () => {
	const invoices = Object.values(modules)
		.map((module) => module.metadata)
		.sort((a, b) => b.datum.localeCompare(a.datum));

	return { invoices };
};
