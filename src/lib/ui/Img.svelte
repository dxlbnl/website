<script lang="ts">
	import { getContext } from 'svelte';
	import { resolveLogImage } from '$lib/utils/image';

	let { src, alt, ...rest } = $props();

	// Get the current repository slug from context
	const slug = getContext<string>('repository-slug');

	// Resolve the source path
	let resolvedSrc = $derived(resolveLogImage(src, slug || ''));
</script>

<figure class="markdown-image">
	<img src={resolvedSrc} {alt} {...rest} loading="lazy" />
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
		font-size: 0.7rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 1px;
	}
</style>
