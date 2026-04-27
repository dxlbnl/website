import type { MailingFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';

type MailingModule = { default: Component<SvelteComponent>; metadata: MailingFrontmatter };

const modules = import.meta.glob<MailingModule>('/content/mailings/*.md');

export const load: PageLoad = async ({ params }) => {
	// file naming: YYYY-MM-DD-<slug>.md — match by slug suffix
	const path = Object.keys(modules).find(
		(p) => p.endsWith(`-${params.slug}.md`) || p.endsWith(`/${params.slug}.md`)
	);

	if (!path) throw error(404, `Mailing not found: ${params.slug}`);

	const { default: component, metadata } = await modules[path]();
	if (!metadata.published) throw error(404, `Mailing not found: ${params.slug}`);

	return { component, mailing: metadata };
};
