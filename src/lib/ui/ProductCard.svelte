<script lang="ts">
	import type { ProductFrontmatter } from '$lib/types';

	type Props = { product: ProductFrontmatter };
	let { product }: Props = $props();

	const stockMap: Record<string, { label: string; cls: string }> = {
		available: { label: 'IN STOCK', cls: 'ok' },
		'sold-out': { label: 'LOW STOCK', cls: 'low' },
		'coming-soon': { label: 'PREORDER', cls: 'out' }
	};
	const stock = $derived(stockMap[product.status] ?? { label: product.status, cls: '' });
	const cta = $derived(product.status === 'coming-soon' ? 'PREORDER' : 'ADD TO RACK');
</script>

<a href="/catalogue/{product.id}" class="card">
	<div class="img">
		{#if product.image}
			<img src={product.image} alt={product.name} />
		{:else}
			{product.id.toUpperCase()} · PRODUCT SHOT
		{/if}
	</div>
	<div class="body">
		<div class="sku">{product.id.toUpperCase()}</div>
		<h3 class="title">{product.name}</h3>
		<p class="desc">{product.description}</p>
		<div class="meta">
			<span class="price">{product.price ? `€${product.price}` : '—'}</span>
			<span class="stock {stock.cls}">{stock.label}</span>
		</div>
	</div>
	<div class="cta">
		<span>{cta}</span>
		<span>→</span>
	</div>
</a>

<style>
	.card {
		border: 1px solid var(--rule);
		background: var(--bg-rail);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.img {
		aspect-ratio: 1;
		background: repeating-linear-gradient(135deg, var(--bg-sunken) 0 10px, var(--bg-elev) 10px 20px);
		border-bottom: 1px solid var(--rule);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
		letter-spacing: 0.12em;
		overflow: hidden;
	}
	.img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.body {
		padding: 12px 14px 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
	}
	.sku {
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
		letter-spacing: 0.12em;
	}
	.title {
		font-weight: 500;
		font-size: 18px;
		letter-spacing: -0.01em;
		line-height: 1.2;
	}
	.desc {
		font-size: 12px;
		color: var(--ink-dim);
		line-height: 1.4;
	}
	.meta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-top: auto;
		padding-top: 8px;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.price {
		font-size: 15px;
		color: var(--amber);
	}
	.stock.ok {
		color: var(--ok);
	}
	.stock.low {
		color: var(--amber);
	}
	.stock.out {
		color: var(--ink-faint);
	}
	.cta {
		border-top: 1px solid var(--rule);
		padding: 10px 14px;
		display: flex;
		justify-content: space-between;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-dim);
		transition: background 0.15s, color 0.15s;
	}
	.card:hover .cta {
		background: var(--amber);
		color: var(--bg);
	}
</style>
