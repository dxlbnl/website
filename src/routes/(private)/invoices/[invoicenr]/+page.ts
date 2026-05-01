import type { InvoiceFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const prerender = false;

type MarkdownModule = {
	default: Component<SvelteComponent>;
	metadata: InvoiceFrontmatter;
};

const modules = import.meta.env.DEV
	? import.meta.glob<MarkdownModule>('/content/invoices/*.md', { eager: true })
	: {};

export const load: PageLoad = async ({ params }) => {
	if (!dev) {
		throw error(404);
	}
	const invoiceModule = Object.entries(modules).find(([, module]) => {
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
