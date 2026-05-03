import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_SEGMENT_ID } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const schema = z.object({
	email: z.email(),
	firstName: z.string().max(255).optional()
});

export const POST: RequestHandler = async ({ request }) => {
	const result = schema.safeParse(await request.json());
	if (!result.success) error(400, 'Invalid input');
	const { email, firstName } = result.data;

	const resend = new Resend(RESEND_API_KEY);

	const { error: resendError } = await resend.contacts.create({
		email,
		firstName: firstName ?? undefined,
		unsubscribed: false,
		...(RESEND_SEGMENT_ID ? { segments: [{ id: RESEND_SEGMENT_ID }] } : {})
	});

	if (resendError) {
		console.error('[subscribe] Resend error', resendError);
		error(500, 'Failed to subscribe');
	}

	return json({ ok: true });
};
