import { describe, it, expect } from 'vitest';
import { ALL_TAGS, isTag } from './tags';

const frontmatter = import.meta.glob<{ metadata: { tags?: string[] } }>(
	['/content/notes/*/index.md', '/content/products/*.md', '/content/projects/*.md'],
	{ eager: true }
);

describe('content tag vocabulary', () => {
	it('has no duplicate tags', () => {
		expect(new Set(ALL_TAGS).size).toBe(ALL_TAGS.length);
	});

	for (const [path, mod] of Object.entries(frontmatter)) {
		it(`${path} uses only canonical tags`, () => {
			const unknown = (mod.metadata?.tags ?? []).filter((t) => !isTag(t));
			expect(unknown, `unknown tags: ${unknown.join(', ')}`).toEqual([]);
		});
	}
});
