import { PUBLIC_SITE_URL } from '$env/static/public';

export function emailImgUrl(path: string, width = 600, quality = 85): string {
	if (import.meta.env.DEV) return path;
	const abs = path.startsWith('http') ? path : `${PUBLIC_SITE_URL}${path}`;
	return `${PUBLIC_SITE_URL}/_vercel/image?url=${encodeURIComponent(abs)}&w=${width}&q=${quality}`;
}
