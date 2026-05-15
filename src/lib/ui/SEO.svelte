<script lang="ts">
	import { PUBLIC_SITE_URL, PUBLIC_COUNTRIES_EU, PUBLIC_COUNTRIES_WORLD } from '$env/static/public';
	import { page } from '$app/state';
	import type { ProductFrontmatter } from '$lib/types';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let {
		title = 'Dexterlabs',
		description = 'A one-person engineering lab. Eurorack modules, software experiments, and bench notes from Delft.',
		image = '', // We will default this to our dynamic OG endpoint
		type = 'website',
		articleDate = undefined,
		articleAuthor = 'Dexter',
		product = undefined,
		tags = undefined,
		noindex = false
	}: {
		title?: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article' | 'product';
		articleDate?: string;
		articleAuthor?: string;
		product?: ProductFrontmatter;
		tags?: string[];
		noindex?: boolean;
	} = $props();

	const siteOrigin = PUBLIC_SITE_URL;
	let origin = $derived(
		page.url.origin === 'http://sveltekit-prerender' ? siteOrigin : page.url.origin
	);
	let url = $derived(origin + page.url.pathname);
	let relativeImage = $derived(image?.replace(page.url.origin, ''));
	let fullTitle = $derived(title === 'Dexterlabs' ? title : `${title} | Dexterlabs`);
	let cta = $derived.by(() => {
		if (product) {
			return product.status === 'available'
				? 'Buy Now'
				: product.status === 'coming-soon'
					? 'Preorder Now'
					: 'Sold Out';
		}
		if (type === 'article') {
			return 'Read Now';
		}
		return '';
	});
	let ogImage = $derived.by(() => {
		const params = new SvelteURLSearchParams({
			title,
			subtitle: description
		});
		if (relativeImage) params.set('image', relativeImage);
		if (cta) params.set('cta', cta);
		return `${origin}/api/og?${params}`;
	});

	// Structured Data (JSON-LD)
	function buildJsonLd() {
		const base = {
			'@context': 'https://schema.org',
			url,
			name: title,
			description,
			image: ogImage
		};

		if (page.url.pathname === '/') {
			return {
				'@context': 'https://schema.org',
				'@graph': [
					{ '@type': 'WebSite', url, name: title, description },
					{
						'@type': 'Organization',
						'@id': `${origin}/#org`,
						name: 'Dexterlabs',
						url: origin,
						logo: `${origin}/logo.png`,
						description,
						address: {
							'@type': 'PostalAddress',
							addressLocality: 'Delft',
							addressCountry: 'NL'
						}
					},
					{
						'@type': 'Person',
						'@id': `${origin}/#dexter`,
						name: 'Dexter',
						url: origin,
						worksFor: { '@id': `${origin}/#org` }
					}
				]
			};
		}

		if (type === 'article') {
			return {
				...base,
				'@type': 'Article',
				headline: title,
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

			// Build images array
			const productImages = product.images
				? product.images.map((img) =>
						img.startsWith('http') ? img : `${origin}/${img.replace(/^\//, '')}`
					)
				: [ogImage];

			return {
				...base,
				'@type': 'Product',
				brand: { '@type': 'Brand', name: 'Dexterlabs' },
				sku: product.id,
				mpn: product.id,
				image: productImages,
				offers: {
					'@type': 'Offer',
					price: (product.priceIncl / 100).toFixed(2),
					priceCurrency: 'EUR',
					availability,
					url,
					priceValidUntil: '2026-12-31',
					itemCondition: 'https://schema.org/NewCondition',
					shippingDetails: [
						{
							'@type': 'OfferShippingDetails',
							shippingRate: {
								'@type': 'MonetaryAmount',
								value: 8,
								currency: 'EUR'
							},
							shippingDestination: {
								'@type': 'DefinedRegion',
								addressCountry: 'NL'
							},
							deliveryTime: {
								'@type': 'ShippingDeliveryTime',
								handlingTime: {
									'@type': 'QuantitativeValue',
									minValue: 1,
									maxValue: 2,
									unitCode: 'd'
								},
								transitTime: {
									'@type': 'QuantitativeValue',
									minValue: 1,
									maxValue: 3,
									unitCode: 'd'
								}
							}
						},
						{
							'@type': 'OfferShippingDetails',
							shippingRate: {
								'@type': 'MonetaryAmount',
								value: 12,
								currency: 'EUR'
							},
							shippingDestination: {
								'@type': 'DefinedRegion',
								addressCountry: PUBLIC_COUNTRIES_EU.split(',')
							},
							deliveryTime: {
								'@type': 'ShippingDeliveryTime',
								handlingTime: {
									'@type': 'QuantitativeValue',
									minValue: 1,
									maxValue: 2,
									unitCode: 'd'
								},
								transitTime: {
									'@type': 'QuantitativeValue',
									minValue: 3,
									maxValue: 7,
									unitCode: 'd'
								}
							}
						},
						{
							'@type': 'OfferShippingDetails',
							shippingRate: {
								'@type': 'MonetaryAmount',
								value: 20,
								currency: 'EUR'
							},
							shippingDestination: {
								'@type': 'DefinedRegion',
								addressCountry: PUBLIC_COUNTRIES_WORLD.split(',')
							},
							deliveryTime: {
								'@type': 'ShippingDeliveryTime',
								handlingTime: {
									'@type': 'QuantitativeValue',
									minValue: 1,
									maxValue: 2,
									unitCode: 'd'
								},
								transitTime: {
									'@type': 'QuantitativeValue',
									minValue: 7,
									maxValue: 21,
									unitCode: 'd'
								}
							}
						}
					],
					hasMerchantReturnPolicy: {
						'@type': 'MerchantReturnPolicy',
						applicableCountry: 'NL',
						returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnPeriod',
						merchantReturnDays: 14,
						returnMethod: 'https://schema.org/ReturnByMail',
						returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility'
					}
				}
			};
		}

		return { ...base, '@type': 'WebSite' };
	}

	let jsonLd = $derived(JSON.stringify(buildJsonLd()));
	let jsonLdHtml = $derived(`<script type="application/ld+json">${jsonLd}</${'script'}>`);
</script>

<svelte:head>
	<!-- Standard Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta name="author" content={articleAuthor} />
	{#if tags && tags.length > 0}
		<meta name="keywords" content={tags.join(', ')} />
	{/if}
	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:locale" content="en_US" />
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
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdHtml}
</svelte:head>
