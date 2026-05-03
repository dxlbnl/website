import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { shareSessions } from '$lib/server/db/schema';
import { eq, lt } from 'drizzle-orm';
import type { RequestHandler } from './$types';

async function cleanupOldSessions() {
	const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
	await db.delete(shareSessions).where(lt(shareSessions.createdAt, tenMinutesAgo));
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
	deviceId: z.string().uuid().optional()
});

export const PUT: RequestHandler = async ({ params, request }) => {
	await cleanupOldSessions();

	const session = await getSession(params.id);
	if (!session) error(404, 'Session not found');
	if (session.answer) error(409, 'Answer already submitted');

	const result = answerSchema.safeParse(await request.json());
	if (!result.success) error(400, 'Invalid input');

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
		denied: z.boolean().optional()
	})
	.refine(
		(data) => !(data.approved === true && data.denied === true),
		'Cannot set both approved and denied to true'
	);

export const PATCH: RequestHandler = async ({ params, request }) => {
	await cleanupOldSessions();

	const session = await getSession(params.id);
	if (!session) error(404, 'Session not found');
	if (!session.answer) error(400, 'No answer to approve');

	const result = patchSchema.safeParse(await request.json());
	if (!result.success) error(400, 'Invalid input');

	await db
		.update(shareSessions)
		.set({
			...(result.data.approved !== undefined && { approved: result.data.approved }),
			...(result.data.denied !== undefined && { denied: result.data.denied })
		})
		.where(eq(shareSessions.id, params.id));

	return json({ ok: true });
};
