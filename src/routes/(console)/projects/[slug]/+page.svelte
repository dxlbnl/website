<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import ImageCarousel from '$lib/ui/ImageCarousel.svelte';
	import MarkdownBody from '$lib/ui/MarkdownBody.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import { resolve } from '$app/paths';
	import type { Component } from 'svelte';
	import type { ProjectFrontmatter } from '$lib/types';
	import { getPalette } from '$lib/theme.svelte';
	import { resolveProjectImage } from '$lib/utils/image';

	type Props = {
		data: {
			component: Component;
			metadata: ProjectFrontmatter;
			images: string[];
		};
	};
	let { data }: Props = $props();

	const heroSrc = $derived.by(() => {
		const isLight = getPalette() === 'paper';
		const src = (isLight ? data.metadata.imageLight : null) ?? data.metadata.image;
		return src ? resolveProjectImage(src) : null;
	});
</script>

<SEO
	title={data.metadata.title}
	description={data.metadata.description}
	image={heroSrc ?? data.images[0]}
	type="article"
/>

<div class="wrap">
	<article>
		<div class="eyebrow">
			{#each data.metadata.tags as tag, i (tag)}
				{#if i > 0}<span class="sep">·</span>{/if}{tag}
			{/each}
		</div>

		<h1>{data.metadata.title}</h1>
		<p class="lede">{data.metadata.description}</p>

		<div class="links">
			{#if data.metadata.url}
				<a href={data.metadata.url} class="btn-cta" target="_blank" rel="noopener noreferrer">
					VISIT →
				</a>
			{/if}
			{#if data.metadata.github}
				<a href={data.metadata.github} class="btn-ghost" target="_blank" rel="noopener noreferrer">
					GITHUB →
				</a>
			{/if}
		</div>

		{#if heroSrc}
			<img class="hero-img" src={heroSrc} alt={data.metadata.title} />
		{:else if data.images.length > 0}
			<ImageCarousel images={data.images} />
		{/if}

		<MarkdownBody component={data.component} />
	</article>

	<div class="post-foot">
		<a href={resolve('/projects/')} class="btn-back">← BACK TO PROJECTS</a>
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
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-bottom: 16px;
	}
	.sep {
		margin: 0 6px;
	}
	h1 {
		font-size: var(--t-h1);
		font-weight: 500;
		letter-spacing: -0.03em;
		line-height: 1.05;
		margin: 0 0 16px;
	}
	.lede {
		font-size: var(--t-lede);
		color: var(--ink-dim);
		line-height: 1.55;
		margin: 0 0 24px;
	}
	.links {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 32px;
	}
	.hero-img {
		width: 100%;
		border: 1px solid var(--rule);
		display: block;
		margin-bottom: 32px;
	}
	.post-foot {
		max-width: 68ch;
		margin: 0 auto;
		padding-top: 32px;
		border-top: 1px solid var(--rule);
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.signed {
		color: var(--ink-faint);
	}
</style>
