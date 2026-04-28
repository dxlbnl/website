import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { feedPosts } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ cookies }) => {
	const authed = cookies.get('admin_session') === env.ADMIN_TOKEN;
	if (!authed) return { authed: false as const, posts: [] };

	const rows = await db.select().from(feedPosts).orderBy(desc(feedPosts.date));
	return {
		authed: true as const,
		posts: rows.map((r) => ({ ...r, date: r.date.toISOString() }))
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete('admin_session', { path: '/' });
	},

	create: async ({ request, cookies }) => {
		if (cookies.get('admin_session') !== env.ADMIN_TOKEN) return fail(401);
		const data = await request.formData();
		const body = (data.get('body') as string)?.trim();
		if (!body) return fail(400, { error: 'Body required' });
		const tags =
			(data.get('tags') as string)
				?.split(',')
				.map((t) => t.trim().toLowerCase())
				.filter(Boolean) ?? [];
		await db.insert(feedPosts).values({ body, tags });
	},

	delete: async ({ request, cookies }) => {
		if (cookies.get('admin_session') !== env.ADMIN_TOKEN) return fail(401);
		const id = Number((await request.formData()).get('id'));
		if (!id) return fail(400);
		await db.delete(feedPosts).where(eq(feedPosts.id, id));
	}
};
