import { db } from '$lib/server/db';
import { pageviews } from '$lib/server/db/schema';

export const handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	if (
		response.headers.get('content-type')?.includes('text/html') &&
		!event.url.pathname.startsWith('/api/')
	) {
		db.insert(pageviews)
			.values({
				path: event.url.pathname,
				referrer: event.request.headers.get('referer') ?? null
			})
			.execute()
			.catch(() => {});
	}

	return response;
};
