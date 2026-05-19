import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { mailingBroadcasts } from '$lib/server/db/schema';
import { renderMailingEmail } from '$lib/email/render';
import type { Component } from 'svelte';
import type { MailingFrontmatter } from '$lib/types';
import type { EntryGenerator, PageServerLoad } from './$types';

type MailingModule = { default: Component; metadata: MailingFrontmatter };

const modules = import.meta.glob<MailingModule>('/content/mailings/*.md', { eager: true });

export const prerender = true;

export const entries: EntryGenerator = async () => {
	const broadcasts = await db.select({ slug: mailingBroadcasts.slug }).from(mailingBroadcasts);
	return broadcasts.map((b) => ({ slug: b.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const [broadcast] = await db
		.select()
		.from(mailingBroadcasts)
		.where(eq(mailingBroadcasts.slug, params.slug));
	if (!broadcast) throw error(404, `Mailing not broadcast yet: ${params.slug}`);

	const found = Object.values(modules).find((mod) => mod.metadata?.slug === params.slug);
	if (!found) throw error(404, `Mailing not found: ${params.slug}`);

	const emailHtml = renderMailingEmail(
		found.metadata.title,
		found.default,
		found.metadata.date,
		found.metadata.unsubscribeMessage
	);

	return { emailHtml, mailing: found.metadata };
};
