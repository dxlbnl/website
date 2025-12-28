// src/routes/+page.ts

import type { ConsoleFrontmatter } from '$lib/types'; // Assuming you put the interface in $lib/types
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';

// 1. Define the specific path to your index file
const INDEX_PATH = '/content/console.md';

// 2. Define the expected shape of the imported module
interface MarkdownModule {
	default: Component<SvelteComponent>;
	metadata: ConsoleFrontmatter;
}

/**
 * Use import.meta.glob to dynamically import all .md files.
 * The generic <MarkdownModule> ensures the structure is correct.
 */
const modules = import.meta.glob<MarkdownModule>('/content/*.md', { eager: true });

/** @type {PageLoad} */
export const load: PageLoad = async () => {
	// 3. Find the specific index module using the type assertion
	const { default: component, metadata } = modules[INDEX_PATH];

	// console.log(indexModule.render());

	// Error handling
	if (!component) {
		// Return a 404/error state object if the file is missing
		return {
			status: 404,
			error: new Error(`[ERROR 404] Repository file not found at ${INDEX_PATH}`)
		};
	}

	// 4. Extract the data: The types are now correctly inferred.
	// const { default: Component, metadata } = indexModule;

	// 5. Return the data to the +page.svelte component
	return {
		// Renamed to 'contentComponent' for clarity
		component,
		metadata

		// The frontmatter data, now type-checked against ConsoleFrontmatter
		// frontmatter: metadata
	};
};
