import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { mailingBroadcasts } from '$lib/server/db/schema';
import type { EntryGenerator, PageServerLoad } from './$types';

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
	return {};
};
