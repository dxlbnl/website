<script lang="ts">
	import type { ProductFrontmatter } from '$lib/types';
	import StatusBadge from './StatusBadge.svelte';

	type Props = {
		product: ProductFrontmatter;
	};

	let { product }: Props = $props();
</script>

<a href="/catalogue/{product.id}" class="product-card">
	{#if product.image}
		<div class="product-image">
			<img src={product.image} alt={product.name} />
		</div>
	{:else}
		<div class="product-image placeholder">
			<span>NO IMAGE</span>
		</div>
	{/if}

	<div class="product-info">
		<div class="product-header">
			<h3 class="product-name">{product.name}</h3>
			<StatusBadge status={product.status} />
		</div>

		<p class="product-description">{product.description}</p>

		<div class="product-meta">
			<span class="category">{product.category}</span>
			{#if product.price}
				<span class="price">${product.price}</span>
			{/if}
		</div>
	</div>
</a>

<style>
	.product-card {
		display: block;
		text-decoration: none;
		border: 1px solid var(--grid);
		background: rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		overflow: hidden;
	}

	.product-card:hover {
		border-color: var(--cyber-red);
		box-shadow: 0 0 20px rgba(255, 42, 109, 0.3);
		transform: translateY(-2px);
	}

	.product-image {
		width: 100%;
		aspect-ratio: 16 / 9;
		background: var(--void);
		border-bottom: 1px solid var(--grid);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.product-card:hover .product-image img {
		transform: scale(1.05);
	}

	.product-image.placeholder {
		color: var(--text-dim);
		font-size: 0.7rem;
		letter-spacing: 2px;
	}

	.product-info {
		padding: 1.5rem;
	}

	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.product-name {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0;
		line-height: 1.2;
	}

	.product-description {
		color: var(--text-dim);
		font-size: 0.85rem;
		line-height: 1.5;
		margin: 0 0 1rem 0;
	}

	.product-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.75rem;
		color: var(--text-dim);
		letter-spacing: 1px;
	}

	.category {
		text-transform: uppercase;
	}

	.price {
		color: var(--cyber-cyan);
		font-weight: 600;
	}
</style>
