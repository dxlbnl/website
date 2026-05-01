import { error, fail } from '@sveltejs/kit';
import { RESEND_API_KEY, RESEND_SEGMENT_ID, RESEND_FROM } from '$env/static/private';
import { Resend } from 'resend';
import { renderMailingEmail } from '$lib/email/render';
import { db } from '$lib/server/db';
import { emailOpens, mailingBroadcasts } from '$lib/server/db/schema';
import { count, eq } from 'drizzle-orm';
import { verifyAdminSession } from '$lib/utils/auth';
import type { Component } from 'svelte';
import type { MailingFrontmatter } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

type MailingModule = {
	default: Component;
	metadata: MailingFrontmatter;
};

const modules = import.meta.glob<MailingModule>('/content/mailings/*.md', { eager: true });

export const load: PageServerLoad = async ({ params, cookies }) => {
	const authed = await verifyAdminSession(cookies.get('admin_session'));
	if (!authed) return { authed: false as const };

	const entry = Object.entries(modules).find(([, mod]) => mod.metadata.slug === params.slug);
	if (!entry) throw error(404, `Mailing not found: ${params.slug}`);

	const [, mod] = entry;
	const emailHtml = renderMailingEmail(mod.metadata.title, mod.default, mod.metadata.date);

	const broadcasts = await db.select().from(mailingBroadcasts);
	const broadcast = broadcasts.find((b) => b.slug === params.slug);

	let opens = 0;
	if (broadcast) {
		const openRows = await db
			.select({ opens: count() })
			.from(emailOpens)
			.where(eq(emailOpens.broadcastId, broadcast.broadcastId));
		opens = openRows[0]?.opens ?? 0;
	}

	return {
		authed: true as const,
		mailing: mod.metadata,
		emailHtml,
		broadcast: broadcast
			? {
					broadcastId: broadcast.broadcastId,
					sentAt: broadcast.sentAt.toISOString(),
					recipientCount: broadcast.recipientCount
				}
			: null,
		opens
	};
};

export const actions: Actions = {
	send: async ({ params, cookies }) => {
		const slug = params.slug;

		if (!(await verifyAdminSession(cookies.get('admin_session'))))
			return fail(401, { error: 'Not authenticated' });

		const entry = Object.entries(modules).find(([, mod]) => mod.metadata.slug === slug);
		if (!entry) return fail(404, { error: `Mailing not found: ${slug}` });

		const [, mod] = entry;
		const emailHtml = renderMailingEmail(mod.metadata.title, mod.default, mod.metadata.date);

		const resend = new Resend(RESEND_API_KEY);

		const { data: contactsData } = await resend.contacts.list({
			segmentId: RESEND_SEGMENT_ID ?? ''
		});
		const recipientCount = contactsData?.data?.length ?? 0;

		const { data, error: resendError } = await resend.broadcasts.create({
			segmentId: RESEND_SEGMENT_ID ?? '',
			from: RESEND_FROM ?? 'DEXTERLABS <hello@dxlb.nl>',
			name: mod.metadata.title,
			subject: mod.metadata.subject,
			html: emailHtml
		});

		if (resendError || !data) {
			console.error('[admin/mailings/slug] broadcast create error', resendError);
			return fail(500, { error: 'Failed to create broadcast' });
		}

		const { error: sendError } = await resend.broadcasts.send(data.id);
		if (sendError) {
			console.error('[admin/mailings/slug] broadcast send error', sendError);
			return fail(500, { error: 'Broadcast created but failed to send' });
		}

		await db
			.insert(mailingBroadcasts)
			.values({ slug, broadcastId: data.id, recipientCount })
			.onConflictDoNothing();

		return { broadcastId: data.id };
	}
};
