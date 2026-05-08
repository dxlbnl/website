<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import ImageCarousel from '$lib/ui/ImageCarousel.svelte';
	import MarkdownBody from '$lib/ui/MarkdownBody.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import { resolve } from '$app/paths';
	import type { Component } from 'svelte';
	import type { ProjectFrontmatter } from '$lib/types';
	import { resolveProjectImage } from '$lib/utils/image';

	type Props = {
		data: {
			component: Component;
			metadata: ProjectFrontmatter;
			images: string[];
		};
	};
	let { data }: Props = $props();

	const heroDark = $derived(data.metadata.image ? resolveProjectImage(data.metadata.image) : null);
	const heroLight = $derived(data.metadata.imageLight ? resolveProjectImage(data.metadata.imageLight) : null);
</script>

<SEO
	title={data.metadata.title}
	description={data.metadata.description}
	image={heroDark ?? data.images[0]}
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
				<a href={data.metadata.github} class="btn-cta" target="_blank" rel="noopener noreferrer">
					GITHUB →
				</a>
			{/if}
		</div>

		{#if heroDark || heroLight}
			{#if heroDark}
				<img class="hero-img dark-img" src={heroDark} alt={data.metadata.title} />
			{/if}
			{#if heroLight}
				<img class="hero-img light-img" src={heroLight} alt={data.metadata.title} />
			{/if}
		{:else if data.images.length > 0}
			<ImageCarousel images={data.images} />
		{/if}

		<MarkdownBody component={data.component} />

		{#if data.metadata.stack}
			<div class="stack-label">// STACK</div>
			<table class="stack">
				<tbody>
					{#each Object.entries(data.metadata.stack) as [role, tech] (role)}
						<tr><td>{role}</td><td>{tech}</td></tr>
					{/each}
				</tbody>
			</table>
		{/if}
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
	:global([data-palette='paper']) .light-img { display: block; }
	:global([data-palette='paper']) .dark-img { display: none; }
	.light-img { display: none; }
	.stack-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin: 32px 0 4px;
	}
	.stack {
		border-collapse: collapse;
		font-family: var(--mono);
		font-size: var(--t-mono);
		margin-bottom: 32px;
	}
	.stack td {
		padding: 8px 0;
		border-bottom: 1px dashed var(--rule);
	}
	.stack td:first-child {
		color: var(--ink-dim);
		padding-right: 48px;
	}
	.stack td:last-child {
		color: var(--ink);
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
