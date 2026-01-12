import type { InvoiceFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';

if (import.meta.env.MODE !== 'development') {
	throw new Error('Invoice routes are only available in development mode');
}

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: InvoiceFrontmatter;
};

const modules = import.meta.glob<MarkdownModule>('/content/invoices/*.md', { eager: true });

export const load: PageLoad = async ({ params }) => {
	const invoiceModule = Object.entries(modules).find(([path, module]) => {
		return module.metadata.factuurnr === params.invoicenr;
	});

	if (!invoiceModule) {
		throw error(404, `Factuur "${params.invoicenr}" niet gevonden`);
	}

	const [, { default: component, metadata }] = invoiceModule;

	return {
		invoice: metadata,
		component
	};
};
