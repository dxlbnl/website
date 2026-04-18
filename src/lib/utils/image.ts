/**
 * Resolves a relative media path from a log entry to its optimized static path.
 * Example: 'media/photo.png' -> '/images/repository/log-slug/photo.webp'
 */
export function resolveLogImage(path: string, slug: string): string {
	if (!path || !slug) return path;
	
	if (path.startsWith('media/') || path.startsWith('./media/')) {
		const filename = path.split('/').pop()?.split('.')[0];
		return `/images/repository/${slug}/${filename}.webp`;
	}
	
	return path;
}
