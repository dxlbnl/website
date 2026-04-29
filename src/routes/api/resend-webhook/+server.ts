import { RESEND_WEBHOOK_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import { emailOpens } from '$lib/server/db/schema';

// Verifies a Svix-signed webhook (used by Resend) without the svix npm package.
// Algorithm: HMAC-SHA256 of "{svix-id}.{svix-timestamp}.{raw-body}" with the
// base64-decoded signing secret. The svix-signature header may contain multiple
// space-separated "v1,<base64>" entries; any match is sufficient.
async function verifySvixSignature(
	body: string,
	svixId: string,
	svixTimestamp: string,
	svixSignature: string,
	secret: string
): Promise<boolean> {
	const secretBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), (c) => c.charCodeAt(0));
	const key = await crypto.subtle.importKey(
		'raw',
		secretBytes,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const payload = `${svixId}.${svixTimestamp}.${body}`;
	const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
	const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
	return svixSignature.split(' ').some((s) => s === `v1,${computed}`);
}

export const POST = async ({ request }) => {
	const svixId = request.headers.get('svix-id') ?? '';
	const svixTimestamp = request.headers.get('svix-timestamp') ?? '';
	const svixSignature = request.headers.get('svix-signature') ?? '';
	const body = await request.text();

	const secret = RESEND_WEBHOOK_SECRET ?? '';
	if (!secret || !(await verifySvixSignature(body, svixId, svixTimestamp, svixSignature, secret))) {
		return new Response('Unauthorized', { status: 401 });
	}

	const event = JSON.parse(body) as { type: string; data: Record<string, unknown> };

	if (event.type === 'email.opened') {
		const { email_id, to, broadcast_id } = event.data as {
			email_id: string;
			to: string | string[];
			broadcast_id?: string;
		};
		await db
			.insert(emailOpens)
			.values({
				resendEmailId: email_id,
				broadcastId: broadcast_id ?? null,
				recipientEmail: Array.isArray(to) ? to[0] : to
			})
			.onConflictDoNothing();
	}

	return new Response('OK');
};
