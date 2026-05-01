<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import ImageCarousel from '$lib/ui/ImageCarousel.svelte';
	import { resolveLogImage } from '$lib/utils/image';
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import type { NoteFrontmatter, ProductFrontmatter } from '$lib/types';
	import { useProduct } from '$lib/utils/product.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import type { Region } from '$lib/utils/location';

	type Props = {
		data: {
			component: Component;
			metadata: NoteFrontmatter;
			product?: ProductFrontmatter;
			region: Region;
		};
	};
	let { data }: Props = $props();

	const images = $derived(
		(data.metadata.images ?? []).map((img: string) => resolveLogImage(img, page.params.slug ?? ''))
	);
</script>

<SEO
	title={data.metadata.title}
	description={data.metadata.lede}
	image={images[0]}
	type="article"
	articleDate={data.metadata.date}
/>

<div class="wrap">
	<article>
		<div class="eyebrow">
			// {data.metadata.kind ?? 'LOG'} · {data.metadata.date.split('T')[0]}
		</div>
		<h1>{data.metadata.title}</h1>
		{#if data.metadata.lede}<p class="lede">{data.metadata.lede}</p>{/if}

		{#if images.length > 0}
			<ImageCarousel {images} />
		{/if}

		<div class="body">
			<data.component />
		</div>

		{#if data.product}
			{@const pd = useProduct(
				() => data.product!,
				() => data.region
			)}
			{@const p = data.product}
			<a href="/catalogue/{p.id}/" class="product-cta">
				<div class="cta-body">
					<span class="cta-eyebrow">// THE HARDWARE</span>
					<span class="cta-name">{p.name}</span>
					<span class="cta-desc">{p.description}</span>
				</div>
				<span class="cta-link">{pd.cta} →</span>
			</a>
		{/if}
	</article>

	<div class="post-foot">
		<a href="/notes/" class="back">← BACK TO NOTES</a>
		<span class="signed">SIGNED / DEXTER</span>
	</div>

	<Signature />
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;
		container-type: inline-size;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}
	article {
		max-width: 68ch;
		margin: 0 auto;
		padding: 48px 0 40px;
	}
	.eyebrow {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		margin-bottom: 16px;
		text-transform: uppercase;
	}
	h1 {
		font-weight: 500;
		font-size: clamp(36px, 5vw, 56px);
		letter-spacing: -0.02em;
		line-height: 1.05;
		margin: 0 0 20px;
	}
	.lede {
		font-size: var(--t-lede);
		color: var(--ink-dim);
		line-height: 1.55;
		margin-bottom: 0;
	}
	.body {
		padding-top: 32px;
		font-size: 17px;
		line-height: 1.65;

		:global {
			h2 {
				font-weight: 500;
				font-size: 28px;
				letter-spacing: -0.01em;
				margin: 48px 0 8px;
				color: var(--ink);
			}
			h3 {
				font-weight: 500;
				font-size: 18px;
				letter-spacing: -0.01em;
				margin: 32px 0 6px;
				color: var(--ink);
			}
			p {
				margin-bottom: 20px;
				color: var(--ink);
			}
			a {
				border-bottom: 1px solid var(--rule-strong);
				transition: border-color 0.15s;
				&:hover {
					border-color: var(--amber);
				}
			}
			strong {
				font-weight: 500;
				color: var(--ink);
			}
			em {
				color: var(--ink-dim);
			}
			blockquote {
				margin: 28px 0;
				padding: 4px 0 4px 16px;
				border-left: 2px solid var(--amber);
				font-style: italic;
				color: var(--ink-dim);
				p {
					margin-bottom: 0;
				}
			}
			code {
				font-family: var(--mono);
				font-size: 13px;
				background: var(--bg-elev);
				padding: 1px 5px;
				border: 1px solid var(--rule);
				border-radius: 2px;
				color: var(--cyan);
			}
			pre {
				background: var(--bg-sunken);
				border: 1px solid var(--rule);
				padding: 16px 20px;
				overflow-x: auto;
				margin: 24px 0;
				line-height: 1.6;
				code {
					background: none;
					border: none;
					padding: 0;
					color: var(--ink-dim);
					font-size: 13px;
				}
			}
			ul,
			ol {
				padding-left: 20px;
				margin-bottom: 20px;
				color: var(--ink);
			}
			li {
				margin-bottom: 6px;
				line-height: 1.65;
			}
			ul li::marker {
				color: var(--amber);
			}
			ol li::marker {
				font-family: var(--mono);
				font-size: 13px;
				color: var(--ink-faint);
			}
			hr {
				border: none;
				border-top: 1px solid var(--rule);
				margin: 48px 0;
			}
			img {
				width: 100%;
				height: auto;
				display: block;
				border: 1px solid var(--rule);
				margin: 28px 0;
			}
			table {
				width: 100%;
				border-collapse: collapse;
				font-family: var(--mono);
				font-size: var(--t-mono);
				margin: 24px 0;
			}
			th {
				text-align: left;
				padding: 8px 0;
				border-bottom: 1px solid var(--rule-strong);
				color: var(--ink-faint);
				letter-spacing: 0.1em;
				text-transform: uppercase;
				font-weight: 500;
			}
			td {
				padding: 8px 0;
				border-bottom: 1px dashed var(--rule);
				color: var(--ink-dim);
			}
			td:first-child {
				width: 40%;
			}
			td:last-child {
				color: var(--ink);
			}
		}
	}
	.product-cta {
		max-width: 68ch;
		margin: 48px auto 0;
		border: 1px solid var(--amber);
		padding: 20px 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		text-decoration: none;
		transition: background 0.15s;
		&:hover {
			background: color-mix(in srgb, var(--amber) 6%, transparent);
		}
	}
	.cta-body {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.cta-eyebrow {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		text-transform: uppercase;
	}
	.cta-name {
		font-weight: 500;
		font-size: 20px;
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.cta-desc {
		font-size: 13px;
		color: var(--ink-dim);
		line-height: 1.4;
	}
	.cta-link {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--amber);
		white-space: nowrap;
		flex-shrink: 0;
	}
	.post-foot {
		max-width: 68ch;
		margin: 0 auto;
		border-top: 1px solid var(--rule);
		padding-top: 24px;
		display: flex;
		justify-content: space-between;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.back {
		color: var(--amber);
	}
	.back:hover {
		color: var(--ink);
	}
	.signed {
		color: var(--ink-faint);
	}
</style>
