import type { FeedFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';

type FeedModule = { metadata: FeedFrontmatter };

const modules = import.meta.glob<FeedModule>('/content/feed/*.md', { eager: true });

export const load: PageLoad = async () => {
	const entries = Object.entries(modules)
		.map(([path, mod]) => ({
			slug: path.split('/').pop()!.replace('.md', ''),
			...mod.metadata
		}))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { entries };
};
