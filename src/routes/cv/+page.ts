import type { CVFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component } from 'svelte';
import { error } from '@sveltejs/kit';

type CVModule = { default: Component; metadata: CVFrontmatter };
const modules = import.meta.glob<CVModule>('/content/cv.md');

export const load: PageLoad = async () => {
	const loadModule = Object.values(modules)[0];
	if (!loadModule) throw error(404, 'CV not found');

	const { default: component, metadata } = await loadModule();

	console.log(component, metadata);

	return { component, metadata };
};
