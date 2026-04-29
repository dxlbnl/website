import { fail } from '@sveltejs/kit';
import { RESEND_API_KEY, RESEND_SEGMENT_ID, RESEND_FROM } from '$env/static/private';
import { Resend } from 'resend';
import { render } from 'svelte/server';
import { renderMailingEmail } from '$lib/email/render';
import { db } from '$lib/server/db';
import { emailOpens, mailingBroadcasts } from '$lib/server/db/schema';
import { count } from 'drizzle-orm';
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

export const load: PageServerLoad = async ({ cookies }) => {
	const authed = await verifyAdminSession(cookies.get('admin_session'));
	if (!authed) return { authed: false as const, mailings: [], opensMap: {} };

	const mailings = Object.entries(modules)
		.map(([path, mod]) => ({ path, ...mod.metadata }))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const broadcasts = await db.select().from(mailingBroadcasts);
	const broadcastsMap: Record<
		string,
		{ broadcastId: string; sentAt: string; recipientCount: number }
	> = Object.fromEntries(
		broadcasts.map((b) => [
			b.slug,
			{
				broadcastId: b.broadcastId,
				sentAt: b.sentAt.toISOString(),
				recipientCount: b.recipientCount
			}
		])
	);

	const broadcastIdToSlug = Object.fromEntries(broadcasts.map((b) => [b.broadcastId, b.slug]));

	const openRows = await db
		.select({ broadcastId: emailOpens.broadcastId, opens: count() })
		.from(emailOpens)
		.groupBy(emailOpens.broadcastId);

	const opensMap: Record<string, { opens: number; total: number }> = {};
	for (const row of openRows) {
		if (!row.broadcastId) continue;
		const slug = broadcastIdToSlug[row.broadcastId];
		if (slug) {
			opensMap[slug] = {
				opens: row.opens,
				total: broadcastsMap[slug]?.recipientCount ?? 0
			};
		}
	}

	return { authed: true as const, mailings, opensMap, broadcastsMap };
};

export const actions: Actions = {
	send: async ({ request, cookies }) => {
		const formData = await request.formData();
		const slug = (formData.get('slug') as string) || '';

		if (!(await verifyAdminSession(cookies.get('admin_session'))))
			return fail(401, { error: 'Not authenticated', slug });
		if (!slug) return fail(400, { error: 'Missing slug', slug });

		const entry = Object.entries(modules).find(([, mod]) => mod.metadata.slug === slug);
		if (!entry) return fail(404, { error: `Mailing not found: ${slug}`, slug });

		const [, mod] = entry;
		const { body: bodyHtml } = render(mod.default, {});
		const emailHtml = renderMailingEmail(mod.metadata.title, bodyHtml, mod.metadata.date);

		const resend = new Resend(RESEND_API_KEY);

		// Get recipient count before sending
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
			console.error('[admin/mailings] broadcast create error', resendError);
			return fail(500, { error: 'Failed to create broadcast', slug });
		}

		const { error: sendError } = await resend.broadcasts.send(data.id);
		if (sendError) {
			console.error('[admin/mailings] broadcast send error', sendError);
			return fail(500, { error: 'Broadcast created but failed to send', slug });
		}

		await db
			.insert(mailingBroadcasts)
			.values({ slug, broadcastId: data.id, recipientCount })
			.onConflictDoNothing();

		return { broadcastId: data.id, slug };
	}
};
