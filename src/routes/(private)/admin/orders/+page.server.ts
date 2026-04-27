import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ cookies }) => {
	const authed = cookies.get('admin_session') === env.ADMIN_TOKEN;
	if (!authed) return { authed: false as const, orders: [] };

	const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
	return {
		authed: true as const,
		orders: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
	};
};
