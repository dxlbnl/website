import type { NoteFrontmatter, ProductFrontmatter } from '$lib/types';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { feedPosts } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

const notesMods = import.meta.glob<{ metadata: NoteFrontmatter }>('/content/notes/*/index.md', {
	eager: true
});
const productsMods = import.meta.glob<{ metadata: ProductFrontmatter }>('/content/products/*.md', {
	eager: true
});

export const prerender = false;

export const load: PageServerLoad = async () => {
	const [latestPost] = await db.select().from(feedPosts).orderBy(desc(feedPosts.date)).limit(1);
	const latestFeed = latestPost ? { ...latestPost, date: latestPost.date.toISOString() } : null;

	const notes = Object.entries(notesMods)
		.map(([path, mod]) => {
			const slug = path.split('/').at(-2)!;
			const idx = parseInt(slug.split('-')[0]) || 0;
			return { slug, idx, ...mod.metadata };
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 6);

	const products = Object.values(productsMods)
		.map((mod) => mod.metadata)
		.slice(0, 4);

	return { latestFeed, notes, products };
};
