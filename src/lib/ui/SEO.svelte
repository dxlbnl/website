<script lang="ts">
	import { page } from '$app/state';
	import type { ProductFrontmatter } from '$lib/types';

	let {
		title = 'Dexterlabs',
		description = 'Software engineering, Eurorack hardware, and small web experiments from the lab.',
		image = '', // We will default this to our dynamic OG endpoint
		type = 'website',
		articleDate = undefined,
		articleAuthor = 'Dexter',
		product = undefined
	}: {
		title?: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article' | 'product';
		articleDate?: string;
		articleAuthor?: string;
		product?: ProductFrontmatter;
	} = $props();

	let url = $derived(page.url.origin + page.url.pathname);
	let relativeImage = $derived(image?.replace(page.url.origin, ''));
	let fullTitle = $derived(title === 'Dexterlabs' ? title : `${title} | Dexterlabs`);
	let ogImage = $derived(
		`${page.url.origin}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}${relativeImage ? `&image=${relativeImage}` : ''}`
	);

	// Structured Data (JSON-LD)
	function buildJsonLd() {
		const base = {
			'@context': 'https://schema.org',
			'@type': type === 'article' ? 'Article' : type === 'product' ? 'Product' : 'WebSite',
			url,
			name: fullTitle,
			headline: title,
			description,
			image: ogImage
		};

		if (type === 'article') {
			return {
				...base,
				author: { '@type': 'Person', name: articleAuthor },
				...(articleDate ? { datePublished: articleDate } : {})
			};
		}

		if (type === 'product' && product) {
			const availability =
				product.status === 'available'
					? 'https://schema.org/InStock'
					: product.status === 'coming-soon'
						? 'https://schema.org/PreOrder'
						: 'https://schema.org/OutOfStock';

			return {
				...base,
				brand: { '@type': 'Brand', name: 'Dexterlabs' },
				sku: product.id,
				mpn: product.id,
				offers: {
					'@type': 'Offer',
					price: product.priceIncl,
					priceCurrency: 'EUR',
					availability,
					url
				}
			};
		}

		return base;
	}

	let jsonLd = $derived(buildJsonLd());
</script>

<svelte:head>
	<!-- Standard Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta name="author" content={articleAuthor} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:site_name" content="Dexterlabs" />
	{#if type === 'article' && articleDate}
		<meta property="article:published_time" content={articleDate} />
		<meta property="article:author" content={articleAuthor} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={url} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>
