<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import ImageCarousel from '$lib/ui/ImageCarousel.svelte';
	import MarkdownBody from '$lib/ui/MarkdownBody.svelte';
	import ProductCta from '$lib/ui/ProductCta.svelte';
	import { resolveLogImage } from '$lib/utils/image';
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import type { NoteFrontmatter, ProductFrontmatter } from '$lib/types';
	import SEO from '$lib/ui/SEO.svelte';
	import type { Region } from '$lib/utils/location';
	import { resolve } from '$app/paths';

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

		<MarkdownBody component={data.component} />

		{#if data.product}
			<ProductCta product={data.product} region={data.region} />
		{/if}
	</article>

	<div class="post-foot">
		<a href={resolve('/notes/')} class="btn-back">← BACK TO NOTES</a>
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
	h1 {
		font-weight: 500;
		font-size: var(--t-title);
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
	.signed {
		color: var(--ink-faint);
	}
</style>
