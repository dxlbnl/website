<script lang="ts">
	import { page } from '$app/state';

	let {
		title = "Dexterlabs",
		description = "Software engineering, Eurorack hardware, and small web experiments from the lab.",
		image = '', // We will default this to our dynamic OG endpoint
		type = 'website',
		articleDate = undefined,
		articleAuthor = 'Dexter'
	}: {
		title?: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article' | 'product';
		articleDate?: string;
		articleAuthor?: string;
	} = $props();

	let url = $derived(page.url.origin + page.url.pathname);
	let relativeImage = $derived(image?.replace(page.url.origin, ''));
	let ogImage = $derived(`${page.url.origin}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}${relativeImage ? `&image=${relativeImage}` : ''}`);

	// Structured Data (JSON-LD)
	let jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': type === 'article' ? 'Article' : type === 'product' ? 'Product' : 'WebSite',
		url,
		name: title === 'Dexterlabs' ? 'Dexterlabs' : `${title} | Dexterlabs`,
		headline: title,
		description: description,
		image: ogImage,
		...(type === 'article' && articleDate ? { datePublished: articleDate } : {}),
		...(type === 'article' ? { author: { '@type': 'Person', name: articleAuthor } } : {})
	});
</script>

<svelte:head>
	<!-- Standard Meta Tags -->
	<title>{title === 'Dexterlabs' ? title : `${title} | Dexterlabs`}</title>
	<meta name="description" content={description} />
	<meta name="author" content={articleAuthor} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title === 'Dexterlabs' ? title : `${title} | Dexterlabs`} />
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
