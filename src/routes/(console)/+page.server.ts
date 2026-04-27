import type { ConsoleFrontmatter, NoteFrontmatter, ProductFrontmatter } from '$lib/types';
import type { PageServerLoad } from './$types';
import type { Component, SvelteComponent } from 'svelte';
import { db } from '$lib/server/db';
import { feedPosts } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

const consoleMods = import.meta.glob<{
	default: Component<SvelteComponent>;
	metadata: ConsoleFrontmatter;
}>('/content/*.md', { eager: true });
const notesMods = import.meta.glob<{ metadata: NoteFrontmatter }>('/content/notes/*/index.md', {
	eager: true
});
const productsMods = import.meta.glob<{ metadata: ProductFrontmatter }>('/content/products/*.md', {
	eager: true
});

export const prerender = false;

export const load: PageServerLoad = async () => {
	const { metadata } = consoleMods['/content/console.md'];

	const [latestPost] = await db.select().from(feedPosts).orderBy(desc(feedPosts.date)).limit(1);
	const latestFeed = latestPost ? { ...latestPost, date: latestPost.date.toISOString() } : null;

	const notes = Object.entries(notesMods)
		.map(([path, mod]) => ({ slug: path.split('/').at(-2)!, ...mod.metadata }))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 3);

	const products = Object.values(productsMods)
		.map((mod) => mod.metadata)
		.slice(0, 3);

	return { metadata, latestFeed, notes, products };
};
