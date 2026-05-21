import { building } from '$app/environment';
import { db } from '$lib/server/db';
import { pageviews } from '$lib/server/db/schema';
import { parseDeviceType, parseOs, parseBrowser, computeVisitorHash } from '$lib/server/analytics';
import { VISITOR_HASH_SALT } from '$env/static/private';

export const handle = async ({ event, resolve }) => {
  const palette = event.cookies.get('dxlb-palette') ?? 'phosphor';

  // Set sid before resolve — cookies cannot be set after the response is generated
  const existingSid = event.cookies.get('sid');
  const sessionId = existingSid ?? crypto.randomUUID();
  if (!existingSid) {
    event.cookies.set('sid', sessionId, { httpOnly: true, sameSite: 'lax', path: '/' });
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html', `<html data-palette="${palette}"`),
  });

  // Add security headers
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (
    !building &&
    response.headers.get('content-type')?.includes('text/html') &&
    !event.url.pathname.startsWith('/api/')
  ) {
    const rawReferrer = event.request.headers.get('referer');
    const referrer = rawReferrer
      ? (() => {
          try {
            const u = new URL(rawReferrer);
            return u.origin + u.pathname;
          } catch {
            return null;
          }
        })()
      : null;

    const ua = event.request.headers.get('user-agent');
    const salt = VISITOR_HASH_SALT || 'dxlb-default-salt';
    const today = new Date().toISOString().slice(0, 10);
    const visitorHash = await computeVisitorHash(event.getClientAddress(), ua ?? '', today, salt);

    const country = event.request.headers.get('x-vercel-ip-country');
    const city = event.request.headers.get('x-vercel-ip-city');

    const deviceType = parseDeviceType(ua);
    const os = parseOs(ua);
    const browser = parseBrowser(ua);

    db.insert(pageviews)
      .values({
        path: event.url.pathname,
        referrer,
        sessionId,
        visitorHash,
        country,
        city,
        deviceType,
        os,
        browser,
      })
      .execute()
      .catch(() => {});
  }

  return response;
};
