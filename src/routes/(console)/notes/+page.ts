import type { NoteFrontmatter } from '$lib/types';
import type { PageLoad } from './$types';

type NoteModule = { metadata: NoteFrontmatter };

const modules = import.meta.glob<NoteModule>('/content/notes/*/index.md', { eager: true });

export const load: PageLoad = async () => {
	const entries = Object.entries(modules)
		.map(([path, mod]) => ({
			slug: path.split('/').at(-2)!,
			...mod.metadata
		}))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { entries };
};
