import type { NoteFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';

type NoteModule = { default: Component<SvelteComponent>; metadata: NoteFrontmatter };

const modules = import.meta.glob<NoteModule>('/content/notes/*/index.md');

export const load: PageLoad = async ({ params }) => {
	const path = `/content/notes/${params.slug}/index.md`;
	const loadModule = modules[path];
	if (!loadModule) throw error(404, `Note not found: ${params.slug}`);
	const { default: component, metadata } = await loadModule();
	return { component, metadata };
};
