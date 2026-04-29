import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_SEGMENT_ID } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { email, firstName } = await request.json();

	if (!email || typeof email !== 'string' || !email.includes('@')) {
		error(400, 'Invalid email');
	}

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
