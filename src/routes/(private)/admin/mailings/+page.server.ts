import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { Resend } from 'resend';
import { render } from 'svelte/server';
import { renderMailingEmail } from '$lib/email/render';
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
	const authed = cookies.get('admin_session') === env.ADMIN_TOKEN;
	if (!authed) return { authed: false as const, mailings: [] };

	const mailings = Object.entries(modules)
		.map(([path, mod]) => ({ path, ...mod.metadata }))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { authed: true as const, mailings };
};

export const actions: Actions = {
	send: async ({ request, cookies }) => {
		if (cookies.get('admin_session') !== env.ADMIN_TOKEN) return fail(401);

		const slug = (await request.formData()).get('slug') as string;
		if (!slug) return fail(400, { error: 'Missing slug' });

		const entry = Object.entries(modules).find(([, mod]) => mod.metadata.slug === slug);
		if (!entry) return fail(404, { error: `Mailing not found: ${slug}` });

		const [, mod] = entry;
		const { body: bodyHtml } = render(mod.default, {});
		const emailHtml = renderMailingEmail(mod.metadata.title, bodyHtml, mod.metadata.date);

		const resend = new Resend(env.RESEND_API_KEY);

		const { data, error: resendError } = await resend.broadcasts.create({
			segmentId: env.RESEND_SEGMENT_ID ?? '',
			from: env.RESEND_FROM ?? 'DEXTERLABS <hello@dxlb.nl>',
			name: mod.metadata.title,
			subject: mod.metadata.subject,
			html: emailHtml
		});

		if (resendError || !data) {
			console.error('[admin/mailings] broadcast create error', resendError);
			return fail(500, { error: 'Failed to create broadcast' });
		}

		const { error: sendError } = await resend.broadcasts.send(data.id);
		if (sendError) {
			console.error('[admin/mailings] broadcast send error', sendError);
			return fail(500, { error: 'Broadcast created but failed to send' });
		}

		return { broadcastId: data.id, slug };
	}
};
