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

<CrtOverlay />

<main class="product-layout">
	<HudHeader systemId="PRODUCT_DETAIL" />

	<nav class="breadcrumb">
		<a href="/catalogue">← BACK TO CATALOGUE</a>
	</nav>

	<article class="product-detail">
		<header class="product-header">
			<div class="header-content">
				<h1 class="product-title">{data.product.name}</h1>
				<StatusBadge status={data.product.status} />
			</div>

			<div class="product-meta">
				<span class="category">{data.product.category}</span>
				{#if data.product.tags.length > 0}
					<div class="tags">
						{#each data.product.tags as tag}
							<span class="tag">{tag}</span>
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

		<div class="product-content">
			<data.component />
		</div>

		<footer class="product-footer">
			{#if data.product.price}
				<div class="price-info">
					<span class="price-label">PRICE</span>
					<span class="price-value">${data.product.price}</span>
				</div>
			{/if}

			{#if data.product.status === 'available'}
				<a href={data.product.tindieUrl} target="_blank" rel="noopener noreferrer" class="tindie-btn">
					BUY ON TINDIE →
				</a>
			{:else if data.product.status === 'coming-soon'}
				<button class="tindie-btn disabled" disabled>COMING SOON</button>
			{:else}
				<button class="tindie-btn disabled" disabled>SOLD OUT</button>
			{/if}
		</footer>
	</article>
</main>

<style>
	.product-layout {
		min-height: 100vh;
		padding: 2rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.breadcrumb {
		margin: 2rem 0;
	}

	.breadcrumb a {
		color: var(--text-dim);
		text-decoration: none;
		font-size: 0.8rem;
		letter-spacing: 1px;
		transition: color 0.2s;
	}

	.breadcrumb a:hover {
		color: var(--cyber-red);
	}

	.product-detail {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.product-header {
		border-bottom: 1px solid var(--grid);
		padding-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.product-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 900;
		margin: 0;
		color: var(--text-main);
		text-shadow:
			2px 0 var(--cyber-red),
			-2px 0 var(--cyber-cyan);
	}

	.product-meta {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1rem;
	}

	.category {
		font-size: 0.75rem;
		color: var(--cyber-red);
		text-transform: uppercase;
		letter-spacing: 2px;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tag {
		font-size: 0.7rem;
		color: var(--text-dim);
		border: 1px solid var(--grid);
		padding: 0.25rem 0.5rem;
		letter-spacing: 1px;
	}

	.product-description {
		color: var(--text-main);
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
	}

	.product-image {
		width: 100%;
		border: 1px solid var(--grid);
		overflow: hidden;
		background: var(--void);
	}

	.product-image img {
		width: 100%;
		height: auto;
		display: block;
	}

	.product-content {
		border: 1px solid var(--grid);
		padding: 2rem;
		background: rgba(0, 0, 0, 0.3);
		line-height: 1.8;
	}

	.product-content :global(h2) {
		color: var(--cyber-cyan);
		font-size: 1.2rem;
		margin: 2rem 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 2px;
	}

	.product-content :global(h3) {
		color: var(--text-main);
		font-size: 1rem;
		margin: 1.5rem 0 0.75rem 0;
	}

	.product-content :global(p) {
		color: var(--text-dim);
		margin: 0 0 1rem 0;
	}

	.product-content :global(ul),
	.product-content :global(ol) {
		color: var(--text-dim);
		margin: 1rem 0;
		padding-left: 2rem;
	}

	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
		border: 1px solid var(--cyber-red);
		background: rgba(255, 42, 109, 0.05);
	}

	.price-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.price-label {
		font-size: 0.7rem;
		color: var(--text-dim);
		letter-spacing: 2px;
	}

	.price-value {
		font-size: 2rem;
		font-weight: 900;
		color: var(--cyber-cyan);
	}

	.tindie-btn {
		background: var(--cyber-red);
		color: var(--void);
		border: none;
		padding: 1rem 2rem;
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 2px;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
		transition: all 0.3s ease;
		font-family: var(--font-mono);
		box-shadow: 0 0 20px rgba(255, 42, 109, 0.5);
	}

	.tindie-btn:hover:not(.disabled) {
		background: var(--text-main);
		box-shadow: 0 0 30px rgba(255, 42, 109, 0.8);
		transform: translateY(-2px);
	}

	.tindie-btn.disabled {
		background: var(--grid);
		color: var(--text-dim);
		cursor: not-allowed;
		box-shadow: none;
	}

	@media (max-width: 600px) {
		.header-content {
			flex-direction: column;
		}

		.product-footer {
			flex-direction: column;
			align-items: stretch;
		}

		.tindie-btn {
			width: 100%;
			text-align: center;
		}
	}
</style>
