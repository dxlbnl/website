import type { MailingFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';

type MailingModule = { default: Component<SvelteComponent>; metadata: MailingFrontmatter };

const modules = import.meta.glob<MailingModule>('/content/mailings/*.md');

export const load: PageLoad = async ({ params }) => {
	// file naming: YYYY-MM-DD-<slug>.md - match by slug suffix
	const path = Object.keys(modules).find(
		(p) => p.endsWith(`-${params.slug}.md`) || p.endsWith(`/${params.slug}.md`)
	);

	if (!path) throw error(404, `Mailing not found: ${params.slug}`);

	const { default: component, metadata } = await modules[path]();
	if (!metadata.published) throw error(404, `Mailing not found: ${params.slug}`);
	return { component, mailing: metadata };
};

export const entries = async () => {
	const mods = import.meta.glob<MailingModule>('/content/mailings/*.md', { eager: true });
	return Object.entries(mods)
		.filter(([, m]) => m.metadata.published)
		.map(([path, m]) => {
			if (m.metadata.slug) return { slug: m.metadata.slug };
			const filename = path.split('/').pop()?.replace('.md', '') ?? '';
			const match = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
			return { slug: match ? match[1] : filename };
		});
};
