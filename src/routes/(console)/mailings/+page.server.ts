import { db } from '$lib/server/db';
import { mailingBroadcasts } from '$lib/server/db/schema';
import type { MailingFrontmatter } from '$lib/types';
import type { PageServerLoad } from './$types';

type MailingModule = { metadata: MailingFrontmatter };

const modules = import.meta.glob<MailingModule>('/content/mailings/*.md', { eager: true });

export const prerender = true;

export const load: PageServerLoad = async () => {
	const broadcasts = await db.select({ slug: mailingBroadcasts.slug }).from(mailingBroadcasts);
	const broadcastSlugs = new Set(broadcasts.map((b) => b.slug));

	const entries = Object.values(modules)
		.map((mod) => mod.metadata)
		.filter((m) => broadcastSlugs.has(m.slug))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { entries };
};
