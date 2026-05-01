import { db } from '$lib/server/db';
import { pageviews } from '$lib/server/db/schema';

export const handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Add security headers
	response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

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
