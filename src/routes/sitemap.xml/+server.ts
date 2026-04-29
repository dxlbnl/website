export const GET = async ({ url }) => {
	const domain = url.origin;

	// Load products
	const productModules = import.meta.glob('/content/products/*.md', { eager: true });
	const products = Object.keys(productModules).map((path) => {
		const id = path.split('/').at(-1)?.replace('.md', '');
		return `${domain}/catalogue/${id}/`;
	});

	// Load notes
	const noteModules = import.meta.glob('/content/notes/*/index.md', { eager: true });
	const notes = Object.keys(noteModules).map((path) => {
		const slug = path.split('/').at(-2);
		return `${domain}/notes/${slug}/`;
	});

	// Load legal pages
	const legalModules = import.meta.glob('/content/legal/*.md', { eager: true });
	const legalPages = Object.keys(legalModules).map((path) => {
		const slug = path.split('/').at(-1)?.replace('.md', '');
		return `${domain}/legal/${slug}/`;
	});

	const staticPages = [
		`${domain}/`,
		`${domain}/catalogue/`,
		`${domain}/notes/`,
		`${domain}/about/`,
		`${domain}/contact/`,
		`${domain}/legal/`
	];

	const allPages = [...staticPages, ...products, ...notes, ...legalPages];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		(page) => `  <url>
    <loc>${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === `${domain}/` ? '1.0' : '0.7'}</priority>
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
