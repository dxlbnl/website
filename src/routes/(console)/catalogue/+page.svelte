<script lang="ts">
	import type { ProductFrontmatter } from '$lib/types';
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
	<PageHeader title="THE CATALOGUE" description="HARDWARE // SCHEMATICS // EURORACK MODULES" />

	<nav class="category-filter">
		{#each categories as category}
			<button
				class:active={selectedCategory === category}
				onclick={() => (selectedCategory = category)}
			>
				{#if selectedCategory === category}
					[{category.toUpperCase()}]
				{:else}
					{category.toUpperCase()}
				{/if}
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
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.category-filter {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--grid);
	}

	.category-filter button {
		padding: 0.5rem 1rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-dim);
		border: 1px solid transparent;
		transition: all 0.1s ease;
	}

	.category-filter button:hover {
		color: var(--text-main);
	}

	.category-filter button.active {
		color: var(--cyber-cyan);
		border-color: var(--grid);
		background: rgba(0, 240, 255, 0.03);
	}

	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1rem;
		margin-bottom: 4rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		border: 1px solid var(--grid);
		background: var(--void);
		font-family: var(--font-mono);
	}

	.empty-state p {
		color: var(--text-main);
		font-size: 0.9rem;
		letter-spacing: 1px;
		margin: 0.5rem 0;
	}

	.empty-state .dim {
		color: var(--text-dim);
		font-size: 0.75rem;
	}

	@media (max-width: 600px) {
		.products-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
