import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { shareSessions } from '$lib/server/db/schema';
import { eq, lt } from 'drizzle-orm';
import type { RequestHandler } from './$types';

async function cleanupOldSessions() {
	const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
	await db.delete(shareSessions).where(lt(shareSessions.createdAt, fiveMinutesAgo));
}

async function getSession(id: string) {
	const rows = await db.select().from(shareSessions).where(eq(shareSessions.id, id)).limit(1);
	return rows[0] ?? null;
}

export const GET: RequestHandler = async ({ params }) => {
	await cleanupOldSessions();

	const session = await getSession(params.id);
	if (!session) error(404, 'Session not found');

	return json({
		offer: session.offer,
		hostName: session.hostName,
		hostDeviceId: session.hostDeviceId,
		answer: session.answer,
		peerName: session.peerName,
		guestDeviceId: session.guestDeviceId,
		approved: session.approved,
		denied: session.denied
	});
};

const answerSchema = z.object({
	answer: z.string().min(10),
	peerName: z.string().max(64).default('Guest'),
	deviceId: z.string().min(10).optional()
});

export const PUT: RequestHandler = async ({ params, request }) => {
	await cleanupOldSessions();

	const session = await getSession(params.id);
	if (!session) error(404, 'Session not found');

	const result = answerSchema.safeParse(await request.json());
	if (!result.success) error(400, 'Invalid input');

	if (session.targetDeviceId && session.targetDeviceId !== result.data.deviceId) {
		error(403, 'This session is directed to another device');
	}

	await db
		.update(shareSessions)
		.set({
			answer: result.data.answer,
			peerName: result.data.peerName,
			guestDeviceId: result.data.deviceId
		})
		.where(eq(shareSessions.id, params.id));

	return json({ ok: true });
};

const patchSchema = z
	.object({
		approved: z.boolean().optional(),
		denied: z.boolean().optional(),
		offer: z.string().optional()
	})
	.refine(
		(data) => !(data.approved === true && data.denied === true),
		'Cannot set both approved and denied to true'
	);

export const PATCH: RequestHandler = async ({ params, request }) => {
	await cleanupOldSessions();

	const session = await getSession(params.id);
	if (!session) error(404, 'Session not found');

	const result = patchSchema.safeParse(await request.json());
	if (!result.success) error(400, 'Invalid input');

	await db
		.update(shareSessions)
		.set({
			...(result.data.approved !== undefined && { approved: result.data.approved }),
			...(result.data.denied !== undefined && { denied: result.data.denied }),
			...(result.data.offer !== undefined && {
				offer: result.data.offer,
				answer: null, // Clear old answer if offer changes
				approved: false,
				denied: false
			})
		})
		.where(eq(shareSessions.id, params.id));

	return json({ ok: true });
};
