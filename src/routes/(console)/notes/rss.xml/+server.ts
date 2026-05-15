import type { NoteFrontmatter } from '$lib/types';

const noteModules = import.meta.glob<{ metadata: NoteFrontmatter }>('/content/notes/*/index.md', {
	eager: true
});

const escapeXml = (s: string) =>
	s.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
			case "'":
				return '&apos;';
			default:
				return '&quot;';
		}
	});

export const prerender = true;

export const GET = async ({ url }) => {
	const domain = url.origin;

	const notes = Object.entries(noteModules)
		.map(([path, mod]) => ({ slug: path.split('/').at(-2)!, ...mod.metadata }))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const items = notes
		.map((note) => {
			const link = `${domain}/notes/${note.slug}/`;
			const categories = (note.tags ?? [])
				.map((t) => `      <category>${escapeXml(t)}</category>`)
				.join('\n');
			return `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(note.date).toUTCString()}</pubDate>${
				note.lede ? `\n      <description>${escapeXml(note.lede)}</description>` : ''
			}${categories ? `\n${categories}` : ''}
    </item>`;
		})
		.join('\n');

	const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dexterlabs — Notes</title>
    <link>${domain}/notes/</link>
    <atom:link href="${domain}/notes/rss.xml" rel="self" type="application/rss+xml" />
    <description>Build logs, post-mortems, and longer writing from the lab.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

	return new Response(feed, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
