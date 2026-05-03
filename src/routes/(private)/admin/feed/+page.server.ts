import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { feedPosts } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { verifyAdminSession } from '$lib/utils/auth';
import type { Actions, PageServerLoad } from './$types';

const createSchema = z.object({
	body: z.string().min(1).max(50_000),
	tags: z
		.string()
		.max(500)
		.optional()
		.transform((v) =>
			(v ?? '')
				.split(',')
				.map((t) => t.trim().toLowerCase())
				.filter(Boolean)
		)
});

export const prerender = false;

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(feedPosts).orderBy(desc(feedPosts.date));
	return {
		posts: rows.map((r) => ({ ...r, date: r.date.toISOString() }))
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete('admin_session', { path: '/' });
	},

	create: async ({ request, cookies }) => {
		if (!(await verifyAdminSession(cookies.get('admin_session')))) return fail(401);
		const data = await request.formData();
		const parsed = createSchema.safeParse({
			body: (data.get('body') as string)?.trim(),
			tags: data.get('tags') ?? undefined
		});
		if (!parsed.success) return fail(400, { error: 'Invalid input' });
		await db.insert(feedPosts).values({ body: parsed.data.body, tags: parsed.data.tags });
	},

	delete: async ({ request, cookies }) => {
		if (!(await verifyAdminSession(cookies.get('admin_session')))) return fail(401);
		const id = Number((await request.formData()).get('id'));
		if (!id) return fail(400);
		await db.delete(feedPosts).where(eq(feedPosts.id, id));
	}
};
