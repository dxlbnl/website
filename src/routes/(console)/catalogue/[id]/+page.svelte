<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import type { Component } from 'svelte';
	import type { ProductFrontmatter } from '$lib/types';
	import { resolveProductImage, vercelImg, vercelSrcset } from '$lib/utils/image';
	import SEO from '$lib/ui/SEO.svelte';
	import Pricebox from './Pricebox.svelte';
	import type { Region } from '$lib/utils/location';
	import { resolve } from '$app/paths';

	type Props = { data: { component: Component; product: ProductFrontmatter; region: Region } };
	let { data }: Props = $props();

	let activeIndex = $state(0);

	const galleryImages = $derived(
		data.product.images?.length
			? data.product.images.map((img) => resolveProductImage(img, data.product.id))
			: data.product.image
				? [resolveProductImage(data.product.image, data.product.id)]
				: []
	);
</script>

<SEO
	title={data.product.name}
	description={data.product.description}
	image={galleryImages[0]}
	type="product"
	product={data.product}
/>

{#if data.product.status === 'coming-soon'}
	<div class="preorder-banner">
		<div class="banner-inner">
			<span class="banner-label">// PREORDER</span>
			<span class="banner-sep">·</span>
			<span class="banner-text">Early access pricing — lock in this price before launch</span>
		</div>
	</div>
{/if}

<div class="wrap">
	<div class="back-row">
		<a href={resolve('/catalogue/')} class="btn-back">← RETURN TO CATALOGUE</a>
	</div>

	<div class="grid" class:no-image={!galleryImages.length}>
		<div class="img-col">
			{#if galleryImages.length}
				<div class="hero-img">
					<img
						src={galleryImages[activeIndex]}
						srcset={vercelSrcset(galleryImages[activeIndex], [512, 768, 960, 1280, 1920])}
						sizes="(max-width: 1000px) calc(100vw - 32px), calc(53vw - 60px)"
						alt={data.product.name}
						loading="eager"
						fetchpriority="high"
					/>
				</div>
				{#if galleryImages.length > 1}
					<div class="thumbs">
						{#each galleryImages as src, i (src)}
							<button
								class="thumb"
								class:active={i === activeIndex}
								aria-label="View image {i + 1} of {galleryImages.length}"
								aria-pressed={i === activeIndex}
								onclick={() => (activeIndex = i)}
							>
								<img src={vercelImg(src, 128)} alt="" />
							</button>
						{/each}
					</div>
				{/if}
			{/if}
			<div class="content">
				<data.component />
			</div>
		</div>

		<div class="side">
			<div class="side-top">
				<div class="sub">
					{data.product.id.toUpperCase()} · {data.product.category.toUpperCase()}
				</div>
				<h1>{data.product.name}</h1>
				{#if data.product.tags?.length}
					<div class="tags">
						{#each data.product.tags as tag (tag)}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
				<p class="lede">{data.product.description}</p>
			</div>

			<div class="side-bottom">
				{#if data.product.specs}
					<div class="specs-label">// QUICK SPECS</div>
					<table class="specs">
						<tbody>
							{#each Object.entries(data.product.specs) as [key, val] (key)}
								<tr><td>{key}</td><td>{val}</td></tr>
							{/each}
						</tbody>
					</table>
				{/if}

				<Pricebox product={data.product} region={data.region} />
			</div>
		</div>
	</div>

	<Signature />
</div>

<style>
	.preorder-banner {
		position: sticky;
		top: 0;
		z-index: 10;
		background-color: color-mix(in srgb, var(--amber) 18%, var(--bg));
		background-image: repeating-linear-gradient(
			-45deg,
			transparent 0,
			transparent 10px,
			color-mix(in srgb, var(--amber) 25%, transparent) 10px,
			color-mix(in srgb, var(--amber) 25%, transparent) 20px
		);
	}
	.banner-inner {
		max-width: 1440px;
		margin: 0 auto;
		padding: 10px 32px;
		display: flex;
		align-items: center;
		gap: 12px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		font-weight: 800;
		letter-spacing: 0.08em;

		@media (max-width: 720px) {
			padding: 8px 16px;
		}
	}
	.banner-label {
		color: var(--amber);
		font-weight: bold;
		white-space: nowrap;
		flex-shrink: 0;
		text-shadow:
			0 0 3px var(--bg),
			0 0 3px var(--bg),
			0 0 3px var(--bg);
	}
	.banner-sep {
		color: var(--ink-dim);
		flex-shrink: 0;
		text-shadow:
			0 0 3px var(--bg),
			0 0 3px var(--bg),
			0 0 3px var(--bg);
	}
	.banner-text {
		color: var(--ink);
		text-transform: uppercase;
		text-shadow:
			0 0 3px var(--bg),
			0 0 3px var(--bg),
			0 0 3px var(--bg);
	}
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;
		container-type: inline-size;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}
	.back-row {
		padding: 32px 0 0;
	}
	.grid {
		display: flex;
		align-items: flex-start;
		gap: 48px;
		padding: 24px 0 40px;

		@container (max-width: 900px) {
			flex-direction: column;
			align-items: stretch;
			gap: 24px;
		}
	}
	.grid.no-image {
		max-width: 68ch;
	}
	.img-col {
		flex: 1.1;
		display: flex;
		flex-direction: column;

		@container (max-width: 900px) {
			display: contents;
		}
	}
	.side {
		flex: 1;

		@container (max-width: 900px) {
			display: contents;
		}
	}
	.hero-img,
	.thumbs {
		@container (max-width: 900px) {
			order: 2;
		}
	}
	.side-top {
		@container (max-width: 900px) {
			order: 1;
		}
	}
	.side-bottom {
		@container (max-width: 900px) {
			max-width: 500px;
			order: 3;
		}
	}
	.content {
		@container (max-width: 900px) {
			order: 4;
		}
	}
	.hero-img {
		aspect-ratio: 3 / 2;
		border: 1px solid var(--rule);
		overflow: hidden;
	}
	.hero-img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.thumbs {
		display: flex;
		gap: 6px;
		margin-top: 6px;
		overflow-x: auto;
	}
	.thumb {
		flex-shrink: 0;
		width: 72px;
		height: 72px;
		border: 1px solid var(--rule);
		overflow: hidden;
		padding: 0;
		cursor: pointer;
		transition: border-color 0.1s;
	}
	.thumb.active {
		border-color: var(--amber);
	}
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.sub {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	h1 {
		font-weight: 500;
		font-size: var(--t-title);
		letter-spacing: -0.02em;
		margin: 8px 0 6px;
		line-height: 1;
	}
	.tags {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-top: 12px;
	}
	.tag {
		display: inline-block;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-dim);
		padding: 2px 6px;
		border: 1px solid var(--rule);
	}
	.lede {
		font-size: var(--t-body);
		line-height: 1.55;
		color: var(--ink-dim);
		margin: 24px 0;
		max-width: 48ch;
	}
	.specs-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		text-transform: uppercase;
		margin-bottom: 4px;
	}
	.specs {
		width: 100%;
		border-collapse: collapse;
		margin-top: 4px;
		font-family: var(--mono);
		font-size: var(--t-mono);
	}
	.specs td {
		padding: 8px 0;
		border-bottom: 1px dashed var(--rule);
	}
	.specs td:first-child {
		color: var(--ink-dim);
		width: 40%;
	}
	.specs td:last-child {
		color: var(--ink);
		text-align: right;
	}
	.content {
		max-width: 68ch;
		padding: 40px 0;
		font-size: var(--t-body);
		line-height: 1.65;
		border-top: 1px solid var(--rule);

		:global {
			h2 {
				font-weight: 500;
				font-size: var(--t-h3);
				margin: 32px 0 8px;
				letter-spacing: -0.01em;
			}
			p {
				margin-bottom: 16px;
				color: var(--ink-dim);
			}
			ul,
			ol {
				padding-left: 20px;
				margin-bottom: 16px;
				color: var(--ink-dim);
			}
			li {
				margin-bottom: 4px;
			}
			ul li::marker {
				color: var(--amber);
			}
			strong {
				color: var(--ink);
				font-weight: 500;
			}
			em {
				color: var(--ink-dim);
			}
			code {
				font-family: var(--mono);
				font-size: var(--t-mono);
				background: var(--bg-elev);
				padding: 1px 5px;
				border: 1px solid var(--rule);
				border-radius: 2px;
			}
			table {
				width: 100%;
				border-collapse: collapse;
				font-family: var(--mono);
				font-size: var(--t-mono);
				margin-bottom: 24px;
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
				text-align: left;
			}
			td:last-child {
				color: var(--ink);
			}
			hr {
				border: none;
				border-top: 1px solid var(--rule);
				margin: 40px 0;
			}
		}
	}
</style>
