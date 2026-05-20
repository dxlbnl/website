<script lang="ts">
	import {
		Container,
		Inline,
		Stack,
		Heading,
		Text,
		TagPill,
		KvList,
		Prose,
		Button
	} from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import Pricebox from './Pricebox.svelte';
	import { resolveProductImage, vercelImg, vercelSrcset } from '$lib/utils/image';
	import { resolve } from '$app/paths';
	import type { Component } from 'svelte';
	import type { ProductFrontmatter } from '$lib/types';
	import type { Region } from '$lib/utils/location';

	type Props = { data: { component: Component; product: ProductFrontmatter; region: Region } };
	let { data }: Props = $props();

	let activeIndex = $state(0);
	let Body = $derived(data.component);

	const galleryImages = $derived(
		data.product.images?.length
			? data.product.images.map((img) => resolveProductImage(img, data.product.id))
			: data.product.image
				? [resolveProductImage(data.product.image, data.product.id)]
				: []
	);

	const specItems = $derived(
		data.product.specs
			? Object.entries(data.product.specs).map(([key, value]) => ({ key, value: value as string }))
			: []
	);
</script>

<SEO
	title={data.product.name}
	description={data.product.description}
	image={galleryImages[0]}
	type="product"
	product={data.product}
	tags={data.product.tags}
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

<Container size="lg">
	<div class="back-row">
		<Button as="a" href={resolve('/catalogue/')} variant="back">← RETURN TO CATALOGUE</Button>
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
				<Prose><Body /></Prose>
			</div>
		</div>

		<div class="side">
			<Stack class="side-top" gap="sm">
				<Text variant="mono" color="dim" case="upper">
					{data.product.id} · {data.product.category}
				</Text>
				<Heading level={1} variant="title">{data.product.name}</Heading>
				{#if data.product.tags?.length}
					<Inline gap="xs">
						{#each data.product.tags as tag (tag)}
							<TagPill>{tag}</TagPill>
						{/each}
					</Inline>
				{/if}
				<Text color="dim" style="max-width: 48ch">{data.product.description}</Text>
			</Stack>

			<Stack class="side-bottom" gap="sm">
				{#if specItems.length}
					<Stack gap="xs">
						<Text variant="mono" size="xs" color="faint" case="upper">// QUICK SPECS</Text>
						<KvList items={specItems} />
					</Stack>
				{/if}

				<Pricebox product={data.product} region={data.region} />
			</Stack>
		</div>
	</div>
</Container>

<Container size="lg">
	<Signature />
</Container>

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
	:global(.side-top) {
		@container (max-width: 900px) {
			order: 1;
		}
	}
	:global(.side-bottom) {
		margin-top: 24px;

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
	.content {
		padding: 40px 0;
		border-top: 1px solid var(--rule);
	}
</style>
