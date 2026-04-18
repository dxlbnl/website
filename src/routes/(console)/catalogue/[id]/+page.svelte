<script lang="ts">
	import type { ProductFrontmatter } from '$lib/types';
	import type { Component } from 'svelte';
	import CrtOverlay from '$lib/ui/Overlay.svelte';
	import HudHeader from '$lib/ui/HudHeader.svelte';
	import StatusBadge from '$lib/ui/StatusBadge.svelte';
	import ProductSpecs from '$lib/ui/ProductSpecs.svelte';

	type Props = {
		data: {
			component: Component;
			product: ProductFrontmatter;
		};
	};

	let { data }: Props = $props();
</script>

<main class="product-viewport">
	<nav class="detail-nav">
		<a href="/catalogue" class="back-link">← RETURN TO CATALOGUE DIRECTORY</a>
	</nav>

	<article class="product-content">
		<header class="product-header">
			<div class="header-main">
				<h1 class="product-title">{data.product.name}</h1>
				<StatusBadge status={data.product.status} />
			</div>

			<div class="product-meta">
				<span class="category">{data.product.category}</span>
				{#if data.product.tags.length > 0}
					<div class="tags">
						{#each data.product.tags as tag}
							<span class="tag">[{tag}]</span>
						{/each}
					</div>
				{/if}
			</div>

			<p class="product-description">{data.product.description}</p>
		</header>

		{#if data.product.image}
			<div class="product-image">
				<img src={data.product.image} alt={data.product.name} />
			</div>
		{/if}

		{#if data.product.specs}
			<ProductSpecs specs={data.product.specs} />
		{/if}

		<div class="markdown-body">
			<data.component />
		</div>

		<footer class="product-footer">
			{#if data.product.price}
				<div class="price-info">
					<span class="price-label">EST. COST</span>
					<span class="price-value">${data.product.price}</span>
				</div>
			{/if}

			<div class="actions">
				{#if data.product.status === 'available'}
					<a href={data.product.tindieUrl} target="_blank" rel="noopener noreferrer" class="action-btn cyan">
						INITIATE_PURCHASE →
					</a>
				{:else}
					<button class="action-btn disabled" disabled>[ OFFLINE ]</button>
				{/if}
			</div>
		</footer>
	</article>
</main>

<style>
	.product-viewport {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
	}

	.detail-nav {
		max-width: 900px;
		width: 100%;
		margin-bottom: 2rem;
	}

	.back-link {
		color: var(--text-dim);
		text-decoration: none;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 1px;
		transition: color 0.1s;
	}

	.back-link:hover {
		color: var(--cyber-cyan);
	}

	.product-content {
		max-width: 900px;
		width: 100%;
		background: var(--void);
		border: 1px solid var(--grid);
	}

	.product-header {
		padding: 3rem;
		border-bottom: 1px solid var(--grid);
	}

	.header-main {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.product-title {
		font-family: var(--font-mono);
		font-size: clamp(1.5rem, 5vw, 2.5rem);
		font-weight: 800;
		margin: 0;
		color: var(--text-main);
		text-transform: uppercase;
		line-height: 1;
	}

	.product-meta {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		margin-bottom: 2rem;
		font-family: var(--font-mono);
	}

	.category {
		font-size: 0.75rem;
		color: var(--cyber-cyan);
		letter-spacing: 1px;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
	}

	.tag {
		font-size: 0.7rem;
		color: var(--text-dim);
	}

	.product-description {
		color: var(--text-dim);
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0;
		max-width: 600px;
	}

	.product-image {
		width: 100%;
		background: var(--grid);
		border-bottom: 1px solid var(--grid);
		display: flex;
		justify-content: center;
	}

	.product-image img {
		max-width: 100%;
		height: auto;
		display: block;
	}

	.markdown-body {
		padding: 3rem;
		font-family: var(--font-mono);
		color: var(--text-main);
		line-height: 1.8;
		font-size: 0.95rem;
	}

	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 2rem;
		padding: 3rem;
		border-top: 1px solid var(--grid);
		background: rgba(255, 255, 255, 0.02);
	}

	.price-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-family: var(--font-mono);
	}

	.price-label {
		font-size: 0.7rem;
		color: var(--text-dim);
	}

	.price-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
	}

	.action-btn {
		background: transparent;
		color: var(--text-main);
		border: 1px solid var(--grid);
		padding: 1rem 2rem;
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 1px;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
		transition: all 0.1s ease;
		font-family: var(--font-mono);
	}

	.action-btn:hover:not(.disabled) {
		background: var(--text-main);
		color: var(--void);
		border-color: var(--text-main);
	}

	.action-btn.cyan {
		border-color: var(--cyber-cyan);
		color: var(--cyber-cyan);
	}

	.action-btn.cyan:hover {
		background: var(--cyber-cyan);
		color: var(--void);
	}

	.action-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 600px) {
		.header-main {
			flex-direction: column;
		}

		.product-footer {
			flex-direction: column;
			align-items: stretch;
		}

		.action-btn {
			width: 100%;
			text-align: center;
		}
	}
</style>
