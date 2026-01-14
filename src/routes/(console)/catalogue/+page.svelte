<script lang="ts">
	import type { ProductFrontmatter } from '$lib/types';
	import CrtOverlay from '$lib/ui/Overlay.svelte';
	import HudHeader from '$lib/ui/HudHeader.svelte';
	import PageHeader from '$lib/ui/PageHeader.svelte';
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

<main class="catalogue-layout">
	<CrtOverlay />

	<HudHeader systemId="CATALOGUE_MATRIX" />

	<PageHeader title="THE CATALOGUE" description="HARDWARE // SCHEMATICS // EURORACK MODULES" />

	<nav class="category-filter">
		{#each categories as category}
			<button
				class:active={selectedCategory === category}
				class:red={selectedCategory === category}
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
		position: relative;
		min-height: 100vh;
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.category-filter {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--grid);
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
