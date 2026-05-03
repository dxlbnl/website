import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { shareSessions } from '$lib/server/db/schema';
import { and, eq, gt, isNull } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const forDevice = url.searchParams.get('for');
	if (!z.string().uuid().safeParse(forDevice).success) error(400, 'Invalid device ID');

	const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
	const rows = await db
		.select({ id: shareSessions.id, hostName: shareSessions.hostName, hostDeviceId: shareSessions.hostDeviceId })
		.from(shareSessions)
		.where(
			and(
				eq(shareSessions.targetDeviceId, forDevice!),
				isNull(shareSessions.answer),
				eq(shareSessions.denied, false),
				gt(shareSessions.createdAt, tenMinutesAgo)
			)
		)
		.limit(1);

	return json(rows[0] ?? null);
};
