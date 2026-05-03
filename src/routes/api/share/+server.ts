import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { shareSessions } from '$lib/server/db/schema';
import { lt } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { RequestHandler } from './$types';

const schema = z.object({
	offer: z.string().min(10),
	hostName: z.string().max(64).default('Host'),
	hostDeviceId: z.string().uuid().optional(),
	targetDeviceId: z.string().uuid().optional()
});

export const POST: RequestHandler = async ({ request }) => {
	const result = schema.safeParse(await request.json());
	if (!result.success) error(400, 'Invalid input');

	const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
	await db.delete(shareSessions).where(lt(shareSessions.createdAt, tenMinutesAgo));

	const id = nanoid(8);
	await db.insert(shareSessions).values({
		id,
		offer: result.data.offer,
		hostName: result.data.hostName,
		hostDeviceId: result.data.hostDeviceId,
		targetDeviceId: result.data.targetDeviceId
	});

	return json({ id });
};
