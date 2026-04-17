import type { RepositoryFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';

export const load: PageLoad = async ({ params }) => {
	try {
        const module = await import(`../../../../content/repository/${params.slug}.md`) as {
            default: Component<SvelteComponent>;
            metadata: RepositoryFrontmatter;
        };

        return {
            component: module.default,
            metadata: module.metadata
        };
    } catch {
        throw new Error(`Log entry not found`);
    }
};
