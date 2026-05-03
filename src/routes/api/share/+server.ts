import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { shareSessions } from '$lib/server/db/schema';
import { lt } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { RequestHandler } from './$types';

const schema = z.object({
	offer: z.string().min(10),
	hostName: z.string().max(64).default('Host')
});

export const POST: RequestHandler = async ({ request }) => {
	const result = schema.safeParse(await request.json());
	if (!result.success) error(400, 'Invalid input');

	// Clean up sessions older than 10 minutes
	const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
	await db.delete(shareSessions).where(lt(shareSessions.createdAt, tenMinutesAgo));

	const id = nanoid(8);
	await db.insert(shareSessions).values({
		id,
		offer: result.data.offer,
		hostName: result.data.hostName
	});

	return json({ id });
};
