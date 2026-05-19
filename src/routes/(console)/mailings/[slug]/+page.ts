import { error } from '@sveltejs/kit';
import type { Component, SvelteComponent } from 'svelte';
import type { MailingFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';

type MailingModule = { default: Component<SvelteComponent>; metadata: MailingFrontmatter };

const modules = import.meta.glob<MailingModule>('/content/mailings/*.md');
const modulesEager = import.meta.glob<MailingModule>('/content/mailings/*.md', { eager: true });

export const load: PageLoad = async ({ params }) => {
	const path = Object.entries(modulesEager).find(
		([, mod]) => mod.metadata?.slug === params.slug
	)?.[0];
	if (!path) throw error(404, `Mailing not found: ${params.slug}`);

	const { default: component, metadata } = await modules[path]();
	return { component, mailing: metadata };
};
