import type { NoteFrontmatter, ProjectFrontmatter, LegalFrontmatter } from '$lib/types';

type SitemapEntry = { loc: string; lastmod?: string };

const noteModules = import.meta.glob<{ metadata: NoteFrontmatter }>('/content/notes/*/index.md', {
	eager: true
});
const projectModules = import.meta.glob<{ metadata: ProjectFrontmatter }>(
	'/content/projects/*.md',
	{ eager: true }
);
const productModules = import.meta.glob('/content/products/*.md', { eager: true });
const legalModules = import.meta.glob<{ metadata: LegalFrontmatter }>('/content/legal/*.md', {
	eager: true
});

const isoDate = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : undefined);

export const GET = async ({ url }) => {
	const domain = url.origin;

	const products: SitemapEntry[] = Object.keys(productModules).map((path) => ({
		loc: `${domain}/catalogue/${path.split('/').at(-1)?.replace('.md', '')}/`
	}));

	const projects: SitemapEntry[] = Object.entries(projectModules).map(([path, mod]) => ({
		loc: `${domain}/projects/${path.split('/').at(-1)?.replace('.md', '')}/`,
		lastmod: isoDate(mod.metadata.date)
	}));

	const notes: SitemapEntry[] = Object.entries(noteModules).map(([path, mod]) => ({
		loc: `${domain}/notes/${path.split('/').at(-2)}/`,
		lastmod: isoDate(mod.metadata.date)
	}));

	const legalPages: SitemapEntry[] = Object.entries(legalModules).map(([path, mod]) => ({
		loc: `${domain}/legal/${path.split('/').at(-1)?.replace('.md', '')}/`,
		lastmod: isoDate(mod.metadata.lastUpdated)
	}));

	const staticPages: SitemapEntry[] = [
		`${domain}/`,
		`${domain}/catalogue/`,
		`${domain}/projects/`,
		`${domain}/notes/`,
		`${domain}/about/`,
		`${domain}/contact/`,
		`${domain}/legal/`
	].map((loc) => ({ loc }));

	const allPages = [...staticPages, ...products, ...projects, ...notes, ...legalPages];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		({ loc, lastmod }) => `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>${loc === `${domain}/` ? '1.0' : '0.7'}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
