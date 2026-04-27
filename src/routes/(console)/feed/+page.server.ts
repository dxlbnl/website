import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { feedPosts } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const prerender = false;

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(feedPosts).orderBy(desc(feedPosts.date));

	return {
		entries: rows.map((r) => ({
			id: r.id,
			body: r.body,
			date: r.date.toISOString(),
			tags: r.tags
		}))
	};
};
