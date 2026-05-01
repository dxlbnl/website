<script lang="ts">
	import { getContext } from 'svelte';
	import { resolveLogImage, vercelSrcset } from '$lib/utils/image';

	let { src, alt, ...rest } = $props();

	const slug = getContext<string>('note-slug');

	// Resolve the source path
	let resolvedSrc = $derived(resolveLogImage(src, slug || ''));
	let resolvedSrcset = $derived(vercelSrcset(resolvedSrc, [512, 768, 960, 1280]));
</script>

<figure class="markdown-image">
	<img
		src={resolvedSrc}
		srcset={resolvedSrcset}
		sizes="(max-width: 720px) calc(100vw - 32px), min(680px, calc(100vw - 64px))"
		{alt}
		{...rest}
		loading="lazy"
	/>
	{#if alt}
		<figcaption>{alt}</figcaption>
	{/if}
</figure>

<style>
	.markdown-image {
		margin: 2rem 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	img {
		max-width: 100%;
		height: auto;
		border: 1px solid var(--grid);
		background: var(--void);
	}

	figcaption {
		margin-top: 0.75rem;
		font-family: var(--font-mono);
		font-size: var(--t-mono);
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 1px;
	}
</style>
