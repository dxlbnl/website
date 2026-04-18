<script lang="ts">
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import Img from '$lib/ui/Img.svelte';
	import { resolveLogImage } from '$lib/utils/image';
	import type { Component, SvelteComponent } from 'svelte';
	import type { RepositoryFrontmatter } from '$lib/types';

	type Props = {
		data: {
			component: Component<SvelteComponent>;
			metadata: RepositoryFrontmatter;
		};
	};

	let { data }: Props = $props();

	// Provide the slug to child components (like Img.svelte)
	setContext('repository-slug', page.params.slug);

	let activeImageIndex = $state(0);
	const rawImages = $derived(data.metadata.images || []);
	const images = $derived(rawImages.map(img => resolveLogImage(img, page.params.slug)));

	function nextImage() {
		activeImageIndex = (activeImageIndex + 1) % images.length;
	}

	function prevImage() {
		activeImageIndex = (activeImageIndex - 1 + images.length) % images.length;
	}
</script>

<svelte:head>
	<title>{data.metadata.title} | Dexterlabs Console</title>
</svelte:head>

<main class="log-viewport">
	<article class="log-content">
		<header class="log-header">
			<h1>{data.metadata.title}</h1>
			<div class="log-meta">
				<span class="log-date">{data.metadata.date.split('T')[0]}</span>
				<div class="log-tags">{data.metadata.tags.join(' // ')}</div>
			</div>
		</header>

		{#if images.length > 0}
			<div class="log-gallery">
				<div class="gallery-viewport">
					<img
						src={images[activeImageIndex]}
						alt="Log hero"
						class="hero-image"
						loading="eager"
					/>
					
					<div class="gallery-controls">
						<div class="click-regions">
							<button onclick={prevImage} class="region prev" aria-label="Previous image"></button>
							<button onclick={nextImage} class="region next" aria-label="Next image"></button>
						</div>

						{#if images.length > 1}
							<div class="gallery-nav">
								<button onclick={prevImage} aria-label="Previous image">&larr;</button>
								<span class="gallery-counter">{activeImageIndex + 1} / {images.length}</span>
								<button onclick={nextImage} aria-label="Next image">&rarr;</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
		
		<div class="markdown-body">
			<data.component components={{ img: Img }} />
		</div>

		<footer class="log-footer">
			<a href="/repository" class="back-link">&larr; ABORT & RETURN TO REPOSITORY DIRECTORY</a>
		</footer>
	</article>
</main>

<style>
	.log-viewport {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
	}

	.log-content {
		max-width: 800px;
		width: 100%;
		background: var(--void);
		padding: 3rem;
		border: 1px solid var(--grid);
	}

	.log-header {
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--grid);
		padding-bottom: 1.5rem;
	}

	.log-gallery {
		margin-bottom: 3rem;
		border: 1px solid var(--grid);
		background: var(--void);
		position: relative;
	}

	.gallery-viewport {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.hero-image {
		width: 100%;
		height: auto;
		display: block;
		aspect-ratio: 16/9;
		object-fit: cover;
	}

	.click-regions {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		z-index: 10;
	}

	.region {
		flex: 1;
		background: transparent;
		border: none;
		cursor: pointer;
		outline: none;
		transition: background 0.2s ease;
	}

	.region.prev {
		cursor: w-resize;
	}

	.region.next {
		cursor: e-resize;
	}

	/* Optional: subtle feedback on click/hover */
	.region:active {
		background: rgba(255, 255, 255, 0.05);
	}

	.gallery-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-top: 1px solid var(--grid);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-dim);
		position: relative;
		z-index: 20;
		background: var(--void);
	}

	.gallery-nav button {
		background: none;
		border: none;
		color: var(--text-main);
		cursor: pointer;
		font-family: var(--font-mono);
		padding: 0.5rem;
		transition: color 0.1s;
	}

	.gallery-nav button:hover {
		color: var(--cyber-cyan);
	}

	.gallery-counter {
		letter-spacing: 2px;
	}

	.log-meta {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 2rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-dim);
		letter-spacing: 1px;
		margin-top: 1rem;
	}

	.log-tags {
		text-align: right;
		max-width: 70%;
		line-height: 1.4;
	}

	.log-header h1 {
		font-family: var(--font-mono);
		color: var(--text-main);
		text-transform: uppercase;
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0;
	}

	.markdown-body {
		font-family: var(--font-mono);
		color: var(--text-main);
		line-height: 1.6;
		font-size: 0.95rem;
	}

	:global(.markdown-body p) {
		margin-bottom: 1.5rem;
	}

	.log-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--grid);
	}

	.back-link {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-dim);
		text-decoration: none;
		letter-spacing: 1px;
		transition: color 0.1s;
	}

	.back-link:hover {
		color: var(--cyber-cyan);
	}
</style>
