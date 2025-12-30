<script lang="ts">
	import type { ProductFrontmatter } from '$lib/types';
	import CrtOverlay from '$lib/ui/Overlay.svelte';
	import HudHeader from '$lib/ui/HudHeader.svelte';
	import ProductCard from '$lib/ui/ProductCard.svelte';

	type Props = {
		data: { products: ProductFrontmatter[] };
	};

	let { data }: Props = $props();

	let selectedCategory = $state<string>('all');

	const categories = $derived([
		'all',
		...new Set(data.products.map((p) => p.category))
	]);

	const filteredProducts = $derived(
		selectedCategory === 'all'
			? data.products
			: data.products.filter((p) => p.category === selectedCategory)
	);
</script>

<CrtOverlay />

<main class="catalogue-layout">
	<HudHeader systemId="CATALOGUE_MATRIX" />

	<section class="catalogue-header">
		<h1 class="catalogue-title">THE CATALOGUE</h1>
		<p class="catalogue-desc">HARDWARE // SCHEMATICS // EURORACK MODULES</p>
	</section>

	<nav class="category-filter">
		{#each categories as category}
			<button
				class="filter-btn"
				class:active={selectedCategory === category}
				onclick={() => (selectedCategory = category)}
			>
				{category.toUpperCase()}
			</button>
		{/each}
	</nav>

	{#if filteredProducts.length === 0}
		<div class="empty-state">
			<p>NO PRODUCTS FOUND IN THIS CATEGORY</p>
			<p class="dim">CHECK BACK SOON FOR NEW HARDWARE</p>
		</div>
	{:else}
		<div class="products-grid">
			{#each filteredProducts as product}
				<ProductCard {product} />
			{/each}
		</div>
	{/if}
</main>

<style>
	.catalogue-layout {
		min-height: 100vh;
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.catalogue-header {
		margin: 3rem 0;
	}

	.catalogue-title {
		font-size: clamp(2.5rem, 8vw, 5rem);
		font-weight: 900;
		margin: 0;
		color: var(--text-main);
		text-shadow:
			2px 0 var(--cyber-red),
			-2px 0 var(--cyber-cyan);
	}

	.catalogue-desc {
		color: var(--text-dim);
		font-size: 0.85rem;
		letter-spacing: 2px;
		margin: 1rem 0 0 0;
	}

	.category-filter {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--grid);
	}

	.filter-btn {
		background: transparent;
		border: 1px solid var(--grid);
		color: var(--text-dim);
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		letter-spacing: 1px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: var(--font-mono);
	}

	.filter-btn:hover {
		border-color: var(--cyber-red);
		color: var(--cyber-red);
	}

	.filter-btn.active {
		background: var(--cyber-red);
		border-color: var(--cyber-red);
		color: var(--void);
		box-shadow: 0 0 15px rgba(255, 42, 109, 0.5);
	}

	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		border: 1px solid var(--grid);
		background: rgba(0, 0, 0, 0.3);
	}

	.empty-state p {
		color: var(--cyber-red);
		font-size: 0.9rem;
		letter-spacing: 2px;
		margin: 0.5rem 0;
	}

	.empty-state .dim {
		color: var(--text-dim);
		font-size: 0.7rem;
	}

	@media (max-width: 600px) {
		.products-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
